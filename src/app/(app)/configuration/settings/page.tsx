'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Save,
  Bell,
  Shield,
  Database,
  Globe,
  Clock,
  Mail,
  Smartphone,
  Users,
  Key,
  RefreshCw,
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    tenant_name: 'Nigeria',
    tenant_code: 'NGA',
    timezone: 'Africa/Lagos',
    date_format: 'DD/MM/YYYY',
    epi_week_start: 'Monday',
    default_language: 'en',
    alert_email: 'alerts@ncdc.gov.ng',
    alert_sms: '+234800000000',
    data_retention_days: 365,
    auto_sync_interval: 60,
    enable_predictions: true,
    enable_alerts: true,
    enable_sms_notifications: false,
    enable_email_notifications: true,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground">
            Configure system-wide settings and preferences
          </p>
        </div>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tenant Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Tenant Configuration
            </CardTitle>
            <CardDescription>Basic tenant and localization settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tenant Name</label>
              <Input value={settings.tenant_name} onChange={(e) => setSettings({...settings, tenant_name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tenant Code</label>
              <Input value={settings.tenant_code} onChange={(e) => setSettings({...settings, tenant_code: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Timezone</label>
              <Input value={settings.timezone} onChange={(e) => setSettings({...settings, timezone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Date Format</label>
              <Input value={settings.date_format} onChange={(e) => setSettings({...settings, date_format: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Epidemiological Week Start</label>
              <Input value={settings.epi_week_start} onChange={(e) => setSettings({...settings, epi_week_start: e.target.value})} />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notification Settings
            </CardTitle>
            <CardDescription>Configure alert and notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Alert Email Address</label>
              <div className="flex gap-2">
                <Mail className="h-10 w-10 rounded-lg bg-muted p-2 text-muted-foreground" />
                <Input value={settings.alert_email} onChange={(e) => setSettings({...settings, alert_email: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Alert SMS Number</label>
              <div className="flex gap-2">
                <Smartphone className="h-10 w-10 rounded-lg bg-muted p-2 text-muted-foreground" />
                <Input value={settings.alert_sms} onChange={(e) => setSettings({...settings, alert_sms: e.target.value})} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Send alerts via email</p>
              </div>
              <Badge variant={settings.enable_email_notifications ? 'success' : 'secondary'}>
                {settings.enable_email_notifications ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-medium text-foreground">SMS Notifications</p>
                <p className="text-sm text-muted-foreground">Send alerts via SMS</p>
              </div>
              <Badge variant={settings.enable_sms_notifications ? 'success' : 'secondary'}>
                {settings.enable_sms_notifications ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Data Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Data & Sync Settings
            </CardTitle>
            <CardDescription>Configure data retention and synchronization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Data Retention (days)</label>
              <Input type="number" value={settings.data_retention_days} onChange={(e) => setSettings({...settings, data_retention_days: parseInt(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Auto-Sync Interval (minutes)</label>
              <Input type="number" value={settings.auto_sync_interval} onChange={(e) => setSettings({...settings, auto_sync_interval: parseInt(e.target.value)})} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Last Sync</p>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Sync Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feature Flags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Feature Settings
            </CardTitle>
            <CardDescription>Enable or disable system features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-medium text-foreground">AI Predictions</p>
                <p className="text-sm text-muted-foreground">Enable machine learning predictions</p>
              </div>
              <Badge variant={settings.enable_predictions ? 'success' : 'secondary'}>
                {settings.enable_predictions ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-medium text-foreground">Automated Alerts</p>
                <p className="text-sm text-muted-foreground">Enable threshold-based alerts</p>
              </div>
              <Badge variant={settings.enable_alerts ? 'success' : 'secondary'}>
                {settings.enable_alerts ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security & Access
            </CardTitle>
            <CardDescription>Security and access control settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <p className="font-medium text-foreground">Active Users</p>
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">24</p>
                <p className="text-sm text-muted-foreground">3 admins, 21 users</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <p className="font-medium text-foreground">API Keys</p>
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">5</p>
                <p className="text-sm text-muted-foreground">2 active integrations</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <p className="font-medium text-foreground">Session Timeout</p>
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">30 min</p>
                <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
