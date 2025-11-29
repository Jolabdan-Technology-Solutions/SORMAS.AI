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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Eye,
  Check,
  X,
  Zap,
  MapPin,
  Activity,
  TrendingUp,
  Calendar,
  Users,
  Microscope,
  ChevronRight,
  Settings,
  BellRing,
  BellOff,
} from 'lucide-react';

// Alert data
const alertsData = [
  {
    id: 1,
    type: 'threshold_exceeded',
    severity: 'critical',
    title: 'Cholera cases exceed alert threshold in Lagos State',
    description: 'The number of cholera cases (67) has exceeded the configured alert threshold of 50 cases within the past 7 days. Immediate response action is recommended.',
    disease: 'Cholera',
    region: 'Lagos - Lagos Mainland',
    triggered_at: '2024-01-28T14:30:00',
    acknowledged: false,
    acknowledged_by: null,
    acknowledged_at: null,
    metric_value: 67,
    threshold_value: 50,
    recommendation: 'Activate outbreak response team, increase surveillance, and initiate case investigation.',
  },
  {
    id: 2,
    type: 'prediction_alert',
    severity: 'critical',
    title: 'AI predicts significant Lassa Fever increase in Edo State',
    description: 'Machine learning model predicts a 45% increase in Lassa Fever cases over the next 2 weeks based on seasonal patterns and current case trajectory.',
    disease: 'Lassa Fever',
    region: 'Edo - Esan North East',
    triggered_at: '2024-01-28T12:15:00',
    acknowledged: false,
    acknowledged_by: null,
    acknowledged_at: null,
    metric_value: 45,
    threshold_value: 30,
    recommendation: 'Prepare healthcare facilities, stock up on ribavirin, and issue community awareness messages.',
  },
  {
    id: 3,
    type: 'cluster_detected',
    severity: 'warning',
    title: 'Unusual measles cluster detected in Kano Urban',
    description: 'Spatial clustering algorithm detected 28 measles cases within a 5km radius in the past 14 days. This exceeds the expected baseline for this area.',
    disease: 'Measles',
    region: 'Kano - Kano Municipal',
    triggered_at: '2024-01-28T09:45:00',
    acknowledged: true,
    acknowledged_by: 'Dr. Aminu Yusuf',
    acknowledged_at: '2024-01-28T10:30:00',
    metric_value: 28,
    threshold_value: 15,
    recommendation: 'Conduct vaccination coverage assessment and consider supplementary immunization activities.',
  },
  {
    id: 4,
    type: 'contact_followup',
    severity: 'warning',
    title: 'Low contact follow-up rate in Rivers State',
    description: 'Contact follow-up compliance has dropped to 68% in Rivers State, below the target of 80%. This may lead to missed secondary cases.',
    disease: 'Cholera',
    region: 'Rivers - Port Harcourt',
    triggered_at: '2024-01-27T16:00:00',
    acknowledged: true,
    acknowledged_by: 'Nurse Grace Adeyemi',
    acknowledged_at: '2024-01-27T17:15:00',
    metric_value: 68,
    threshold_value: 80,
    recommendation: 'Review contact tracing team capacity and address barriers to follow-up visits.',
  },
  {
    id: 5,
    type: 'lab_delay',
    severity: 'info',
    title: 'Lab result turnaround time increased',
    description: 'Average laboratory turnaround time has increased to 4.2 days, above the target of 3 days. This may delay case confirmation and response.',
    disease: 'All',
    region: 'National',
    triggered_at: '2024-01-27T11:00:00',
    acknowledged: true,
    acknowledged_by: 'Dr. Aisha Mohammed',
    acknowledged_at: '2024-01-27T14:00:00',
    metric_value: 4.2,
    threshold_value: 3,
    recommendation: 'Assess laboratory capacity and consider sample prioritization protocols.',
  },
  {
    id: 6,
    type: 'threshold_exceeded',
    severity: 'warning',
    title: 'Yellow Fever cases approaching threshold in Cross River',
    description: 'Yellow Fever cases (8) are approaching the alert threshold of 10 in Cross River State. Early warning for potential outbreak.',
    disease: 'Yellow Fever',
    region: 'Cross River - Ogoja',
    triggered_at: '2024-01-27T08:30:00',
    acknowledged: false,
    acknowledged_by: null,
    acknowledged_at: null,
    metric_value: 8,
    threshold_value: 10,
    recommendation: 'Intensify surveillance and verify vaccination status of cases.',
  },
  {
    id: 7,
    type: 'data_quality',
    severity: 'info',
    title: 'Missing data detected in case reports',
    description: 'Data quality check found 15% of case reports in Oyo State are missing onset date information. This affects epidemiological analysis.',
    disease: 'All',
    region: 'Oyo - Ibadan',
    triggered_at: '2024-01-26T15:00:00',
    acknowledged: true,
    acknowledged_by: 'System Auto',
    acknowledged_at: '2024-01-26T15:00:00',
    metric_value: 15,
    threshold_value: 10,
    recommendation: 'Follow up with reporting facilities to complete missing information.',
  },
  {
    id: 8,
    type: 'prediction_alert',
    severity: 'info',
    title: 'Malaria cases expected to decrease',
    description: 'AI model predicts 12% decrease in malaria cases over the next 4 weeks as dry season progresses. Normal seasonal pattern.',
    disease: 'Malaria',
    region: 'National',
    triggered_at: '2024-01-26T09:00:00',
    acknowledged: true,
    acknowledged_by: 'Dr. Emmanuel Obi',
    acknowledged_at: '2024-01-26T10:00:00',
    metric_value: -12,
    threshold_value: 0,
    recommendation: 'Continue routine surveillance and maintain prevention activities.',
  },
];

// Alert configuration data
const alertConfigurations = [
  { disease: 'Cholera', threshold: 50, period: '7 days', enabled: true },
  { disease: 'Measles', threshold: 15, period: '14 days', enabled: true },
  { disease: 'Lassa Fever', threshold: 10, period: '7 days', enabled: true },
  { disease: 'Yellow Fever', threshold: 10, period: '7 days', enabled: true },
  { disease: 'COVID-19', threshold: 100, period: '7 days', enabled: false },
  { disease: 'Malaria', threshold: 500, period: '7 days', enabled: true },
];

const severities = ['All Severities', 'critical', 'warning', 'info'];
const types = ['All Types', 'threshold_exceeded', 'prediction_alert', 'cluster_detected', 'contact_followup', 'lab_delay', 'data_quality'];
const statuses = ['All Statuses', 'unacknowledged', 'acknowledged'];

export default function AlertsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('All Severities');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [showConfig, setShowConfig] = useState(false);

  const filteredAlerts = alertsData.filter((alert) => {
    if (selectedSeverity !== 'All Severities' && alert.severity !== selectedSeverity) return false;
    if (selectedType !== 'All Types' && alert.type !== selectedType) return false;
    if (selectedStatus === 'unacknowledged' && alert.acknowledged) return false;
    if (selectedStatus === 'acknowledged' && !alert.acknowledged) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        alert.title.toLowerCase().includes(search) ||
        alert.disease.toLowerCase().includes(search) ||
        alert.region.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const unacknowledgedCount = alertsData.filter(a => !a.acknowledged).length;
  const criticalCount = alertsData.filter(a => a.severity === 'critical' && !a.acknowledged).length;
  const warningCount = alertsData.filter(a => a.severity === 'warning' && !a.acknowledged).length;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'threshold_exceeded':
        return <TrendingUp className="h-4 w-4" />;
      case 'prediction_alert':
        return <Zap className="h-4 w-4" />;
      case 'cluster_detected':
        return <MapPin className="h-4 w-4" />;
      case 'contact_followup':
        return <Users className="h-4 w-4" />;
      case 'lab_delay':
        return <Microscope className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alerts & Notifications</h1>
          <p className="text-muted-foreground">
            Surveillance alerts, threshold breaches, and AI-generated warnings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowConfig(!showConfig)}>
            <Settings className="mr-2 h-4 w-4" />
            Configure Alerts
          </Button>
          <Button>
            <Check className="mr-2 h-4 w-4" />
            Acknowledge All
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
                <p className="text-3xl font-bold text-foreground">{alertsData.length}</p>
              </div>
              <div className="rounded-full bg-primary/20 p-3">
                <Bell className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-3xl font-bold text-foreground">{criticalCount}</p>
                <p className="text-xs text-muted-foreground">Unacknowledged</p>
              </div>
              <div className="rounded-full bg-destructive/20 p-3">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warning</p>
                <p className="text-3xl font-bold text-foreground">{warningCount}</p>
                <p className="text-xs text-muted-foreground">Unacknowledged</p>
              </div>
              <div className="rounded-full bg-warning/20 p-3">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Acknowledged</p>
                <p className="text-3xl font-bold text-foreground">{alertsData.length - unacknowledgedCount}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
              <div className="rounded-full bg-success/20 p-3">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Configuration Panel */}
      {showConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Alert Configuration
            </CardTitle>
            <CardDescription>Configure alert thresholds and notification settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Disease</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Threshold</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Period</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {alertConfigurations.map((config) => (
                    <tr key={config.disease} className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium text-foreground">{config.disease}</td>
                      <td className="px-4 py-3 text-center text-foreground">{config.threshold} cases</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{config.period}</td>
                      <td className="px-4 py-3 text-center">
                        {config.enabled ? (
                          <Badge variant="success">
                            <BellRing className="mr-1 h-3 w-3" /> Enabled
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <BellOff className="mr-1 h-3 w-3" /> Disabled
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button variant="ghost" size="sm">Edit</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                {severities.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t === 'All Types' ? t : t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <Card
            key={alert.id}
            className={`transition-all ${
              !alert.acknowledged
                ? alert.severity === 'critical'
                  ? 'border-l-4 border-l-destructive'
                  : alert.severity === 'warning'
                    ? 'border-l-4 border-l-warning'
                    : 'border-l-4 border-l-primary'
                : 'opacity-75'
            }`}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
                    alert.severity === 'critical'
                      ? 'bg-destructive/20'
                      : alert.severity === 'warning'
                        ? 'bg-warning/20'
                        : 'bg-primary/20'
                  }`}
                >
                  {getSeverityIcon(alert.severity)}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{alert.title}</h3>
                        {alert.acknowledged && (
                          <Badge variant="success">
                            <CheckCircle className="mr-1 h-3 w-3" /> Acknowledged
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {getTypeIcon(alert.type)}
                          {alert.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="h-4 w-4" />
                          {alert.disease}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {alert.region}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(alert.triggered_at)}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        alert.severity === 'critical'
                          ? 'destructive'
                          : alert.severity === 'warning'
                            ? 'warning'
                            : 'secondary'
                      }
                    >
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">{alert.description}</p>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Current Value</p>
                      <p className="text-lg font-bold text-foreground">
                        {alert.metric_value}
                        {alert.type === 'contact_followup' && '%'}
                        {alert.type === 'lab_delay' && ' days'}
                        {alert.type === 'prediction_alert' && '%'}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Threshold</p>
                      <p className="text-lg font-bold text-foreground">
                        {alert.threshold_value}
                        {alert.type === 'contact_followup' && '%'}
                        {alert.type === 'lab_delay' && ' days'}
                        {alert.type === 'prediction_alert' && '%'}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Recommendation</p>
                      <p className="text-sm text-foreground line-clamp-2">{alert.recommendation}</p>
                    </div>
                  </div>

                  {alert.acknowledged && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-success" />
                      Acknowledged by {alert.acknowledged_by} on {new Date(alert.acknowledged_at!).toLocaleString()}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    {!alert.acknowledged && (
                      <Button size="sm">
                        <Check className="mr-1 h-4 w-4" />
                        Acknowledge
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="mr-1 h-4 w-4" />
                      View Details
                    </Button>
                    <Button variant="ghost" size="sm">
                      <X className="mr-1 h-4 w-4" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredAlerts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-semibold text-foreground">No alerts found</h3>
              <p className="text-muted-foreground">No alerts match your current filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
