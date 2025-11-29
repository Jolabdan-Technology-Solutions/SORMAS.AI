'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const { currentTenant, currentUser } = useTenantStore();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  const canAccessConfig =
    currentUser?.role === 'global_admin' ||
    currentUser?.role === 'country_admin';

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <Activity className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-lg font-bold text-gray-900">SORMAS AI</h1>
          <p className="text-xs text-gray-500">Global Surveillance</p>
        </div>
      </div>

      {/* Tenant Selector */}
      {currentTenant && (
        <div className="border-b border-gray-200 px-4 py-3">
          <p className="text-xs font-medium text-gray-500">CURRENT COUNTRY</p>
          <p className="mt-1 font-medium text-gray-900">{currentTenant.name}</p>
          <span className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
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
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Data Management */}
        <div className="mt-6">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Data Management
          </p>
          <div className="space-y-1">
            {dataManagement.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Configuration (Admin only) */}
        {canAccessConfig && (
          <div className="mt-6">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Configuration
            </p>
            <div className="space-y-1">
              {configuration.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* User Info */}
      {currentUser && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
              {currentUser.full_name?.[0] || 'U'}
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium text-gray-900">
                {currentUser.full_name}
              </p>
              <p className="truncate text-xs text-gray-500">
                {currentUser.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
