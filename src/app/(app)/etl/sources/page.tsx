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
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  Globe,
  Database,
  FileText,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Play,
  Pause,
  ExternalLink,
} from 'lucide-react';

const dataSources = [
  {
    id: 1,
    name: 'DHIS2 Nigeria',
    type: 'API',
    url: 'https://dhis2.nigeria.gov.ng/api',
    status: 'connected',
    last_sync: '2024-01-28T14:30:00',
    records_synced: 12456,
    sync_frequency: 'Every 1 hour',
    enabled: true,
    error: null,
  },
  {
    id: 2,
    name: 'SORMAS Legacy',
    type: 'Database',
    url: 'postgresql://sormas-prod.ncdc.gov.ng:5432/sormas',
    status: 'connected',
    last_sync: '2024-01-28T12:00:00',
    records_synced: 45678,
    sync_frequency: 'Every 6 hours',
    enabled: true,
    error: null,
  },
  {
    id: 3,
    name: 'Lab Results Feed',
    type: 'API',
    url: 'https://lab.ncdc.gov.ng/api/v1/results',
    status: 'connected',
    last_sync: '2024-01-28T13:45:00',
    records_synced: 3456,
    sync_frequency: 'Every 30 minutes',
    enabled: true,
    error: null,
  },
  {
    id: 4,
    name: 'WHO IHR Data',
    type: 'API',
    url: 'https://extranet.who.int/ihr/api',
    status: 'error',
    last_sync: '2024-01-27T08:00:00',
    records_synced: 0,
    sync_frequency: 'Daily',
    enabled: true,
    error: 'Authentication failed - API key expired',
  },
  {
    id: 5,
    name: 'State Reports CSV',
    type: 'File',
    url: '/data/uploads/state-reports/',
    status: 'idle',
    last_sync: '2024-01-26T10:00:00',
    records_synced: 890,
    sync_frequency: 'Manual',
    enabled: true,
    error: null,
  },
];

const syncHistory = [
  { id: 1, source: 'DHIS2 Nigeria', time: '2024-01-28T14:30:00', records: 234, status: 'success', duration: '45s' },
  { id: 2, source: 'Lab Results Feed', time: '2024-01-28T13:45:00', records: 56, status: 'success', duration: '12s' },
  { id: 3, source: 'SORMAS Legacy', time: '2024-01-28T12:00:00', records: 1234, status: 'success', duration: '2m 30s' },
  { id: 4, source: 'WHO IHR Data', time: '2024-01-27T08:00:00', records: 0, status: 'failed', duration: '5s' },
  { id: 5, source: 'DHIS2 Nigeria', time: '2024-01-28T13:30:00', records: 189, status: 'success', duration: '38s' },
];

export default function DataSourcesPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="success"><CheckCircle className="mr-1 h-3 w-3" /> Connected</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> Error</Badge>;
      case 'idle':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" /> Idle</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'API':
        return <Globe className="h-5 w-5" />;
      case 'Database':
        return <Database className="h-5 w-5" />;
      case 'File':
        return <FileText className="h-5 w-5" />;
      default:
        return <Database className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Data Sources</h1>
          <p className="text-muted-foreground">
            Manage external data sources and integrations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync All
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Source
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sources</p>
                <p className="text-2xl font-bold text-foreground">{dataSources.length}</p>
              </div>
              <Database className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Connected</p>
                <p className="text-2xl font-bold text-foreground">{dataSources.filter(s => s.status === 'connected').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-foreground">{dataSources.filter(s => s.status === 'error').length}</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Records Synced</p>
                <p className="text-2xl font-bold text-foreground">{dataSources.reduce((s, d) => s + d.records_synced, 0).toLocaleString()}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Sources */}
      <div className="space-y-4">
        {dataSources.map((source) => (
          <Card key={source.id} className={source.status === 'error' ? 'border-destructive/50' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    source.status === 'connected' ? 'bg-success/20 text-success' :
                    source.status === 'error' ? 'bg-destructive/20 text-destructive' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {getTypeIcon(source.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{source.name}</h3>
                      {getStatusBadge(source.status)}
                      <Badge variant="outline">{source.type}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{source.url}</p>
                    {source.error && (
                      <p className="mt-2 text-sm text-destructive">{source.error}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {source.enabled ? (
                    <Button variant="outline" size="sm">
                      <Pause className="mr-1 h-4 w-4" />
                      Pause
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm">
                      <Play className="mr-1 h-4 w-4" />
                      Enable
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <RefreshCw className="mr-1 h-4 w-4" />
                    Sync
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Last Sync</p>
                  <p className="font-medium text-foreground">{formatDate(source.last_sync)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Records Synced</p>
                  <p className="font-medium text-foreground">{source.records_synced.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Sync Frequency</p>
                  <p className="font-medium text-foreground">{source.sync_frequency}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-medium text-foreground">{source.enabled ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sync History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sync History</CardTitle>
          <CardDescription>Latest data synchronization activities</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Time</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Records</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Duration</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {syncHistory.map((sync) => (
                  <tr key={sync.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium text-foreground">{sync.source}</td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(sync.time)}</td>
                    <td className="px-6 py-4 text-center text-foreground">{sync.records.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center text-muted-foreground">{sync.duration}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={sync.status === 'success' ? 'success' : 'destructive'}>
                        {sync.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
