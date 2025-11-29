'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertTriangle,
  Calendar,
  MapPin,
  Users,
  Activity,
  Plus,
  Flame,
  Shield,
  Clock,
} from 'lucide-react';

// Mock events/outbreaks data
const mockEvents = [
  {
    id: '1',
    external_id: 'EVT-2024-00012',
    title: 'Cholera Outbreak - Lagos Mainland',
    disease: 'Cholera',
    event_type: 'outbreak',
    status: 'ongoing',
    start_date: '2024-01-10',
    end_date: null,
    admin_unit: 'Lagos - Lagos Mainland',
    cases_count: 45,
    deaths_count: 3,
    contacts_count: 120,
    risk_level: 'high',
    description: 'Cluster of cholera cases linked to contaminated water source',
    response_status: 'active',
  },
  {
    id: '2',
    external_id: 'EVT-2024-00011',
    title: 'Measles Cluster - Kano Urban',
    disease: 'Measles',
    event_type: 'cluster',
    status: 'ongoing',
    start_date: '2024-01-08',
    end_date: null,
    admin_unit: 'Kano - Kano Municipal',
    cases_count: 28,
    deaths_count: 1,
    contacts_count: 85,
    risk_level: 'medium',
    description: 'Measles cluster in unvaccinated community',
    response_status: 'active',
  },
  {
    id: '3',
    external_id: 'EVT-2024-00010',
    title: 'Lassa Fever - Edo State',
    disease: 'Lassa Fever',
    event_type: 'outbreak',
    status: 'ongoing',
    start_date: '2024-01-05',
    end_date: null,
    admin_unit: 'Edo - Esan North East',
    cases_count: 12,
    deaths_count: 2,
    contacts_count: 45,
    risk_level: 'high',
    description: 'Annual Lassa fever season with increased cases',
    response_status: 'active',
  },
  {
    id: '4',
    external_id: 'EVT-2024-00009',
    title: 'Yellow Fever - Cross River',
    disease: 'Yellow Fever',
    event_type: 'suspected_outbreak',
    status: 'under_investigation',
    start_date: '2024-01-12',
    end_date: null,
    admin_unit: 'Cross River - Ogoja',
    cases_count: 5,
    deaths_count: 1,
    contacts_count: 15,
    risk_level: 'medium',
    description: 'Suspected yellow fever cases under investigation',
    response_status: 'investigating',
  },
  {
    id: '5',
    external_id: 'EVT-2023-00245',
    title: 'COVID-19 Cluster - Abuja',
    disease: 'COVID-19',
    event_type: 'cluster',
    status: 'closed',
    start_date: '2023-12-15',
    end_date: '2024-01-05',
    admin_unit: 'FCT - Abuja Municipal',
    cases_count: 35,
    deaths_count: 0,
    contacts_count: 110,
    risk_level: 'low',
    description: 'Workplace cluster successfully contained',
    response_status: 'closed',
  },
];

const statuses = ['All Statuses', 'ongoing', 'under_investigation', 'closed'];
const eventTypes = ['All Types', 'outbreak', 'cluster', 'suspected_outbreak', 'surveillance_event'];
const riskLevels = ['All Risk Levels', 'high', 'medium', 'low'];

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedRisk, setSelectedRisk] = useState('All Risk Levels');

  const filteredEvents = mockEvents.filter((e) => {
    if (selectedStatus !== 'All Statuses' && e.status !== selectedStatus) return false;
    if (selectedType !== 'All Types' && e.event_type !== selectedType) return false;
    if (selectedRisk !== 'All Risk Levels' && e.risk_level !== selectedRisk) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        e.external_id.toLowerCase().includes(search) ||
        e.title.toLowerCase().includes(search) ||
        e.disease.toLowerCase().includes(search) ||
        e.admin_unit.toLowerCase().includes(search)
      );
    }
    return true;
  });

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

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case 'outbreak':
        return <Badge variant="destructive">Outbreak</Badge>;
      case 'cluster':
        return <Badge variant="warning">Cluster</Badge>;
      case 'suspected_outbreak':
        return <Badge variant="secondary">Suspected Outbreak</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const stats = {
    ongoing: mockEvents.filter((e) => e.status === 'ongoing').length,
    investigating: mockEvents.filter((e) => e.status === 'under_investigation').length,
    totalCases: mockEvents.reduce((sum, e) => sum + e.cases_count, 0),
    totalDeaths: mockEvents.reduce((sum, e) => sum + e.deaths_count, 0),
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Events & Outbreaks</h1>
          <p className="text-muted-foreground">
            Monitor and manage disease events and outbreak responses
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Report Event
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-destructive/20 p-3">
                <Flame className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.ongoing}</p>
                <p className="text-sm text-muted-foreground">Active Outbreaks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-warning/20 p-3">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.investigating}</p>
                <p className="text-sm text-muted-foreground">Under Investigation</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/20 p-3">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalCases}</p>
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
                <p className="text-2xl font-bold text-foreground">{stats.totalDeaths}</p>
                <p className="text-sm text-muted-foreground">Total Deaths</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search events by ID, title, disease, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-48"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s === 'All Statuses' ? s : s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </Select>
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-48"
            >
              {eventTypes.map((t) => (
                <option key={t} value={t}>
                  {t === 'All Types' ? t : t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </Select>
            <Select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-40"
            >
              {riskLevels.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="overflow-hidden transition-all hover:border-primary/50">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-primary">{event.external_id}</span>
                    {getEventTypeBadge(event.event_type)}
                  </div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                </div>
                <AlertTriangle className={`h-5 w-5 ${event.risk_level === 'high' ? 'text-destructive' : event.risk_level === 'medium' ? 'text-warning' : 'text-muted-foreground'}`} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

              <div className="flex flex-wrap gap-2">
                {getStatusBadge(event.status)}
                {getRiskBadge(event.risk_level)}
                <Badge variant="outline">{event.disease}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted/50 p-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{event.cases_count}</p>
                  <p className="text-xs text-muted-foreground">Cases</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{event.deaths_count}</p>
                  <p className="text-xs text-muted-foreground">Deaths</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{event.contacts_count}</p>
                  <p className="text-xs text-muted-foreground">Contacts</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{event.admin_unit}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{event.start_date}</span>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing 1 to {filteredEvents.length} of {filteredEvents.length} events
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
