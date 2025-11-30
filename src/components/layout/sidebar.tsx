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
  Brain,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { useTenantStore } from '@/lib/stores/tenant-store';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Cases', href: '/cases', icon: FileText },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Events', href: '/events', icon: AlertTriangle },
  { name: 'Samples', href: '/samples', icon: Microscope },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'AI Predictions', href: '/predictions', icon: Brain },
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
    router.push('/auth/login');
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/5 bg-[#050315]">
      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-purple-500/5" />

      {/* Logo */}
      <div className="relative flex h-16 items-center gap-3 border-b border-white/5 px-6">
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/25">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">SORMAS AI</h1>
          <p className="text-xs text-indigo-300/70">Global Surveillance</p>
        </div>
      </div>

      {/* Tenant Selector */}
      {currentTenant && (
        <div className="relative border-b border-white/5 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400/60">Current Country</p>
          <p className="mt-1 font-medium text-white">{currentTenant.name}</p>
          <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-xs font-medium text-indigo-300">
            <Globe className="h-3 w-3" />
            {currentTenant.code}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="relative flex-1 space-y-1 overflow-y-auto px-3 py-4">
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
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white shadow-lg shadow-indigo-500/10'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-400 to-purple-400" />
                )}
                <Icon className={cn(
                  'h-5 w-5 transition-colors',
                  active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400'
                )} />
                {item.name}
                {item.name === 'AI Predictions' && (
                  <Sparkles className="ml-auto h-3.5 w-3.5 text-purple-400 animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Data Management */}
        <div className="mt-6">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-indigo-400/60">
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
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white shadow-lg shadow-indigo-500/10'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  )}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-400 to-purple-400" />
                  )}
                  <Icon className={cn(
                    'h-5 w-5 transition-colors',
                    active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400'
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Configuration (Admin only) */}
        {canAccessConfig && (
          <div className="mt-6">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-indigo-400/60">
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
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      active
                        ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white shadow-lg shadow-indigo-500/10'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    {active && (
                      <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-400 to-purple-400" />
                    )}
                    <Icon className={cn(
                      'h-5 w-5 transition-colors',
                      active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400'
                    )} />
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
        <div className="relative border-t border-white/5">
          {/* User Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex w-full items-center gap-3 p-4 transition-colors hover:bg-white/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/25">
                {currentUser.full_name?.[0] || 'U'}
              </div>
              <div className="flex-1 text-left">
                <p className="truncate text-sm font-medium text-white">
                  {currentUser.full_name}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {currentUser.role.replace('_', ' ')}
                </p>
              </div>
              <ChevronDown className={cn(
                'h-4 w-4 text-slate-500 transition-transform duration-200',
                userMenuOpen && 'rotate-180'
              )} />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute bottom-full left-2 right-2 mb-2 animate-fade-in rounded-xl border border-white/10 bg-[#0a0820]/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
                <div className="mb-2 border-b border-white/10 px-3 py-2">
                  <p className="text-sm font-medium text-white">{currentUser.full_name}</p>
                  <p className="text-xs text-slate-500">{currentUser.email || 'user@ncdc.gov.ng'}</p>
                </div>

                <Link
                  href="/profile"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User className="h-4 w-4 text-indigo-400" />
                  View Profile
                </Link>

                <Link
                  href="/configuration/settings"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings className="h-4 w-4 text-indigo-400" />
                  Settings
                </Link>

                {canAccessConfig && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4 text-indigo-400" />
                    Admin Panel
                  </Link>
                )}

                <Link
                  href="/help"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <HelpCircle className="h-4 w-4 text-indigo-400" />
                  Help & Support
                </Link>

                <Link
                  href="/pricing"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <CreditCard className="h-4 w-4 text-indigo-400" />
                  Pricing & Plans
                </Link>

                <div className="mt-2 border-t border-white/10 pt-2">
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
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
