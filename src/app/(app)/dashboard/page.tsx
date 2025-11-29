'use client';

import dynamic from 'next/dynamic';
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
  ChevronRight,
  Calendar,
  MapPin,
  Flame,
  Shield,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';

// Dynamically import map to avoid SSR issues
const CaseTrackingMap = dynamic(
  () => import('@/components/dashboard/CaseTrackingMap').then((mod) => mod.CaseTrackingMap),
  {
    ssr: false,
    loading: () => (
      <Card className="border-white/10 bg-[#0a0820]/80 backdrop-blur-xl">
        <CardContent className="flex h-[500px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <p className="text-sm text-slate-400">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    ),
  }
);
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

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
  { name: 'Malaria', cases: 5678, change: -8, color: '#10B981' },
  { name: 'Cholera', cases: 2340, change: 15, color: '#3B82F6' },
  { name: 'COVID-19', cases: 1234, change: 5, color: '#8B5CF6' },
  { name: 'Measles', cases: 890, change: 22, color: '#F97316' },
  { name: 'Lassa Fever', cases: 145, change: -12, color: '#EF4444' },
];

const weeklyTrend = [
  { week: 'W48', cases: 1234, contacts: 456, deaths: 12 },
  { week: 'W49', cases: 1456, contacts: 523, deaths: 15 },
  { week: 'W50', cases: 1678, contacts: 589, deaths: 18 },
  { week: 'W51', cases: 1890, contacts: 612, deaths: 14 },
  { week: 'W52', cases: 2123, contacts: 678, deaths: 21 },
  { week: 'W01', cases: 2345, contacts: 734, deaths: 19 },
  { week: 'W02', cases: 2567, contacts: 801, deaths: 23 },
  { week: 'W03', cases: 2789, contacts: 867, deaths: 17 },
];

const classificationData = [
  { name: 'Confirmed', value: 6234, color: '#EF4444' },
  { name: 'Probable', value: 3456, color: '#F97316' },
  { name: 'Suspected', value: 2766, color: '#FBBF24' },
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-lg border p-4 shadow-2xl"
        style={{
          backgroundColor: 'rgb(20, 20, 28)',
          borderColor: 'rgb(60, 65, 80)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
        }}
      >
        <p
          className="mb-2 font-semibold text-sm"
          style={{ color: 'rgb(248, 250, 252)' }}
        >
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 py-1">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span style={{ color: 'rgb(148, 163, 184)' }} className="text-sm">
              {entry.name}:
            </span>
            <span style={{ color: 'rgb(248, 250, 252)' }} className="text-sm font-medium">
              {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
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
              <p className="text-sm text-muted-foreground">Cases, contacts, and deaths over the last 8 weeks</p>
            </div>
            <Link href="/analytics">
              <Button variant="ghost" size="sm">
                View Analytics
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={weeklyTrend}>
                <defs>
                  <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorContacts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis dataKey="week" stroke="#A1A1AA" fontSize={12} />
                <YAxis stroke="#A1A1AA" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="cases"
                  name="Cases"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fill="url(#colorCases)"
                />
                <Area
                  type="monotone"
                  dataKey="contacts"
                  name="Contacts"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#colorContacts)"
                />
                <Line
                  type="monotone"
                  dataKey="deaths"
                  name="Deaths"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ fill: '#EF4444', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Case Classification Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Case Classification
            </CardTitle>
            <p className="text-sm text-muted-foreground">Distribution by confirmation status</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={classificationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {classificationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {classificationData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Case Tracking Map */}
      <CaseTrackingMap />

      {/* Disease Bar Chart + Alerts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Diseases Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Top Diseases This Week
            </CardTitle>
            <p className="text-sm text-muted-foreground">Case counts by disease type</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topDiseases} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" horizontal={false} />
                <XAxis type="number" stroke="#A1A1AA" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#A1A1AA" fontSize={12} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="cases" radius={[0, 4, 4, 0]}>
                  {topDiseases.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {topDiseases.map((disease) => (
                <div key={disease.name} className="flex items-center justify-between rounded-lg bg-muted/50 p-2">
                  <span className="text-xs text-muted-foreground">{disease.name}</span>
                  <div className={`flex items-center gap-1 text-xs ${disease.change > 0 ? 'text-destructive' : 'text-success'}`}>
                    {disease.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(disease.change)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
      </div>

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
              View All Events
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
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
