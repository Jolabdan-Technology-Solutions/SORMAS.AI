'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Activity,
  Users,
  Clock,
  AlertTriangle,
  FileText,
  Flame,
  Shield,
  TrendingUp,
  Phone,
  Building,
  CheckCircle,
  Target,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

// Mock event data
const getMockEvent = (id: string) => ({
  id,
  external_id: `EVT-2024-${id.padStart(5, '0')}`,
  title: 'Cholera Outbreak - Lagos Mainland',
  disease: 'Cholera',
  event_type: 'outbreak',
  status: 'ongoing',
  risk_level: 'high',
  start_date: '2024-01-10',
  end_date: null,
  detection_date: '2024-01-11',
  notification_date: '2024-01-11',
  description: 'Cluster of cholera cases linked to contaminated water source in Lagos Mainland area. Initial cases reported from Oregun market area with rapid spread to surrounding neighborhoods.',
  admin_unit: {
    country: 'Nigeria',
    state: 'Lagos',
    lga: 'Lagos Mainland',
    affected_wards: ['Oregun', 'Ojota', 'Maryland'],
  },
  statistics: {
    total_cases: 67,
    confirmed_cases: 45,
    probable_cases: 15,
    suspected_cases: 7,
    deaths: 4,
    recovered: 38,
    active: 25,
    hospitalized: 18,
    contacts_identified: 234,
    contacts_under_follow_up: 189,
    cfr: 5.97,
    attack_rate: 12.5,
  },
  epidemiological_curve: [
    { date: 'Jan 10', cases: 3, deaths: 0 },
    { date: 'Jan 11', cases: 5, deaths: 0 },
    { date: 'Jan 12', cases: 8, deaths: 1 },
    { date: 'Jan 13', cases: 12, deaths: 0 },
    { date: 'Jan 14', cases: 15, deaths: 1 },
    { date: 'Jan 15', cases: 10, deaths: 1 },
    { date: 'Jan 16', cases: 8, deaths: 0 },
    { date: 'Jan 17', cases: 4, deaths: 1 },
    { date: 'Jan 18', cases: 2, deaths: 0 },
  ],
  age_distribution: [
    { group: '0-4', cases: 8 },
    { group: '5-14', cases: 12 },
    { group: '15-24', cases: 15 },
    { group: '25-44', cases: 20 },
    { group: '45-64', cases: 9 },
    { group: '65+', cases: 3 },
  ],
  source_investigation: {
    probable_source: 'Contaminated community water well',
    source_location: 'Oregun Market Area',
    investigation_status: 'Confirmed',
    water_samples_tested: 5,
    positive_samples: 3,
    environmental_measures: [
      'Water source chlorinated',
      'Boreholes sealed pending testing',
      'Alternative water supply provided',
      'Community sensitization ongoing',
    ],
  },
  response_activities: [
    { date: '2024-01-11', activity: 'Outbreak declared', status: 'completed' },
    { date: '2024-01-11', activity: 'Rapid Response Team deployed', status: 'completed' },
    { date: '2024-01-12', activity: 'Case management initiated', status: 'completed' },
    { date: '2024-01-12', activity: 'Contact tracing started', status: 'ongoing' },
    { date: '2024-01-13', activity: 'Water source investigation', status: 'completed' },
    { date: '2024-01-13', activity: 'Environmental health intervention', status: 'ongoing' },
    { date: '2024-01-14', activity: 'Community sensitization', status: 'ongoing' },
    { date: '2024-01-15', activity: 'ORS distribution', status: 'ongoing' },
  ],
  linked_cases: [
    { id: 'NGA-2024-00123', name: 'John Doe', classification: 'confirmed', outcome: 'recovered' },
    { id: 'NGA-2024-00124', name: 'Jane Smith', classification: 'confirmed', outcome: 'ongoing' },
    { id: 'NGA-2024-00125', name: 'Ahmed Ibrahim', classification: 'probable', outcome: 'recovered' },
    { id: 'NGA-2024-00126', name: 'Mary Johnson', classification: 'confirmed', outcome: 'deceased' },
  ],
  response_team: {
    lead: 'Dr. Aisha Mohammed',
    lead_phone: '+234 802 000 0001',
    organization: 'NCDC Nigeria',
    team_size: 15,
  },
  last_updated: '2024-01-18T14:30:00',
});

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
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  const event = getMockEvent(eventId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ongoing':
        return <Badge variant="destructive">Ongoing</Badge>;
      case 'under_investigation':
        return <Badge variant="warning">Under Investigation</Badge>;
      case 'closed':
        return <Badge variant="success">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium Risk</Badge>;
      case 'low':
        return <Badge variant="success">Low Risk</Badge>;
      default:
        return <Badge variant="secondary">{risk}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/events">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{event.title}</h1>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-sm text-primary">{event.external_id}</span>
              {getStatusBadge(event.status)}
              {getRiskBadge(event.risk_level)}
              <Badge variant="outline">{event.event_type}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Event
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-destructive/20 p-3">
                <Activity className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{event.statistics.total_cases}</p>
                <p className="text-sm text-muted-foreground">Total Cases</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-muted-foreground">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-muted p-3">
                <Shield className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{event.statistics.deaths}</p>
                <p className="text-sm text-muted-foreground">Deaths</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-warning/20 p-3">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{event.statistics.cfr}%</p>
                <p className="text-sm text-muted-foreground">Case Fatality Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/20 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{event.statistics.contacts_identified}</p>
                <p className="text-sm text-muted-foreground">Contacts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-success/20 p-3">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{event.statistics.recovered}</p>
                <p className="text-sm text-muted-foreground">Recovered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Epidemic Curve */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Epidemic Curve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={event.epidemiological_curve}>
                <defs>
                  <linearGradient id="colorCasesEvent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis dataKey="date" stroke="#A1A1AA" fontSize={12} />
                <YAxis stroke="#A1A1AA" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="cases"
                  name="Cases"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fill="url(#colorCasesEvent)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Age Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Age Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={event.age_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis dataKey="group" stroke="#A1A1AA" fontSize={12} />
                <YAxis stroke="#A1A1AA" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="cases" name="Cases" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{event.description}</p>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Disease</span>
                <Badge variant="destructive">{event.disease}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Start Date</span>
                <span className="text-sm font-medium text-foreground">{event.start_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Detection Date</span>
                <span className="text-sm font-medium text-foreground">{event.detection_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Attack Rate</span>
                <span className="text-sm font-medium text-foreground">{event.statistics.attack_rate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Affected Area
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Country</span>
                <span className="text-sm font-medium text-foreground">{event.admin_unit.country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">State</span>
                <span className="text-sm font-medium text-foreground">{event.admin_unit.state}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">LGA</span>
                <span className="text-sm font-medium text-foreground">{event.admin_unit.lga}</span>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Affected Wards</p>
              <div className="flex flex-wrap gap-2">
                {event.admin_unit.affected_wards.map((ward, idx) => (
                  <Badge key={idx} variant="outline">{ward}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Source Investigation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Source Investigation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Probable Source</p>
                <p className="text-sm font-medium text-foreground">{event.source_investigation.probable_source}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium text-foreground">{event.source_investigation.source_location}</p>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Samples Tested</span>
                <span className="text-sm font-medium text-foreground">{event.source_investigation.water_samples_tested}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Positive Samples</span>
                <span className="text-sm font-medium text-destructive">{event.source_investigation.positive_samples}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Response Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {event.response_activities.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-4 rounded-lg border border-border p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  activity.status === 'completed' ? 'bg-success/20' : 'bg-warning/20'
                }`}>
                  {activity.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <Clock className="h-5 w-5 text-warning" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{activity.activity}</p>
                  <p className="text-xs text-muted-foreground">{activity.date}</p>
                </div>
                <Badge variant={activity.status === 'completed' ? 'success' : 'warning'}>
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Linked Cases */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Linked Cases ({event.linked_cases.length} of {event.statistics.total_cases})
          </CardTitle>
          <Link href="/cases">
            <Button variant="ghost" size="sm">View All Cases</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {event.linked_cases.map((c) => (
              <Link key={c.id} href={`/cases/${c.id}`}>
                <div className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-primary">{c.id}</span>
                    <Badge variant={c.classification === 'confirmed' ? 'destructive' : 'warning'}>
                      {c.classification}
                    </Badge>
                  </div>
                  <p className="mt-2 font-medium text-foreground">{c.name}</p>
                  <Badge variant={c.outcome === 'recovered' ? 'success' : c.outcome === 'deceased' ? 'destructive' : 'warning'} className="mt-2">
                    {c.outcome}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Response Team */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Response Lead: {event.response_team.lead}</p>
                <p className="text-sm text-muted-foreground">{event.response_team.organization} • Team Size: {event.response_team.team_size}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{event.response_team.lead_phone}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
