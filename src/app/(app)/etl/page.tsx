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
  Database,
  Upload,
  Globe,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  RefreshCw,
  Plus,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

// Mock ETL jobs data
const mockJobs = [
  {
    id: '1',
    name: 'SORMAS Nigeria Sync',
    dataSource: 'SORMAS API',
    type: 'api',
    status: 'completed',
    lastRun: '2024-01-15T10:30:00Z',
    nextRun: '2024-01-15T22:30:00Z',
    recordsProcessed: 1234,
    recordsCreated: 45,
    recordsUpdated: 89,
    recordsFailed: 2,
    isScheduled: true,
    schedule: '0 */12 * * *',
  },
  {
    id: '2',
    name: 'DHIS2 Weekly Import',
    dataSource: 'DHIS2 API',
    type: 'api',
    status: 'running',
    lastRun: '2024-01-15T08:00:00Z',
    nextRun: null,
    recordsProcessed: 567,
    recordsCreated: 120,
    recordsUpdated: 0,
    recordsFailed: 0,
    isScheduled: true,
    schedule: '0 8 * * 1',
  },
  {
    id: '3',
    name: 'Manual CSV Import',
    dataSource: 'CSV Upload',
    type: 'csv',
    status: 'failed',
    lastRun: '2024-01-14T16:45:00Z',
    nextRun: null,
    recordsProcessed: 0,
    recordsCreated: 0,
    recordsUpdated: 0,
    recordsFailed: 234,
    isScheduled: false,
    errorMessage: 'Invalid date format in column onset_date',
  },
];

const mockDataSources = [
  {
    id: '1',
    name: 'SORMAS Nigeria',
    type: 'api',
    status: 'connected',
    lastSync: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'DHIS2',
    type: 'api',
    status: 'connected',
    lastSync: '2024-01-15T08:00:00Z',
  },
  {
    id: '3',
    name: 'CSV Import',
    type: 'csv',
    status: 'ready',
    lastSync: null,
  },
];

export default function ETLPage() {
  const [filter, setFilter] = useState<'all' | 'running' | 'failed'>('all');

  const filteredJobs = mockJobs.filter((job) => {
    if (filter === 'all') return true;
    return job.status === filter;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ETL Pipeline Management
          </h1>
          <p className="text-gray-500">
            Manage data extraction, transformation, and loading jobs
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/etl/import">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
          </Link>
          <Link href="/etl/sources">
            <Button variant="outline">
              <Globe className="mr-2 h-4 w-4" />
              Manage Sources
            </Button>
          </Link>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Job
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Jobs</p>
                <p className="text-2xl font-bold">{mockJobs.length}</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Running</p>
                <p className="text-2xl font-bold">
                  {mockJobs.filter((j) => j.status === 'running').length}
                </p>
              </div>
              <RefreshCw className="h-8 w-8 animate-spin text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed Today</p>
                <p className="text-2xl font-bold">
                  {mockJobs.filter((j) => j.status === 'completed').length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Failed</p>
                <p className="text-2xl font-bold">
                  {mockJobs.filter((j) => j.status === 'failed').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Connected Data Sources</CardTitle>
              <CardDescription>
                External systems feeding data into SORMAS AI
              </CardDescription>
            </div>
            <Link href="/etl/sources">
              <Button variant="outline" size="sm">
                Manage Sources
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {mockDataSources.map((source) => (
              <div
                key={source.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center gap-3">
                  {source.type === 'api' ? (
                    <Globe className="h-8 w-8 text-blue-500" />
                  ) : (
                    <Upload className="h-8 w-8 text-green-500" />
                  )}
                  <div>
                    <p className="font-medium">{source.name}</p>
                    <p className="text-xs text-gray-500">
                      {source.lastSync
                        ? `Last sync: ${formatDate(source.lastSync)}`
                        : 'Ready for import'}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={source.status === 'connected' ? 'success' : 'secondary'}
                >
                  {source.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ETL Jobs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>ETL Jobs</CardTitle>
              <CardDescription>
                Data processing jobs and their status
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'running' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('running')}
              >
                Running
              </Button>
              <Button
                variant={filter === 'failed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('failed')}
              >
                Failed
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`rounded-full p-2 ${
                        job.status === 'completed'
                          ? 'bg-green-100'
                          : job.status === 'running'
                            ? 'bg-yellow-100'
                            : 'bg-red-100'
                      }`}
                    >
                      {job.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : job.status === 'running' ? (
                        <RefreshCw className="h-5 w-5 animate-spin text-yellow-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{job.name}</h3>
                        <Badge variant="outline">{job.dataSource}</Badge>
                        {job.isScheduled && (
                          <Badge variant="secondary">
                            <Clock className="mr-1 h-3 w-3" />
                            Scheduled
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Last run: {formatDate(job.lastRun)}
                        {job.nextRun && ` • Next: ${formatDate(job.nextRun)}`}
                      </p>
                      {job.status === 'failed' && job.errorMessage && (
                        <div className="mt-2 flex items-center gap-2 rounded bg-red-50 p-2 text-sm text-red-700">
                          <AlertCircle className="h-4 w-4" />
                          {job.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.status === 'running' ? (
                      <Button variant="outline" size="sm">
                        <Pause className="mr-1 h-4 w-4" />
                        Pause
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm">
                        <Play className="mr-1 h-4 w-4" />
                        Run Now
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      View Details
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                {job.status !== 'failed' && (
                  <div className="mt-4 grid grid-cols-4 gap-4 rounded-lg bg-gray-50 p-3">
                    <div>
                      <p className="text-xs text-gray-500">Processed</p>
                      <p className="font-medium">
                        {job.recordsProcessed.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="font-medium text-green-600">
                        +{job.recordsCreated.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Updated</p>
                      <p className="font-medium text-blue-600">
                        {job.recordsUpdated.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Failed</p>
                      <p className="font-medium text-red-600">
                        {job.recordsFailed.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
