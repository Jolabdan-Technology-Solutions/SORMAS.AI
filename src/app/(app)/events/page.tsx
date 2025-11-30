'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Activity,
  Plus,
  Flame,
  Shield,
  Clock,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

// Default tenant ID - should come from auth context in production
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

// Check if in demo mode
function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('sormas_demo_mode') === 'true';
}

// Generate demo events data
function generateDemoEvents(): Event[] {
  const diseases = ['Cholera', 'Malaria', 'COVID-19', 'Measles', 'Lassa Fever', 'Meningitis', 'Yellow Fever'];
  const locations = ['Lagos State', 'Kano State', 'Abuja FCT', 'Rivers State', 'Oyo State', 'Kaduna State', 'Borno State'];
  const eventTypes = ['outbreak', 'cluster', 'suspected_outbreak', 'surveillance_event'];
  const statuses = ['ongoing', 'under_investigation', 'closed'];
  const riskLevels = ['high', 'medium', 'low'];

  return [
    {
      id: 'demo-event-1',
      external_id: 'EVT-2024-001',
      name: 'Lagos Cholera Outbreak 2024',
      event_type: 'outbreak',
      status: 'ongoing',
      start_date: '2024-11-15',
      end_date: null,
      description: 'Active cholera outbreak affecting multiple LGAs in Lagos State with increasing case count.',
      total_cases: 245,
      total_deaths: 12,
      total_contacts: 892,
      risk_level: 'high',
      disease: { name: 'Cholera' },
      admin_unit: { name: 'Lagos State' },
    },
    {
      id: 'demo-event-2',
      external_id: 'EVT-2024-002',
      name: 'Kano Measles Cluster',
      event_type: 'cluster',
      status: 'under_investigation',
      start_date: '2024-11-20',
      end_date: null,
      description: 'Cluster of measles cases reported in Nassarawa LGA, primarily affecting unvaccinated children.',
      total_cases: 89,
      total_deaths: 4,
      total_contacts: 234,
      risk_level: 'medium',
      disease: { name: 'Measles' },
      admin_unit: { name: 'Kano State' },
    },
    {
      id: 'demo-event-3',
      external_id: 'EVT-2024-003',
      name: 'Borno Meningitis Response',
      event_type: 'outbreak',
      status: 'ongoing',
      start_date: '2024-11-10',
      end_date: null,
      description: 'Meningitis outbreak in IDP camps requiring urgent vaccination response.',
      total_cases: 178,
      total_deaths: 15,
      total_contacts: 567,
      risk_level: 'high',
      disease: { name: 'Meningitis' },
      admin_unit: { name: 'Borno State' },
    },
    {
      id: 'demo-event-4',
      external_id: 'EVT-2024-004',
      name: 'Abuja COVID-19 Surveillance',
      event_type: 'surveillance_event',
      status: 'ongoing',
      start_date: '2024-10-01',
      end_date: null,
      description: 'Ongoing COVID-19 surveillance and testing in FCT hospitals.',
      total_cases: 156,
      total_deaths: 2,
      total_contacts: 445,
      risk_level: 'low',
      disease: { name: 'COVID-19' },
      admin_unit: { name: 'Abuja FCT' },
    },
    {
      id: 'demo-event-5',
      external_id: 'EVT-2024-005',
      name: 'Rivers Lassa Fever Alert',
      event_type: 'suspected_outbreak',
      status: 'under_investigation',
      start_date: '2024-11-25',
      end_date: null,
      description: 'Suspected Lassa fever cases reported from healthcare facilities.',
      total_cases: 23,
      total_deaths: 3,
      total_contacts: 78,
      risk_level: 'high',
      disease: { name: 'Lassa Fever' },
      admin_unit: { name: 'Rivers State' },
    },
    {
      id: 'demo-event-6',
      external_id: 'EVT-2024-006',
      name: 'Oyo Yellow Fever Investigation',
      event_type: 'suspected_outbreak',
      status: 'closed',
      start_date: '2024-10-15',
      end_date: '2024-11-01',
      description: 'Investigation concluded. No yellow fever outbreak confirmed.',
      total_cases: 12,
      total_deaths: 1,
      total_contacts: 45,
      risk_level: 'medium',
      disease: { name: 'Yellow Fever' },
      admin_unit: { name: 'Oyo State' },
    },
  ];
}

interface Event {
  id: string;
  external_id: string;
  name: string;
  event_type: string;
  status: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  total_cases: number;
  total_deaths: number;
  total_contacts: number;
  risk_level: string | null;
  disease: { name: string } | null;
  admin_unit: { name: string } | null;
}

const statuses = ['All Statuses', 'ongoing', 'under_investigation', 'closed'];
const eventTypes = ['All Types', 'outbreak', 'cluster', 'suspected_outbreak', 'surveillance_event'];
const riskLevels = ['All Risk Levels', 'high', 'medium', 'low'];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedRisk, setSelectedRisk] = useState('All Risk Levels');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 12;

  const supabase = createClient();

  const fetchEvents = async () => {
    try {
      // Check if in demo mode
      if (isDemoMode()) {
        const demoEvents = generateDemoEvents();
        // Transform the data
        const transformedEvents = demoEvents.map((event) => ({
          ...event,
          disease: event.disease,
          admin_unit: event.admin_unit,
        }));
        setEvents(transformedEvents);
        setTotalCount(6);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      let query = supabase
        .from('events')
        .select(`
          id, external_id, name, event_type, status, start_date, end_date,
          description, total_cases, total_deaths, total_contacts, risk_level,
          disease:diseases(name),
          admin_unit:admin_units(name)
        `, { count: 'exact' })
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .order('start_date', { ascending: false });

      // Apply filters
      if (selectedStatus !== 'All Statuses') {
        query = query.eq('status', selectedStatus);
      }
      if (selectedType !== 'All Types') {
        query = query.eq('event_type', selectedType);
      }
      if (selectedRisk !== 'All Risk Levels') {
        query = query.eq('risk_level', selectedRisk);
      }
      if (searchTerm) {
        query = query.or(`external_id.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform data to handle Supabase join arrays
      const transformedData = (data || []).map((row: any) => ({
        ...row,
        disease: Array.isArray(row.disease) ? row.disease[0] || null : row.disease,
        admin_unit: Array.isArray(row.admin_unit) ? row.admin_unit[0] || null : row.admin_unit,
      })) as Event[];

      setEvents(transformedData);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedStatus, selectedType, selectedRisk, page]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchEvents();
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

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

  const getRiskBadge = (risk: string | null) => {
    switch (risk) {
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium Risk</Badge>;
      case 'low':
        return <Badge variant="success">Low Risk</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
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
    ongoing: events.filter((e) => e.status === 'ongoing').length,
    investigating: events.filter((e) => e.status === 'under_investigation').length,
    totalCases: events.reduce((sum, e) => sum + (e.total_cases || 0), 0),
    totalDeaths: events.reduce((sum, e) => sum + (e.total_deaths || 0), 0),
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

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
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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
                <p className="text-2xl font-bold text-foreground">{stats.totalCases.toLocaleString()}</p>
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
                  placeholder="Search events by ID, title, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={(value) => { setSelectedStatus(value); setPage(1); }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === 'All Statuses' ? s : s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={(value) => { setSelectedType(value); setPage(1); }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t === 'All Types' ? t : t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedRisk} onValueChange={(value) => { setSelectedRisk(value); setPage(1); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                {riskLevels.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="flex h-[400px] flex-col items-center justify-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No Events Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchTerm || selectedStatus !== 'All Statuses' || selectedType !== 'All Types' || selectedRisk !== 'All Risk Levels'
                ? 'Try adjusting your filters or search terms'
                : 'No events have been recorded yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden transition-all hover:border-primary/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-primary">{event.external_id}</span>
                      {getEventTypeBadge(event.event_type)}
                    </div>
                    <CardTitle className="text-lg line-clamp-1">{event.name}</CardTitle>
                  </div>
                  <AlertTriangle className={`h-5 w-5 ${event.risk_level === 'high' ? 'text-destructive' : event.risk_level === 'medium' ? 'text-warning' : 'text-muted-foreground'}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{event.description || 'No description available'}</p>

                <div className="flex flex-wrap gap-2">
                  {getStatusBadge(event.status)}
                  {getRiskBadge(event.risk_level)}
                  <Badge variant="outline">{event.disease?.name || 'Unknown Disease'}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted/50 p-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{event.total_cases || 0}</p>
                    <p className="text-xs text-muted-foreground">Cases</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{event.total_deaths || 0}</p>
                    <p className="text-xs text-muted-foreground">Deaths</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{event.total_contacts || 0}</p>
                    <p className="text-xs text-muted-foreground">Contacts</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate max-w-[120px]">{event.admin_unit?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{event.start_date ? new Date(event.start_date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                <Link href={`/events/${event.id}`}>
                  <Button variant="outline" className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {totalCount} events
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
