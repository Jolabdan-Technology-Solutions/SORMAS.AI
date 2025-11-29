'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  Zap,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Microscope,
  ChevronRight,
  Calendar,
  MapPin,
  Flame,
  Shield,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';

// Mock data - will be replaced with real data from Supabase
const stats = [
  {
    title: 'Total Cases',
    value: '12,456',
    change: '+12%',
    trend: 'up',
    icon: FileText,
    gradient: 'from-blue-500 to-indigo-600',
    bgGradient: 'from-blue-500/10 to-indigo-600/10',
  },
  {
    title: 'Active Contacts',
    value: '3,890',
    change: '-5%',
    trend: 'down',
    icon: Users,
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-500/10 to-teal-600/10',
  },
  {
    title: 'Active Outbreaks',
    value: '8',
    change: '+2',
    trend: 'up',
    icon: Flame,
    gradient: 'from-orange-500 to-red-600',
    bgGradient: 'from-orange-500/10 to-red-600/10',
  },
  {
    title: 'AI Predictions',
    value: '24',
    change: '+3',
    trend: 'up',
    icon: Zap,
    gradient: 'from-purple-500 to-violet-600',
    bgGradient: 'from-purple-500/10 to-violet-600/10',
  },
];

const recentAlerts = [
  {
    id: 1,
    type: 'threshold_exceeded',
    severity: 'critical',
    title: 'Cholera cases above threshold in Lagos State',
    description: 'Alert threshold of 50 cases exceeded. Current count: 67',
    time: '2 hours ago',
    icon: AlertTriangle,
  },
  {
    id: 2,
    type: 'prediction_warning',
    severity: 'warning',
    title: 'Predicted spike in Malaria cases in Kano',
    description: 'AI model predicts 35% increase in next 2 weeks',
    time: '5 hours ago',
    icon: Zap,
  },
  {
    id: 3,
    type: 'unusual_pattern',
    severity: 'info',
    title: 'Unusual cluster detected in Ogun State',
    description: 'Spatial clustering algorithm detected anomaly',
    time: '1 day ago',
    icon: MapPin,
  },
];

const topDiseases = [
  { name: 'Malaria', cases: 5678, change: -8, color: 'bg-emerald-500' },
  { name: 'Cholera', cases: 2340, change: 15, color: 'bg-blue-500' },
  { name: 'COVID-19', cases: 1234, change: 5, color: 'bg-purple-500' },
  { name: 'Measles', cases: 890, change: 22, color: 'bg-orange-500' },
  { name: 'Lassa Fever', cases: 45, change: -12, color: 'bg-red-500' },
];

const weeklyTrend = [
  { week: 'W48', cases: 1234, contacts: 456 },
  { week: 'W49', cases: 1456, contacts: 523 },
  { week: 'W50', cases: 1678, contacts: 589 },
  { week: 'W51', cases: 1890, contacts: 612 },
  { week: 'W52', cases: 2123, contacts: 678 },
  { week: 'W01', cases: 2345, contacts: 734 },
  { week: 'W02', cases: 2567, contacts: 801 },
  { week: 'W03', cases: 2789, contacts: 867 },
];

const activeOutbreaks = [
  {
    id: 1,
    disease: 'Cholera',
    location: 'Lagos Mainland',
    cases: 45,
    deaths: 3,
    status: 'ongoing',
    startDate: '2024-01-10',
  },
  {
    id: 2,
    disease: 'Measles',
    location: 'Kano Urban',
    cases: 28,
    deaths: 1,
    status: 'ongoing',
    startDate: '2024-01-08',
  },
  {
    id: 3,
    disease: 'Lassa Fever',
    location: 'Edo State',
    cases: 12,
    deaths: 2,
    status: 'ongoing',
    startDate: '2024-01-05',
  },
];

export default function DashboardPage() {
  const maxCases = Math.max(...weeklyTrend.map(w => w.cases));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time disease surveillance and AI-powered predictions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 days
          </Button>
          <Button variant="outline" size="sm">
            <Globe className="mr-2 h-4 w-4" />
            All Regions
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : stat.trend === 'down' ? ArrowDownRight : Minus;
          const isNegativeTrend = stat.title === 'Active Outbreaks' ? stat.trend === 'up' : stat.trend === 'down';

          return (
            <Card key={stat.title} className="relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`} />
              <CardContent className="relative pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
                    <div className="flex items-center gap-1">
                      <TrendIcon
                        className={`h-4 w-4 ${
                          isNegativeTrend ? 'text-destructive' : 'text-success'
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          isNegativeTrend ? 'text-destructive' : 'text-success'
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-xs text-muted-foreground">vs last week</span>
                    </div>
                  </div>
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.gradient}`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weekly Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Weekly Epidemiological Trend
              </CardTitle>
              <p className="text-sm text-muted-foreground">Cases and contacts over the last 8 weeks</p>
            </div>
            <Button variant="ghost" size="sm">
              View Details
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Chart Header */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span className="text-sm text-muted-foreground">Cases</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-muted-foreground">Contacts</span>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="flex h-48 items-end gap-2">
                {weeklyTrend.map((week, index) => (
                  <div key={week.week} className="group relative flex flex-1 flex-col items-center gap-1">
                    {/* Tooltip */}
                    <div className="absolute -top-16 left-1/2 z-10 hidden -translate-x-1/2 rounded-lg bg-popover p-2 text-xs shadow-lg group-hover:block">
                      <p className="font-medium text-foreground">{week.week}</p>
                      <p className="text-primary">{week.cases} cases</p>
                      <p className="text-emerald-500">{week.contacts} contacts</p>
                    </div>

                    {/* Bars Container */}
                    <div className="flex w-full gap-1">
                      {/* Cases Bar */}
                      <div
                        className="flex-1 rounded-t-sm bg-primary transition-all group-hover:opacity-80"
                        style={{ height: `${(week.cases / maxCases) * 160}px` }}
                      />
                      {/* Contacts Bar */}
                      <div
                        className="flex-1 rounded-t-sm bg-emerald-500 transition-all group-hover:opacity-80"
                        style={{ height: `${(week.contacts / maxCases) * 160}px` }}
                      />
                    </div>

                    {/* Week Label */}
                    <span className="text-xs text-muted-foreground">{week.week}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Diseases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Top Diseases
            </CardTitle>
            <p className="text-sm text-muted-foreground">This week's case distribution</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topDiseases.map((disease, index) => (
                <div
                  key={disease.name}
                  className="group flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-muted/50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{disease.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {disease.cases.toLocaleString()}
                        </span>
                        <div
                          className={`flex items-center gap-0.5 text-xs ${
                            disease.change > 0 ? 'text-destructive' : 'text-success'
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
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full ${disease.color} transition-all`}
                        style={{
                          width: `${(disease.cases / topDiseases[0].cases) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-500" />
                Recent Alerts
              </CardTitle>
              <p className="text-sm text-muted-foreground">Latest surveillance notifications</p>
            </div>
            <Link href="/alerts">
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAlerts.map((alert) => {
                const Icon = alert.icon;
                return (
                  <div
                    key={alert.id}
                    className="group flex items-start gap-4 rounded-xl border border-border p-4 transition-all hover:border-primary/50 hover:bg-muted/30"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        alert.severity === 'critical'
                          ? 'bg-destructive/20 text-destructive'
                          : alert.severity === 'warning'
                            ? 'bg-warning/20 text-warning'
                            : 'bg-primary/20 text-primary'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
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
                        <span className="text-xs text-muted-foreground">{alert.time}</span>
                      </div>
                      <p className="font-medium text-foreground">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Active Outbreaks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-destructive" />
                Active Outbreaks
              </CardTitle>
              <p className="text-sm text-muted-foreground">Ongoing disease events requiring response</p>
            </div>
            <Link href="/events">
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeOutbreaks.map((outbreak) => (
                <div
                  key={outbreak.id}
                  className="group rounded-xl border border-border p-4 transition-all hover:border-destructive/50 hover:bg-muted/30"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">{outbreak.disease}</Badge>
                        <Badge variant="outline">{outbreak.status}</Badge>
                      </div>
                      <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {outbreak.location}
                      </p>
                    </div>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {outbreak.startDate}
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-muted/50 p-2 text-center">
                      <p className="text-lg font-bold text-foreground">{outbreak.cases}</p>
                      <p className="text-xs text-muted-foreground">Cases</p>
                    </div>
                    <div className="rounded-lg bg-destructive/10 p-2 text-center">
                      <p className="text-lg font-bold text-destructive">{outbreak.deaths}</p>
                      <p className="text-xs text-muted-foreground">Deaths</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-success" />
            Data Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-gradient-to-br from-success/10 to-emerald-500/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Last Sync</span>
                <Badge variant="success">Healthy</Badge>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">2 hours ago</p>
              <p className="text-sm text-muted-foreground">12,345 records processed</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-indigo-500/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Data Sources</span>
                <Badge variant="secondary">3 Active</Badge>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">3 / 5</p>
              <p className="text-sm text-muted-foreground">2 sources pending</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Data Quality</span>
                <Badge variant="success">Good</Badge>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">94.5%</p>
              <p className="text-sm text-muted-foreground">Completeness score</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Pending Samples</span>
                <Badge variant="warning">Action Needed</Badge>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">23</p>
              <p className="text-sm text-muted-foreground">Awaiting results</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
