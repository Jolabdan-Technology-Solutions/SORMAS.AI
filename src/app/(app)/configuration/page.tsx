'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Map,
  Activity,
  Database,
  Settings,
  Globe,
  Plus,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useTenantStore } from '@/lib/stores/tenant-store';

const configurationSections = [
  {
    title: 'Country Profile',
    description: 'Basic country information and settings',
    href: '/configuration/profile',
    icon: Globe,
    status: 'configured',
  },
  {
    title: 'Administrative Hierarchy',
    description: 'Define regions, districts, and administrative levels',
    href: '/configuration/hierarchy',
    icon: Map,
    status: 'configured',
  },
  {
    title: 'Disease Configuration',
    description: 'Enable and configure diseases for surveillance',
    href: '/configuration/diseases',
    icon: Activity,
    status: 'partial',
  },
  {
    title: 'Variable Mapping',
    description: 'Map external data fields to SORMAS AI schema',
    href: '/configuration/mapping',
    icon: Database,
    status: 'pending',
  },
  {
    title: 'General Settings',
    description: 'Date formats, timezone, and other preferences',
    href: '/configuration/settings',
    icon: Settings,
    status: 'configured',
  },
];

export default function ConfigurationPage() {
  const { currentTenant } = useTenantStore();
  const [setupStep] = useState(2); // Mock current setup step

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Country Configuration
          </h1>
          <p className="text-gray-500">
            Configure {currentTenant?.name || 'your country'} for disease
            surveillance
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Country
        </Button>
      </div>

      {/* Setup Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Progress</CardTitle>
          <CardDescription>
            Complete these steps to fully configure your country
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Progress Bar */}
            <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${(setupStep / 5) * 100}%` }}
              />
            </div>

            {/* Steps */}
            <div className="grid gap-4 md:grid-cols-5">
              {[
                { step: 1, title: 'Country Profile', done: true },
                { step: 2, title: 'Admin Hierarchy', done: true },
                { step: 3, title: 'Diseases', done: false, current: true },
                { step: 4, title: 'Data Sources', done: false },
                { step: 5, title: 'Variable Mapping', done: false },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center">
                  <div
                    className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full ${
                      item.done
                        ? 'bg-green-100 text-green-600'
                        : item.current
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {item.done ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{item.step}</span>
                    )}
                  </div>
                  <span
                    className={`text-center text-xs ${
                      item.done || item.current
                        ? 'font-medium text-gray-900'
                        : 'text-gray-500'
                    }`}
                  >
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Sections */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {configurationSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.title} href={section.href}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {section.title}
                      </CardTitle>
                    </div>
                  </div>
                  <Badge
                    variant={
                      section.status === 'configured'
                        ? 'success'
                        : section.status === 'partial'
                          ? 'warning'
                          : 'secondary'
                    }
                  >
                    {section.status === 'configured'
                      ? 'Complete'
                      : section.status === 'partial'
                        ? 'Partial'
                        : 'Pending'}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">{section.description}</p>
                  <div className="mt-4 flex items-center text-sm font-medium text-blue-600">
                    Configure
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="justify-start">
              <Map className="mr-2 h-4 w-4" />
              Import Admin Hierarchy CSV
            </Button>
            <Button variant="outline" className="justify-start">
              <Activity className="mr-2 h-4 w-4" />
              Enable Common Diseases
            </Button>
            <Button variant="outline" className="justify-start">
              <Database className="mr-2 h-4 w-4" />
              Connect Data Source
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
