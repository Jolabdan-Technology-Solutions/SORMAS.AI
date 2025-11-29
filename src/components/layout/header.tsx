'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, Globe, LogOut, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { createClient } from '@/lib/supabase/client';
import { useTenantStore } from '@/lib/stores/tenant-store';
import { cn } from '@/lib/utils/cn';

export function Header() {
  const router = useRouter();
  const supabase = createClient();
  const { currentUser, availableTenants, currentTenant, setCurrentTenant, reset } =
    useTenantStore();
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

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

  const isGlobalAdmin = currentUser?.role === 'global_admin';

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search cases, contacts, events..."
            className="pl-10"
          />
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
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            3
          </span>
        </Button>

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
