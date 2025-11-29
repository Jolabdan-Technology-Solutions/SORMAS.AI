'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard,
  FileText,
  Users,
  Activity,
  Settings,
  Database,
  Globe,
  Bell,
  BarChart3,
  Upload,
  Map,
  Microscope,
  AlertTriangle,
  Zap,
  LogOut,
  User,
  ChevronDown,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useTenantStore } from '@/lib/stores/tenant-store';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Cases', href: '/cases', icon: FileText },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Events', href: '/events', icon: AlertTriangle },
  { name: 'Samples', href: '/samples', icon: Microscope },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Predictions', href: '/predictions', icon: Activity },
  { name: 'Alerts', href: '/alerts', icon: Bell },
];

const dataManagement = [
  { name: 'ETL Jobs', href: '/etl', icon: Database },
  { name: 'Data Import', href: '/etl/import', icon: Upload },
  { name: 'Data Sources', href: '/etl/sources', icon: Globe },
];

const configuration = [
  { name: 'Country Setup', href: '/configuration', icon: Map },
  { name: 'Admin Hierarchy', href: '/configuration/hierarchy', icon: Map },
  { name: 'Diseases', href: '/configuration/diseases', icon: Activity },
  { name: 'Variable Mapping', href: '/configuration/mapping', icon: Database },
  { name: 'Settings', href: '/configuration/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentTenant, currentUser } = useTenantStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  const canAccessConfig =
    currentUser?.role === 'global_admin' ||
    currentUser?.role === 'country_admin';

  const handleSignOut = () => {
    // In production, this would clear auth tokens and redirect to login
    router.push('/auth/login');
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">SORMAS AI</h1>
          <p className="text-xs text-muted-foreground">Global Surveillance</p>
        </div>
      </div>

      {/* Tenant Selector */}
      {currentTenant && (
        <div className="border-b border-border px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Current Country</p>
          <p className="mt-1 font-medium text-foreground">{currentTenant.name}</p>
          <span className="mt-1 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {currentTenant.code}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className={cn('h-5 w-5', active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground')} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Data Management */}
        <div className="mt-6">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Data Management
          </p>
          <div className="space-y-1">
            {dataManagement.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <Icon className={cn('h-5 w-5', active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground')} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Configuration (Admin only) */}
        {canAccessConfig && (
          <div className="mt-6">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Configuration
            </p>
            <div className="space-y-1">
              {configuration.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                      active
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <Icon className={cn('h-5 w-5', active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground')} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* User Profile Section */}
      {currentUser && (
        <div className="border-t border-border">
          {/* User Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex w-full items-center gap-3 p-4 transition-colors hover:bg-accent"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-sm font-medium text-primary-foreground">
                {currentUser.full_name?.[0] || 'U'}
              </div>
              <div className="flex-1 text-left">
                <p className="truncate text-sm font-medium text-foreground">
                  {currentUser.full_name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {currentUser.role.replace('_', ' ')}
                </p>
              </div>
              <ChevronDown className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                userMenuOpen && 'rotate-180'
              )} />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 animate-fade-in rounded-lg border border-border bg-popover p-2 shadow-xl">
                <div className="mb-2 border-b border-border px-3 py-2">
                  <p className="text-sm font-medium text-foreground">{currentUser.full_name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.email || 'user@ncdc.gov.ng'}</p>
                </div>

                <Link
                  href="/profile"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  View Profile
                </Link>

                <Link
                  href="/configuration/settings"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  Settings
                </Link>

                {canAccessConfig && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    Admin Panel
                  </Link>
                )}

                <Link
                  href="/help"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  Help & Support
                </Link>

                <div className="mt-2 border-t border-border pt-2">
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
