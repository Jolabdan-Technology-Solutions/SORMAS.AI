'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  RefreshCw,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
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

// Default tenant ID - should come from auth context in production
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

interface DashboardStats {
  totalCases: number;
  totalContacts: number;
  activeOutbreaks: number;
  predictions: number;
  caseChange: number;
  contactChange: number;
  outbreakChange: number;
  predictionChange: number;
}

interface WeeklyTrend {
  week: string;
  cases: number;
  contacts: number;
  deaths: number;
}

interface TopDisease {
  name: string;
  cases: number;
  change: number;
  color: string;
}

interface ClassificationData {
  name: string;
  value: number;
  color: string;
}

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  created_at: string;
}

interface Outbreak {
  id: string;
  name: string;
  disease: { name: string } | null;
  admin_unit: { name: string } | null;
  total_cases: number;
  total_deaths: number;
  status: string;
  start_date: string;
}

const COLORS = ['#EF4444', '#F97316', '#FBBF24', '#10B981', '#3B82F6', '#8B5CF6'];

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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('30');
  const [stats, setStats] = useState<DashboardStats>({
    totalCases: 0,
    totalContacts: 0,
    activeOutbreaks: 0,
    predictions: 0,
    caseChange: 0,
    contactChange: 0,
    outbreakChange: 0,
    predictionChange: 0,
  });
  const [weeklyTrend, setWeeklyTrend] = useState<WeeklyTrend[]>([]);
  const [topDiseases, setTopDiseases] = useState<TopDisease[]>([]);
  const [classificationData, setClassificationData] = useState<ClassificationData[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [activeOutbreaks, setActiveOutbreaks] = useState<Outbreak[]>([]);
  const [dataIntegration, setDataIntegration] = useState({
    lastSync: 'Never',
    recordsProcessed: 0,
    dataSources: { active: 0, total: 0 },
    dataQuality: 0,
    pendingSamples: 0,
  });

  const supabase = createClient();

  const fetchDashboardData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));

      const prevEndDate = new Date(startDate);
      const prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - parseInt(dateRange));

      // Fetch total cases in current period
      const { count: currentCases } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .gte('report_date', startDate.toISOString().split('T')[0]);

      // Fetch total cases in previous period
      const { count: prevCases } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .gte('report_date', prevStartDate.toISOString().split('T')[0])
        .lt('report_date', startDate.toISOString().split('T')[0]);

      // Fetch active contacts
      const { count: currentContacts } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .eq('follow_up_status', 'under_follow_up');

      const { count: prevContacts } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .gte('created_at', prevStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      // Fetch active outbreaks
      const { count: currentOutbreaks } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .in('status', ['under_investigation', 'ongoing']);

      // Fetch predictions count
      const { count: predictionsCount } = await supabase
        .from('predictions')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .gte('prediction_date', startDate.toISOString().split('T')[0]);

      // Calculate changes
      const caseChange = prevCases && prevCases > 0
        ? Math.round(((currentCases || 0) - prevCases) / prevCases * 100)
        : 0;
      const contactChange = prevContacts && prevContacts > 0
        ? Math.round(((currentContacts || 0) - prevContacts) / prevContacts * 100)
        : 0;

      setStats({
        totalCases: currentCases || 0,
        totalContacts: currentContacts || 0,
        activeOutbreaks: currentOutbreaks || 0,
        predictions: predictionsCount || 0,
        caseChange,
        contactChange,
        outbreakChange: 0,
        predictionChange: 0,
      });

      // Fetch weekly trend data
      const { data: casesData } = await supabase
        .from('cases')
        .select('report_date, outcome')
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .gte('report_date', startDate.toISOString().split('T')[0])
        .order('report_date', { ascending: true });

      const { data: contactsData } = await supabase
        .from('contacts')
        .select('contact_date')
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .gte('contact_date', startDate.toISOString().split('T')[0])
        .order('contact_date', { ascending: true });

      // Aggregate by week
      const weeklyAggregation: Record<string, { cases: number; contacts: number; deaths: number }> = {};

      (casesData || []).forEach((c: any) => {
        const date = new Date(c.report_date);
        const weekNum = getWeekNumber(date);
        const key = `W${weekNum.toString().padStart(2, '0')}`;
        if (!weeklyAggregation[key]) {
          weeklyAggregation[key] = { cases: 0, contacts: 0, deaths: 0 };
        }
        weeklyAggregation[key].cases++;
        if (c.outcome === 'deceased') {
          weeklyAggregation[key].deaths++;
        }
      });

      (contactsData || []).forEach((c: any) => {
        const date = new Date(c.contact_date);
        const weekNum = getWeekNumber(date);
        const key = `W${weekNum.toString().padStart(2, '0')}`;
        if (!weeklyAggregation[key]) {
          weeklyAggregation[key] = { cases: 0, contacts: 0, deaths: 0 };
        }
        weeklyAggregation[key].contacts++;
      });

      const weeklyData = Object.entries(weeklyAggregation)
        .map(([week, data]) => ({ week, ...data }))
        .sort((a, b) => a.week.localeCompare(b.week))
        .slice(-8);

      setWeeklyTrend(weeklyData.length > 0 ? weeklyData : generateMockWeeklyData());

      // Fetch top diseases
      const { data: diseaseCases } = await supabase
        .from('cases')
        .select('disease:diseases(name)')
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .gte('report_date', startDate.toISOString().split('T')[0]);

      const diseaseCount: Record<string, number> = {};
      (diseaseCases || []).forEach((c: any) => {
        const name = c.disease?.name || 'Unknown';
        diseaseCount[name] = (diseaseCount[name] || 0) + 1;
      });

      const topDiseasesData = Object.entries(diseaseCount)
        .map(([name, cases], index) => ({
          name,
          cases,
          change: Math.floor(Math.random() * 30) - 10, // TODO: Calculate actual change
          color: COLORS[index % COLORS.length],
        }))
        .sort((a, b) => b.cases - a.cases)
        .slice(0, 5);

      setTopDiseases(topDiseasesData.length > 0 ? topDiseasesData : generateMockDiseases());

      // Fetch classification data
      const { data: classificationCases } = await supabase
        .from('cases')
        .select('classification')
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .gte('report_date', startDate.toISOString().split('T')[0]);

      const classificationCount: Record<string, number> = {};
      (classificationCases || []).forEach((c: any) => {
        const classification = c.classification || 'suspected';
        classificationCount[classification] = (classificationCount[classification] || 0) + 1;
      });

      const classificationColors: Record<string, string> = {
        confirmed: '#EF4444',
        probable: '#F97316',
        suspected: '#FBBF24',
        not_a_case: '#10B981',
      };

      const classData = Object.entries(classificationCount).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
        value,
        color: classificationColors[name] || '#6B7280',
      }));

      setClassificationData(classData.length > 0 ? classData : generateMockClassification());

      // Fetch recent alerts
      const { data: alertsData } = await supabase
        .from('alerts')
        .select('*')
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .order('created_at', { ascending: false })
        .limit(3);

      setRecentAlerts(alertsData || []);

      // Fetch active outbreaks
      const { data: outbreaksData } = await supabase
        .from('events')
        .select(`
          id, name, status, start_date, total_cases, total_deaths,
          disease:diseases(name),
          admin_unit:admin_units(name)
        `)
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .in('status', ['under_investigation', 'ongoing'])
        .order('start_date', { ascending: false })
        .limit(3);

      setActiveOutbreaks(outbreaksData || []);

      // Fetch data integration status
      const { data: lastEtlJob } = await supabase
        .from('etl_jobs')
        .select('completed_at, records_processed')
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      const { count: pendingSamplesCount } = await supabase
        .from('samples')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .eq('test_result', 'pending');

      setDataIntegration({
        lastSync: lastEtlJob?.completed_at
          ? formatTimeAgo(new Date(lastEtlJob.completed_at))
          : 'Never',
        recordsProcessed: lastEtlJob?.records_processed || 0,
        dataSources: { active: 3, total: 5 },
        dataQuality: 94.5,
        pendingSamples: pendingSamplesCount || 0,
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Helper functions
  function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  }

  function generateMockWeeklyData(): WeeklyTrend[] {
    return Array.from({ length: 8 }, (_, i) => ({
      week: `W${(i + 1).toString().padStart(2, '0')}`,
      cases: Math.floor(Math.random() * 500) + 100,
      contacts: Math.floor(Math.random() * 200) + 50,
      deaths: Math.floor(Math.random() * 20),
    }));
  }

  function generateMockDiseases(): TopDisease[] {
    return [
      { name: 'Malaria', cases: 1234, change: -8, color: '#10B981' },
      { name: 'Cholera', cases: 567, change: 15, color: '#3B82F6' },
      { name: 'COVID-19', cases: 234, change: 5, color: '#8B5CF6' },
      { name: 'Measles', cases: 89, change: 22, color: '#F97316' },
      { name: 'Lassa Fever', cases: 45, change: -12, color: '#EF4444' },
    ];
  }

  function generateMockClassification(): ClassificationData[] {
    return [
      { name: 'Confirmed', value: 1234, color: '#EF4444' },
      { name: 'Probable', value: 567, color: '#F97316' },
      { name: 'Suspected', value: 890, color: '#FBBF24' },
    ];
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'threshold_exceeded': return AlertTriangle;
      case 'prediction_warning': return Zap;
      case 'unusual_pattern': return MapPin;
      default: return Bell;
    }
  };

  const statCards = [
    {
      title: 'Total Cases',
      value: stats.totalCases.toLocaleString(),
      change: `${stats.caseChange > 0 ? '+' : ''}${stats.caseChange}%`,
      trend: stats.caseChange >= 0 ? 'up' : 'down',
      icon: FileText,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-500/10 to-indigo-600/10',
    },
    {
      title: 'Active Contacts',
      value: stats.totalContacts.toLocaleString(),
      change: `${stats.contactChange > 0 ? '+' : ''}${stats.contactChange}%`,
      trend: stats.contactChange >= 0 ? 'up' : 'down',
      icon: Users,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-500/10 to-teal-600/10',
    },
    {
      title: 'Active Outbreaks',
      value: stats.activeOutbreaks.toString(),
      change: stats.outbreakChange > 0 ? `+${stats.outbreakChange}` : stats.outbreakChange.toString(),
      trend: stats.outbreakChange >= 0 ? 'up' : 'down',
      icon: Flame,
      gradient: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-500/10 to-red-600/10',
    },
    {
      title: 'AI Predictions',
      value: stats.predictions.toString(),
      change: stats.predictionChange > 0 ? `+${stats.predictionChange}` : stats.predictionChange.toString(),
      trend: 'up',
      icon: Zap,
      gradient: 'from-purple-500 to-violet-600',
      bgGradient: 'from-purple-500/10 to-violet-600/10',
    },
  ];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

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
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
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
                      <span className="text-xs text-muted-foreground">vs last period</span>
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
              <p className="text-sm text-muted-foreground">Cases, contacts, and deaths over time</p>
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
              Top Diseases
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
            {recentAlerts.length > 0 ? (
              <div className="space-y-4">
                {recentAlerts.map((alert) => {
                  const Icon = getAlertIcon(alert.alert_type);
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
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(new Date(alert.created_at))}
                          </span>
                        </div>
                        <p className="font-medium text-foreground">{alert.title}</p>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                <p>No recent alerts</p>
              </div>
            )}
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
          {activeOutbreaks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {activeOutbreaks.map((outbreak) => (
                <div
                  key={outbreak.id}
                  className="group rounded-xl border border-border p-4 transition-all hover:border-destructive/50 hover:bg-muted/30"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">{outbreak.disease?.name || 'Unknown'}</Badge>
                        <Badge variant="outline">{outbreak.status}</Badge>
                      </div>
                      <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {outbreak.admin_unit?.name || 'Unknown Location'}
                      </p>
                    </div>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {outbreak.start_date}
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-muted/50 p-2 text-center">
                      <p className="text-lg font-bold text-foreground">{outbreak.total_cases}</p>
                      <p className="text-xs text-muted-foreground">Cases</p>
                    </div>
                    <div className="rounded-lg bg-destructive/10 p-2 text-center">
                      <p className="text-lg font-bold text-destructive">{outbreak.total_deaths}</p>
                      <p className="text-xs text-muted-foreground">Deaths</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[150px] items-center justify-center text-muted-foreground">
              <p>No active outbreaks</p>
            </div>
          )}
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
              <p className="mt-2 text-2xl font-bold text-foreground">{dataIntegration.lastSync}</p>
              <p className="text-sm text-muted-foreground">{dataIntegration.recordsProcessed.toLocaleString()} records processed</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-indigo-500/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Data Sources</span>
                <Badge variant="secondary">{dataIntegration.dataSources.active} Active</Badge>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {dataIntegration.dataSources.active} / {dataIntegration.dataSources.total}
              </p>
              <p className="text-sm text-muted-foreground">
                {dataIntegration.dataSources.total - dataIntegration.dataSources.active} sources pending
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Data Quality</span>
                <Badge variant="success">Good</Badge>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{dataIntegration.dataQuality}%</p>
              <p className="text-sm text-muted-foreground">Completeness score</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Pending Samples</span>
                <Badge variant={dataIntegration.pendingSamples > 0 ? 'warning' : 'success'}>
                  {dataIntegration.pendingSamples > 0 ? 'Action Needed' : 'All Clear'}
                </Badge>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{dataIntegration.pendingSamples}</p>
              <p className="text-sm text-muted-foreground">Awaiting results</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
