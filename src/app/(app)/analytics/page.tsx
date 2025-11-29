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
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  Activity,
  Users,
  Skull,
  HeartPulse,
  MapPin,
  PieChart,
  LineChart as LineChartIcon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';

// Epidemiological curve data by week
const epiCurveData = [
  { week: 'W45', confirmed: 120, probable: 45, suspect: 89, deaths: 8 },
  { week: 'W46', confirmed: 145, probable: 52, suspect: 95, deaths: 12 },
  { week: 'W47', confirmed: 189, probable: 67, suspect: 112, deaths: 15 },
  { week: 'W48', confirmed: 234, probable: 78, suspect: 134, deaths: 18 },
  { week: 'W49', confirmed: 267, probable: 89, suspect: 156, deaths: 21 },
  { week: 'W50', confirmed: 312, probable: 95, suspect: 178, deaths: 24 },
  { week: 'W51', confirmed: 289, probable: 82, suspect: 165, deaths: 19 },
  { week: 'W52', confirmed: 256, probable: 71, suspect: 145, deaths: 16 },
  { week: 'W01', confirmed: 198, probable: 58, suspect: 112, deaths: 11 },
  { week: 'W02', confirmed: 167, probable: 49, suspect: 98, deaths: 9 },
  { week: 'W03', confirmed: 145, probable: 42, suspect: 87, deaths: 7 },
  { week: 'W04', confirmed: 134, probable: 38, suspect: 76, deaths: 5 },
];

// Disease burden data
const diseaseBurdenData = [
  { disease: 'Cholera', cases: 2340, deaths: 156, cfr: 6.67, prevCases: 1890, trend: 'up' },
  { disease: 'Malaria', cases: 5678, deaths: 234, cfr: 4.12, prevCases: 6123, trend: 'down' },
  { disease: 'COVID-19', cases: 1234, deaths: 45, cfr: 3.65, prevCases: 1456, trend: 'down' },
  { disease: 'Measles', cases: 890, deaths: 23, cfr: 2.58, prevCases: 567, trend: 'up' },
  { disease: 'Lassa Fever', cases: 145, deaths: 34, cfr: 23.45, prevCases: 189, trend: 'down' },
  { disease: 'Yellow Fever', cases: 78, deaths: 12, cfr: 15.38, prevCases: 45, trend: 'up' },
];

// Age distribution data
const ageDistributionData = [
  { ageGroup: '0-4', male: 234, female: 212 },
  { ageGroup: '5-14', male: 345, female: 389 },
  { ageGroup: '15-24', male: 456, female: 478 },
  { ageGroup: '25-34', male: 567, female: 534 },
  { ageGroup: '35-44', male: 489, female: 456 },
  { ageGroup: '45-54', male: 378, female: 345 },
  { ageGroup: '55-64', male: 267, female: 234 },
  { ageGroup: '65+', male: 189, female: 212 },
];

// Case classification distribution
const classificationData = [
  { name: 'Confirmed', value: 4567, color: '#ef4444' },
  { name: 'Probable', value: 1234, color: '#f59e0b' },
  { name: 'Suspect', value: 2345, color: '#6366f1' },
  { name: 'Not a Case', value: 567, color: '#22c55e' },
];

// Outcome distribution
const outcomeData = [
  { name: 'Recovered', value: 5678, color: '#22c55e' },
  { name: 'Deceased', value: 456, color: '#ef4444' },
  { name: 'Under Treatment', value: 1234, color: '#f59e0b' },
  { name: 'Unknown', value: 345, color: '#6b7280' },
];

// Geographic distribution (top regions)
const regionData = [
  { region: 'Lagos', cases: 2345, incidence: 45.6 },
  { region: 'Kano', cases: 1890, incidence: 38.2 },
  { region: 'Rivers', cases: 1234, incidence: 32.1 },
  { region: 'Oyo', cases: 987, incidence: 28.5 },
  { region: 'Kaduna', cases: 876, incidence: 25.3 },
  { region: 'FCT Abuja', cases: 765, incidence: 42.8 },
  { region: 'Edo', cases: 654, incidence: 22.1 },
  { region: 'Delta', cases: 543, incidence: 19.8 },
];

// Contact follow-up rates
const contactFollowUpData = [
  { week: 'W49', cooperative: 78, uncooperative: 12, unavailable: 8, neverVisited: 2 },
  { week: 'W50', cooperative: 82, uncooperative: 10, unavailable: 6, neverVisited: 2 },
  { week: 'W51', cooperative: 85, uncooperative: 8, unavailable: 5, neverVisited: 2 },
  { week: 'W52', cooperative: 79, uncooperative: 11, unavailable: 7, neverVisited: 3 },
  { week: 'W01', cooperative: 88, uncooperative: 7, unavailable: 4, neverVisited: 1 },
  { week: 'W02', cooperative: 91, uncooperative: 5, unavailable: 3, neverVisited: 1 },
];

// Lab results data
const labResultsData = [
  { week: 'W49', positive: 234, negative: 456, pending: 89, indeterminate: 12 },
  { week: 'W50', positive: 267, negative: 512, pending: 78, indeterminate: 15 },
  { week: 'W51', positive: 289, negative: 534, pending: 67, indeterminate: 11 },
  { week: 'W52', positive: 256, negative: 489, pending: 56, indeterminate: 9 },
  { week: 'W01', positive: 198, negative: 423, pending: 45, indeterminate: 8 },
  { week: 'W02', positive: 178, negative: 398, pending: 34, indeterminate: 6 },
];

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

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
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('last30days');
  const [selectedDisease, setSelectedDisease] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');

  // Calculate summary statistics
  const totalCases = diseaseBurdenData.reduce((sum, d) => sum + d.cases, 0);
  const totalDeaths = diseaseBurdenData.reduce((sum, d) => sum + d.deaths, 0);
  const overallCFR = ((totalDeaths / totalCases) * 100).toFixed(2);
  const totalContacts = 3890;
  const contactConversionRate = 4.2;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics & Statistics</h1>
          <p className="text-muted-foreground">
            Comprehensive epidemiological analysis and surveillance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4">
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-48"
            >
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="last90days">Last 90 Days</option>
              <option value="thisYear">This Year</option>
              <option value="custom">Custom Range</option>
            </Select>
            <Select
              value={selectedDisease}
              onChange={(e) => setSelectedDisease(e.target.value)}
              className="w-48"
            >
              <option value="all">All Diseases</option>
              <option value="cholera">Cholera</option>
              <option value="malaria">Malaria</option>
              <option value="covid19">COVID-19</option>
              <option value="measles">Measles</option>
              <option value="lassa">Lassa Fever</option>
            </Select>
            <Select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-48"
            >
              <option value="all">All Regions</option>
              <option value="lagos">Lagos</option>
              <option value="kano">Kano</option>
              <option value="rivers">Rivers</option>
              <option value="oyo">Oyo</option>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cases</p>
                <p className="text-3xl font-bold text-foreground">{totalCases.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-sm text-success">
                  <TrendingDown className="h-4 w-4" />
                  <span>-8.5% vs last period</span>
                </div>
              </div>
              <div className="rounded-full bg-primary/20 p-3">
                <Activity className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Deaths</p>
                <p className="text-3xl font-bold text-foreground">{totalDeaths.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-sm text-success">
                  <TrendingDown className="h-4 w-4" />
                  <span>-12.3% vs last period</span>
                </div>
              </div>
              <div className="rounded-full bg-destructive/20 p-3">
                <Skull className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Case Fatality Rate</p>
                <p className="text-3xl font-bold text-foreground">{overallCFR}%</p>
                <div className="flex items-center gap-1 text-sm text-success">
                  <TrendingDown className="h-4 w-4" />
                  <span>-0.8% vs last period</span>
                </div>
              </div>
              <div className="rounded-full bg-warning/20 p-3">
                <HeartPulse className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contact Conversion</p>
                <p className="text-3xl font-bold text-foreground">{contactConversionRate}%</p>
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <TrendingUp className="h-4 w-4" />
                  <span>+0.3% vs last period</span>
                </div>
              </div>
              <div className="rounded-full bg-success/20 p-3">
                <Users className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Epidemiological Curve */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChartIcon className="h-5 w-5 text-primary" />
            Epidemiological Curve
          </CardTitle>
          <CardDescription>
            Case distribution by classification and mortality over time (12 weeks)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={epiCurveData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="suspect" stackId="1" fill="#6366f1" stroke="#6366f1" fillOpacity={0.6} name="Suspect" />
                <Area yAxisId="left" type="monotone" dataKey="probable" stackId="1" fill="#f59e0b" stroke="#f59e0b" fillOpacity={0.6} name="Probable" />
                <Area yAxisId="left" type="monotone" dataKey="confirmed" stackId="1" fill="#ef4444" stroke="#ef4444" fillOpacity={0.6} name="Confirmed" />
                <Line yAxisId="right" type="monotone" dataKey="deaths" stroke="#000" strokeWidth={2} dot={{ fill: '#000' }} name="Deaths" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Disease Burden Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Disease Burden Summary
          </CardTitle>
          <CardDescription>
            Case fatality rates and trends by disease
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Disease</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Cases</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Deaths</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">CFR (%)</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Prev. Cases</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Change</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {diseaseBurdenData.map((disease) => {
                  const changePercent = ((disease.cases - disease.prevCases) / disease.prevCases * 100).toFixed(1);
                  const isIncrease = disease.cases > disease.prevCases;
                  return (
                    <tr key={disease.disease} className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium text-foreground">{disease.disease}</td>
                      <td className="px-4 py-3 text-right text-foreground">{disease.cases.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-foreground">{disease.deaths.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant={disease.cfr > 10 ? 'destructive' : disease.cfr > 5 ? 'warning' : 'success'}>
                          {disease.cfr.toFixed(2)}%
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{disease.prevCases.toLocaleString()}</td>
                      <td className={`px-4 py-3 text-right ${isIncrease ? 'text-destructive' : 'text-success'}`}>
                        {isIncrease ? '+' : ''}{changePercent}%
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isIncrease ? (
                          <TrendingUp className="mx-auto h-4 w-4 text-destructive" />
                        ) : (
                          <TrendingDown className="mx-auto h-4 w-4 text-success" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Age & Sex Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Age & Sex Distribution
            </CardTitle>
            <CardDescription>Population pyramid of cases by age group and sex</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageDistributionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="ageGroup" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={50} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="male" fill="#6366f1" name="Male" />
                  <Bar dataKey="female" fill="#ec4899" name="Female" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Case Classification Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Case Classification
            </CardTitle>
            <CardDescription>Distribution of cases by classification status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={classificationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {classificationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact Follow-up Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Contact Follow-up Compliance
            </CardTitle>
            <CardDescription>Weekly follow-up visit status distribution (%)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={contactFollowUpData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="cooperative" stackId="1" fill="#22c55e" stroke="#22c55e" name="Cooperative" />
                  <Area type="monotone" dataKey="uncooperative" stackId="1" fill="#f59e0b" stroke="#f59e0b" name="Uncooperative" />
                  <Area type="monotone" dataKey="unavailable" stackId="1" fill="#ef4444" stroke="#ef4444" name="Unavailable" />
                  <Area type="monotone" dataKey="neverVisited" stackId="1" fill="#6b7280" stroke="#6b7280" name="Never Visited" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Lab Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Laboratory Results
            </CardTitle>
            <CardDescription>Weekly test results by pathogen status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={labResultsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="positive" fill="#ef4444" name="Positive" />
                  <Bar dataKey="negative" fill="#22c55e" name="Negative" />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                  <Bar dataKey="indeterminate" fill="#6b7280" name="Indeterminate" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Geographic Distribution
          </CardTitle>
          <CardDescription>Case counts and incidence rates by region (per 100,000 population)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="region" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="cases" fill="#6366f1" name="Cases" />
                <Line yAxisId="right" type="monotone" dataKey="incidence" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} name="Incidence Rate" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Outcome Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-primary" />
            Case Outcomes
          </CardTitle>
          <CardDescription>Distribution of case outcomes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {outcomeData.map((outcome) => (
              <div
                key={outcome.name}
                className="rounded-xl border border-border p-4 text-center transition-all hover:border-primary/50"
              >
                <div
                  className="mx-auto mb-2 h-3 w-3 rounded-full"
                  style={{ backgroundColor: outcome.color }}
                />
                <p className="text-2xl font-bold text-foreground">{outcome.value.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{outcome.name}</p>
                <p className="text-xs text-muted-foreground">
                  {((outcome.value / outcomeData.reduce((s, o) => s + o.value, 0)) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
