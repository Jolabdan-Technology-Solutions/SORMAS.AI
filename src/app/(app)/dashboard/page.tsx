'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
} from 'lucide-react';

// Mock data - will be replaced with real data from Supabase
const stats = [
  {
    title: 'Total Cases',
    value: '12,456',
    change: '+12%',
    trend: 'up',
    icon: FileText,
    color: 'blue',
  },
  {
    title: 'Active Contacts',
    value: '3,890',
    change: '-5%',
    trend: 'down',
    icon: Users,
    color: 'green',
  },
  {
    title: 'Active Outbreaks',
    value: '8',
    change: '0%',
    trend: 'neutral',
    icon: AlertTriangle,
    color: 'red',
  },
  {
    title: 'Predictions Active',
    value: '24',
    change: '+3',
    trend: 'up',
    icon: Activity,
    color: 'purple',
  },
];

const recentAlerts = [
  {
    id: 1,
    type: 'threshold_exceeded',
    severity: 'critical',
    title: 'Cholera cases above threshold in Lagos State',
    time: '2 hours ago',
  },
  {
    id: 2,
    type: 'prediction_warning',
    severity: 'warning',
    title: 'Predicted spike in Malaria cases in Kano',
    time: '5 hours ago',
  },
  {
    id: 3,
    type: 'unusual_pattern',
    severity: 'info',
    title: 'Unusual cluster detected in Ogun State',
    time: '1 day ago',
  },
];

const topDiseases = [
  { name: 'Cholera', cases: 2340, change: 15 },
  { name: 'Malaria', cases: 5678, change: -8 },
  { name: 'COVID-19', cases: 1234, change: 5 },
  { name: 'Measles', cases: 890, change: 22 },
  { name: 'Lassa Fever', cases: 45, change: -12 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">
          Overview of disease surveillance and predictions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon =
            stat.trend === 'up'
              ? TrendingUp
              : stat.trend === 'down'
                ? TrendingDown
                : Minus;

          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {stat.title}
                </CardTitle>
                <div
                  className={`rounded-full p-2 ${
                    stat.color === 'blue'
                      ? 'bg-blue-100'
                      : stat.color === 'green'
                        ? 'bg-green-100'
                        : stat.color === 'red'
                          ? 'bg-red-100'
                          : 'bg-purple-100'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      stat.color === 'blue'
                        ? 'text-blue-600'
                        : stat.color === 'green'
                          ? 'text-green-600'
                          : stat.color === 'red'
                            ? 'text-red-600'
                            : 'text-purple-600'
                    }`}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendIcon
                    className={`h-4 w-4 ${
                      stat.trend === 'up'
                        ? 'text-red-500'
                        : stat.trend === 'down'
                          ? 'text-green-500'
                          : 'text-gray-500'
                    }`}
                  />
                  <span
                    className={
                      stat.trend === 'up'
                        ? 'text-red-500'
                        : stat.trend === 'down'
                          ? 'text-green-500'
                          : 'text-gray-500'
                    }
                  >
                    {stat.change}
                  </span>
                  <span className="text-gray-500">from last week</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start justify-between rounded-lg border border-gray-100 p-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          alert.severity === 'critical'
                            ? 'destructive'
                            : alert.severity === 'warning'
                              ? 'warning'
                              : 'secondary'
                        }
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-gray-500">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Diseases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Top Diseases This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topDiseases.map((disease, index) => (
                <div
                  key={disease.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="font-medium">{disease.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">
                      {disease.cases.toLocaleString()} cases
                    </span>
                    <div
                      className={`flex items-center gap-1 text-sm ${
                        disease.change > 0 ? 'text-red-500' : 'text-green-500'
                      }`}
                    >
                      {disease.change > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(disease.change)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ETL Status */}
      <Card>
        <CardHeader>
          <CardTitle>Data Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Data Sync</span>
                <Badge variant="success">Healthy</Badge>
              </div>
              <p className="mt-2 text-2xl font-bold">2 hours ago</p>
              <p className="text-sm text-gray-500">
                12,345 records processed
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Data Sources</span>
                <Badge variant="secondary">3 Connected</Badge>
              </div>
              <p className="mt-2 text-2xl font-bold">3 / 5</p>
              <p className="text-sm text-gray-500">
                2 sources pending configuration
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Data Quality Score</span>
                <Badge variant="success">Good</Badge>
              </div>
              <p className="mt-2 text-2xl font-bold">94.5%</p>
              <p className="text-sm text-gray-500">
                Based on completeness & accuracy
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
