'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bell,
  Search,
  Globe,
  LogOut,
  User,
  ChevronDown,
  FileText,
  Users,
  AlertTriangle,
  TestTube,
  Flame,
  Loader2,
  X,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { createClient } from '@/lib/supabase/client';
import { useTenantStore } from '@/lib/stores/tenant-store';
import { cn } from '@/lib/utils/cn';

// Default tenant ID - should come from auth context in production
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

interface SearchResult {
  id: string;
  type: 'case' | 'contact' | 'event' | 'sample';
  title: string;
  subtitle: string;
  status?: string;
}

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  is_read: boolean;
  created_at: string;
}

export function Header() {
  const router = useRouter();
  const supabase = createClient();
  const { currentUser, availableTenants, currentTenant, setCurrentTenant, reset } =
    useTenantStore();
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Notifications state
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch alerts on mount and periodically
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const timeout = setTimeout(async () => {
      await performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      const results: SearchResult[] = [];

      // Search cases
      const { data: cases } = await supabase
        .from('cases')
        .select('id, external_id, classification, person:persons(first_name, last_name)')
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .or(`external_id.ilike.%${query}%`)
        .limit(3);

      if (cases) {
        cases.forEach((c: any) => {
          const person = Array.isArray(c.person) ? c.person[0] : c.person;
          results.push({
            id: c.id,
            type: 'case',
            title: c.external_id,
            subtitle: person ? `${person.first_name} ${person.last_name}` : 'Unknown',
            status: c.classification,
          });
        });
      }

      // Search contacts
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id, external_id, follow_up_status, person:persons(first_name, last_name)')
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .or(`external_id.ilike.%${query}%`)
        .limit(3);

      if (contacts) {
        contacts.forEach((c: any) => {
          const person = Array.isArray(c.person) ? c.person[0] : c.person;
          results.push({
            id: c.id,
            type: 'contact',
            title: c.external_id,
            subtitle: person ? `${person.first_name} ${person.last_name}` : 'Unknown',
            status: c.follow_up_status,
          });
        });
      }

      // Search events
      const { data: events } = await supabase
        .from('events')
        .select('id, external_id, name, status')
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .or(`external_id.ilike.%${query}%,name.ilike.%${query}%`)
        .limit(3);

      if (events) {
        events.forEach((e: any) => {
          results.push({
            id: e.id,
            type: 'event',
            title: e.external_id,
            subtitle: e.name,
            status: e.status,
          });
        });
      }

      // Search samples
      const { data: samples } = await supabase
        .from('samples')
        .select('id, external_id, sample_type, test_result')
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .ilike('external_id', `%${query}%`)
        .limit(3);

      if (samples) {
        samples.forEach((s: any) => {
          results.push({
            id: s.id,
            type: 'sample',
            title: s.external_id,
            subtitle: s.sample_type?.replace(/_/g, ' ') || 'Unknown type',
            status: s.test_result,
          });
        });
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('id, alert_type, severity, title, description, is_read, created_at')
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setAlerts(data || []);
      setUnreadCount((data || []).filter((a) => !a.is_read).length);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoadingAlerts(false);
    }
  };

  const markAlertAsRead = async (alertId: string) => {
    try {
      await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, is_read: true } : a))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const markAllAlertsAsRead = async () => {
    try {
      const unreadIds = alerts.filter((a) => !a.is_read).map((a) => a.id);
      if (unreadIds.length === 0) return;

      await supabase
        .from('alerts')
        .update({ is_read: true })
        .in('id', unreadIds);

      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    reset();
    router.push('/auth/login');
  };

  const handleTenantChange = (tenantId: string) => {
    const tenant = availableTenants.find((t) => t.id === tenantId);
    if (tenant) {
      setCurrentTenant(tenant);
      setShowTenantDropdown(false);
    }
  };

  const handleSearchResultClick = (result: SearchResult) => {
    setShowSearchResults(false);
    setSearchQuery('');
    router.push(`/${result.type}s/${result.id}`);
  };

  const getSearchIcon = (type: string) => {
    switch (type) {
      case 'case':
        return <FileText className="h-4 w-4 text-primary" />;
      case 'contact':
        return <Users className="h-4 w-4 text-emerald-500" />;
      case 'event':
        return <Flame className="h-4 w-4 text-orange-500" />;
      case 'sample':
        return <TestTube className="h-4 w-4 text-violet-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'threshold_exceeded':
        return <AlertTriangle className="h-4 w-4" />;
      case 'prediction_warning':
        return <Flame className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const isGlobalAdmin = currentUser?.role === 'global_admin';

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
      {/* Search */}
      <div className="flex items-center gap-4" ref={searchRef}>
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search cases, contacts, events..."
            className="pl-10 pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
          {searchQuery && !isSearching && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
                setShowSearchResults(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute left-0 top-full mt-2 w-full rounded-xl border border-border bg-popover shadow-lg">
              {searchResults.length === 0 && !isSearching ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  {searchQuery.trim() ? 'No results found' : 'Start typing to search...'}
                </div>
              ) : (
                <div className="py-2">
                  {searchResults.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSearchResultClick(result)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent"
                    >
                      {getSearchIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-primary">{result.title}</span>
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {result.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                      </div>
                      {result.status && (
                        <Badge
                          variant={
                            result.status === 'confirmed' || result.status === 'positive'
                              ? 'destructive'
                              : result.status === 'negative' || result.status === 'closed'
                                ? 'success'
                                : 'secondary'
                          }
                          className="text-[10px]"
                        >
                          {result.status}
                        </Badge>
                      )}
                    </button>
                  ))}
                  {searchResults.length > 0 && (
                    <div className="border-t border-border mt-2 pt-2 px-4 pb-2">
                      <Link
                        href={`/cases?search=${encodeURIComponent(searchQuery)}`}
                        className="text-xs text-primary hover:underline"
                        onClick={() => setShowSearchResults(false)}
                      >
                        View all results for &quot;{searchQuery}&quot;
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Tenant Switcher (Global Admin only) */}
        {isGlobalAdmin && availableTenants.length > 1 && (
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowTenantDropdown(!showTenantDropdown)}
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              {currentTenant?.name || 'Select Country'}
              <ChevronDown className="h-4 w-4" />
            </Button>

            {showTenantDropdown && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-popover py-1 shadow-lg">
                {availableTenants.map((tenant) => (
                  <button
                    key={tenant.id}
                    onClick={() => handleTenantChange(tenant.id)}
                    className={cn(
                      'flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors hover:bg-accent',
                      currentTenant?.id === tenant.id && 'bg-primary/10 text-primary'
                    )}
                  >
                    <span className="font-medium">{tenant.name}</span>
                    <span className="text-xs text-muted-foreground">({tenant.code})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-popover shadow-lg">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAlertsAsRead}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {loadingAlerts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  <div className="py-1">
                    {alerts.map((alert) => (
                      <button
                        key={alert.id}
                        onClick={() => {
                          if (!alert.is_read) markAlertAsRead(alert.id);
                          setShowNotifications(false);
                          router.push('/alerts');
                        }}
                        className={cn(
                          'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent',
                          !alert.is_read && 'bg-primary/5'
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                            alert.severity === 'critical'
                              ? 'bg-destructive/20 text-destructive'
                              : alert.severity === 'warning'
                                ? 'bg-warning/20 text-warning'
                                : 'bg-primary/20 text-primary'
                          )}
                        >
                          {getAlertIcon(alert.alert_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">
                              {alert.title}
                            </p>
                            {!alert.is_read && (
                              <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {alert.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={
                                alert.severity === 'critical'
                                  ? 'destructive'
                                  : alert.severity === 'warning'
                                    ? 'warning'
                                    : 'secondary'
                              }
                              className="text-[10px]"
                            >
                              {alert.severity}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {formatTimeAgo(alert.created_at)}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-border px-4 py-2">
                <Link
                  href="/alerts"
                  className="block text-center text-xs text-primary hover:underline"
                  onClick={() => setShowNotifications(false)}
                >
                  View all alerts
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>

          {showUserDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-popover py-1 shadow-lg">
              <div className="border-b border-border px-4 py-3">
                <p className="font-medium text-foreground">
                  {currentUser?.full_name}
                </p>
                <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
              </div>
              <Link
                href="/profile"
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent"
                onClick={() => setShowUserDropdown(false)}
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
