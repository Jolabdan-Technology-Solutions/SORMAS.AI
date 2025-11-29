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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Brain,
  Target,
  Calendar,
  MapPin,
  Activity,
  BarChart3,
  RefreshCw,
  Info,
  CheckCircle,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

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
              {entry.value !== null && entry.value !== undefined ? entry.value.toLocaleString() : 'N/A'}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Prediction data for outbreak forecasting
const choleraForecast = [
  { week: 'W01', actual: 234, predicted: null, lower: null, upper: null },
  { week: 'W02', actual: 267, predicted: null, lower: null, upper: null },
  { week: 'W03', actual: 289, predicted: null, lower: null, upper: null },
  { week: 'W04', actual: 312, predicted: null, lower: null, upper: null },
  { week: 'W05', actual: null, predicted: 345, lower: 298, upper: 392 },
  { week: 'W06', actual: null, predicted: 378, lower: 312, upper: 444 },
  { week: 'W07', actual: null, predicted: 412, lower: 334, upper: 490 },
  { week: 'W08', actual: null, predicted: 389, lower: 315, upper: 463 },
];

const measlesForecast = [
  { week: 'W01', actual: 89, predicted: null, lower: null, upper: null },
  { week: 'W02', actual: 112, predicted: null, lower: null, upper: null },
  { week: 'W03', actual: 134, predicted: null, lower: null, upper: null },
  { week: 'W04', actual: 156, predicted: null, lower: null, upper: null },
  { week: 'W05', actual: null, predicted: 178, lower: 145, upper: 211 },
  { week: 'W06', actual: null, predicted: 201, lower: 162, upper: 240 },
  { week: 'W07', actual: null, predicted: 189, lower: 152, upper: 226 },
  { week: 'W08', actual: null, predicted: 167, lower: 134, upper: 200 },
];

// Active prediction models
const predictionModels = [
  {
    id: 1,
    name: 'Cholera Outbreak Prediction',
    disease: 'Cholera',
    model_type: 'ARIMA + LSTM Ensemble',
    accuracy: 87.5,
    last_updated: '2024-01-28',
    status: 'active',
    prediction: 'Increasing trend expected',
    confidence: 'high',
    risk_level: 'high',
    regions_affected: ['Lagos', 'Kano', 'Rivers'],
    alert_triggered: true,
  },
  {
    id: 2,
    name: 'Measles Cluster Detection',
    disease: 'Measles',
    model_type: 'SIR Compartmental Model',
    accuracy: 82.3,
    last_updated: '2024-01-28',
    status: 'active',
    prediction: 'Moderate increase expected',
    confidence: 'medium',
    risk_level: 'medium',
    regions_affected: ['Kano', 'Kaduna'],
    alert_triggered: false,
  },
  {
    id: 3,
    name: 'Lassa Fever Seasonality',
    disease: 'Lassa Fever',
    model_type: 'Seasonal ARIMA',
    accuracy: 79.8,
    last_updated: '2024-01-27',
    status: 'active',
    prediction: 'Peak season approaching',
    confidence: 'high',
    risk_level: 'high',
    regions_affected: ['Edo', 'Ondo', 'Ebonyi'],
    alert_triggered: true,
  },
  {
    id: 4,
    name: 'Malaria Incidence Model',
    disease: 'Malaria',
    model_type: 'Random Forest + Climate',
    accuracy: 84.2,
    last_updated: '2024-01-28',
    status: 'active',
    prediction: 'Stable with seasonal variation',
    confidence: 'high',
    risk_level: 'low',
    regions_affected: ['All Regions'],
    alert_triggered: false,
  },
  {
    id: 5,
    name: 'COVID-19 Variant Tracker',
    disease: 'COVID-19',
    model_type: 'XGBoost + Genomic Data',
    accuracy: 76.5,
    last_updated: '2024-01-26',
    status: 'training',
    prediction: 'Model retraining in progress',
    confidence: 'low',
    risk_level: 'low',
    regions_affected: ['FCT Abuja', 'Lagos'],
    alert_triggered: false,
  },
];

// Risk assessment data
const riskAssessmentData = [
  { region: 'Lagos', cholera: 85, measles: 45, lassa: 20, malaria: 60, overall: 78 },
  { region: 'Kano', cholera: 72, measles: 78, lassa: 15, malaria: 75, overall: 72 },
  { region: 'Rivers', cholera: 65, measles: 35, lassa: 10, malaria: 55, overall: 58 },
  { region: 'Edo', cholera: 25, measles: 20, lassa: 92, malaria: 45, overall: 65 },
  { region: 'Oyo', cholera: 45, measles: 55, lassa: 12, malaria: 68, overall: 52 },
  { region: 'Kaduna', cholera: 38, measles: 82, lassa: 18, malaria: 72, overall: 62 },
];

// Model performance metrics
const modelPerformanceData = [
  { month: 'Aug', accuracy: 78, precision: 75, recall: 82 },
  { month: 'Sep', accuracy: 81, precision: 79, recall: 84 },
  { month: 'Oct', accuracy: 83, precision: 81, recall: 86 },
  { month: 'Nov', accuracy: 85, precision: 83, recall: 87 },
  { month: 'Dec', accuracy: 86, precision: 85, recall: 88 },
  { month: 'Jan', accuracy: 87, precision: 86, recall: 89 },
];

export default function PredictionsPage() {
  const [selectedDisease, setSelectedDisease] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('4weeks');

  const activeModels = predictionModels.filter(m => m.status === 'active').length;
  const highRiskAlerts = predictionModels.filter(m => m.risk_level === 'high' && m.alert_triggered).length;
  const avgAccuracy = (predictionModels.reduce((sum, m) => sum + m.accuracy, 0) / predictionModels.length).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Predictions & Forecasting</h1>
          <p className="text-muted-foreground">
            Machine learning-powered outbreak prediction and risk assessment
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Models
          </Button>
          <Button>
            <Brain className="mr-2 h-4 w-4" />
            Train New Model
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Models</p>
                <p className="text-3xl font-bold text-foreground">{activeModels}</p>
                <p className="text-xs text-muted-foreground">Running predictions</p>
              </div>
              <div className="rounded-full bg-primary/20 p-3">
                <Brain className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Risk Alerts</p>
                <p className="text-3xl font-bold text-foreground">{highRiskAlerts}</p>
                <p className="text-xs text-muted-foreground">Require attention</p>
              </div>
              <div className="rounded-full bg-destructive/20 p-3">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Accuracy</p>
                <p className="text-3xl font-bold text-foreground">{avgAccuracy}%</p>
                <p className="text-xs text-muted-foreground">Model performance</p>
              </div>
              <div className="rounded-full bg-success/20 p-3">
                <Target className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Forecast Horizon</p>
                <p className="text-3xl font-bold text-foreground">4 weeks</p>
                <p className="text-xs text-muted-foreground">Prediction window</p>
              </div>
              <div className="rounded-full bg-warning/20 p-3">
                <Calendar className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4">
            <Select value={selectedDisease} onValueChange={setSelectedDisease}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Disease" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Diseases</SelectItem>
                <SelectItem value="cholera">Cholera</SelectItem>
                <SelectItem value="measles">Measles</SelectItem>
                <SelectItem value="lassa">Lassa Fever</SelectItem>
                <SelectItem value="malaria">Malaria</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2weeks">2 Week Forecast</SelectItem>
                <SelectItem value="4weeks">4 Week Forecast</SelectItem>
                <SelectItem value="8weeks">8 Week Forecast</SelectItem>
                <SelectItem value="12weeks">12 Week Forecast</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Forecast Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cholera Forecast */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-destructive" />
                  Cholera Outbreak Forecast
                </CardTitle>
                <CardDescription>4-week prediction with 95% confidence interval</CardDescription>
              </div>
              <Badge variant="destructive">High Risk</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={choleraForecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="upper" stackId="1" fill="#fee2e2" stroke="transparent" name="Upper Bound" />
                  <Area type="monotone" dataKey="lower" stackId="2" fill="#fff" stroke="transparent" name="Lower Bound" />
                  <Line type="monotone" dataKey="actual" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} name="Actual" />
                  <Line type="monotone" dataKey="predicted" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#ef4444' }} name="Predicted" />
                  <ReferenceLine y={300} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Alert Threshold', fill: '#f59e0b', fontSize: 10 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-foreground">
                <strong>Alert:</strong> Predicted cases exceed threshold by W06. Recommend preemptive response measures.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Measles Forecast */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-warning" />
                  Measles Cluster Forecast
                </CardTitle>
                <CardDescription>4-week prediction with 95% confidence interval</CardDescription>
              </div>
              <Badge variant="warning">Medium Risk</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={measlesForecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="upper" stackId="1" fill="#fef3c7" stroke="transparent" name="Upper Bound" />
                  <Area type="monotone" dataKey="lower" stackId="2" fill="#fff" stroke="transparent" name="Lower Bound" />
                  <Line type="monotone" dataKey="actual" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} name="Actual" />
                  <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#f59e0b' }} name="Predicted" />
                  <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Alert Threshold', fill: '#ef4444', fontSize: 10 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-warning/10 p-3">
              <Info className="h-5 w-5 text-warning" />
              <p className="text-sm text-foreground">
                <strong>Note:</strong> Cases trending upward. Monitor vaccination coverage in affected regions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Active Prediction Models
          </CardTitle>
          <CardDescription>Machine learning models currently running predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictionModels.map((model) => (
              <div
                key={model.id}
                className="rounded-xl border border-border p-4 transition-all hover:border-primary/50"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{model.name}</h3>
                      <Badge variant={model.status === 'active' ? 'success' : 'secondary'}>
                        {model.status === 'active' ? (
                          <><CheckCircle className="mr-1 h-3 w-3" /> Active</>
                        ) : (
                          <><Clock className="mr-1 h-3 w-3" /> Training</>
                        )}
                      </Badge>
                      {model.alert_triggered && (
                        <Badge variant="destructive">
                          <AlertTriangle className="mr-1 h-3 w-3" /> Alert
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        {model.disease}
                      </span>
                      <span>{model.model_type}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Updated: {model.last_updated}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">{model.accuracy}%</p>
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Prediction</p>
                    <p className="font-medium text-foreground">{model.prediction}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Confidence</p>
                    <Badge variant={model.confidence === 'high' ? 'success' : model.confidence === 'medium' ? 'warning' : 'secondary'}>
                      {model.confidence.charAt(0).toUpperCase() + model.confidence.slice(1)}
                    </Badge>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Regions Affected</p>
                    <p className="text-sm text-foreground">{model.regions_affected.join(', ')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Model Performance Over Time
          </CardTitle>
          <CardDescription>Accuracy, precision, and recall metrics for the ensemble model</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={modelPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis domain={[70, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="accuracy" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} name="Accuracy" />
                <Line type="monotone" dataKey="precision" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} name="Precision" />
                <Line type="monotone" dataKey="recall" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} name="Recall" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Regional Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Regional Risk Assessment
          </CardTitle>
          <CardDescription>AI-computed outbreak risk scores by region (0-100)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Region</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Cholera</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Measles</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Lassa</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Malaria</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Overall Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {riskAssessmentData.map((region) => (
                  <tr key={region.region} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium text-foreground">{region.region}</td>
                    <td className="px-4 py-3 text-center">
                      <RiskBadge value={region.cholera} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <RiskBadge value={region.measles} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <RiskBadge value={region.lassa} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <RiskBadge value={region.malaria} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={region.overall >= 70 ? 'destructive' : region.overall >= 50 ? 'warning' : 'success'}>
                        {region.overall}
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

function RiskBadge({ value }: { value: number }) {
  const getColor = () => {
    if (value >= 70) return 'bg-destructive/20 text-destructive';
    if (value >= 40) return 'bg-warning/20 text-warning';
    return 'bg-success/20 text-success';
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getColor()}`}>
      {value}
    </span>
  );
}
