'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Users,
  Calendar,
  MapPin,
  Phone,
  UserCheck,
  UserX,
  Clock,
  Plus,
  Network,
  GitBranch,
  Map,
  List,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react';
import { ContactNetworkDiagram } from '@/components/contacts/ContactNetworkDiagram';
import { ContactTracingTimeline } from '@/components/contacts/ContactTracingTimeline';
import { createClient } from '@/lib/supabase/client';

// Dynamically import map to avoid SSR issues
const FollowUpMap = dynamic(
  () => import('@/components/contacts/FollowUpMap').then((mod) => mod.FollowUpMap),
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

// Default tenant ID
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

// Check if in demo mode
function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('sormas_demo_mode') === 'true';
}

// Generate demo contacts data
function generateDemoContacts(): Contact[] {
  const relationships = ['spouse', 'colleague', 'neighbor', 'friend', 'family', 'healthcare worker', 'patient'];
  const contactTypes = ['direct', 'household', 'workplace', 'community', 'healthcare'];
  const riskLevels = ['high', 'medium', 'low'];
  const statuses = ['under_follow_up', 'completed', 'lost_to_follow_up', 'converted_to_case'];
  const locations = ['Lagos State', 'Kano State', 'Abuja FCT', 'Rivers State', 'Oyo State'];
  const firstNames = ['Adaeze', 'Chukwuemeka', 'Fatima', 'Ibrahim', 'Ngozi', 'Olumide', 'Amina', 'Emeka', 'Zainab', 'Tunde'];
  const lastNames = ['Okonkwo', 'Abdullahi', 'Adeyemi', 'Mohammed', 'Nnamdi', 'Bello', 'Okoro', 'Yusuf', 'Eze', 'Aliyu'];
  const diseases = ['Cholera', 'COVID-19', 'Lassa Fever', 'Measles'];

  return Array.from({ length: 25 }, (_, i) => {
    const contactDate = new Date();
    contactDate.setDate(contactDate.getDate() - Math.floor(Math.random() * 30));
    const followUpUntil = new Date(contactDate);
    followUpUntil.setDate(followUpUntil.getDate() + 21);

    return {
      id: `demo-contact-${i + 1}`,
      contact_date: contactDate.toISOString().split('T')[0],
      contact_type: contactTypes[Math.floor(Math.random() * contactTypes.length)],
      relationship_to_case: relationships[Math.floor(Math.random() * relationships.length)],
      risk_level: riskLevels[Math.floor(Math.random() * riskLevels.length)],
      follow_up_status: statuses[Math.floor(Math.random() * statuses.length)],
      follow_up_until: followUpUntil.toISOString().split('T')[0],
      person: {
        id: `person-${i}`,
        first_name: firstNames[Math.floor(Math.random() * firstNames.length)],
        last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
        age_years: Math.floor(Math.random() * 60) + 10,
        sex: Math.random() > 0.5 ? 'Male' : 'Female',
        phone: `+234 ${Math.floor(Math.random() * 900000000) + 100000000}`,
      },
      case: {
        id: `case-${i}`,
        external_id: `NGA-2024-${String(10000 + i).padStart(5, '0')}`,
        disease: { name: diseases[Math.floor(Math.random() * diseases.length)] },
      },
      admin_unit: {
        id: `admin-${i}`,
        name: locations[Math.floor(Math.random() * locations.length)],
        code: `NG-${Math.floor(Math.random() * 36) + 1}`,
      },
    };
  });
}

interface Person {
  id: string;
  first_name: string;
  last_name: string;
  age_years: number;
  sex: string;
  phone: string;
}

interface Case {
  id: string;
  external_id: string;
  disease: { name: string } | null;
}

interface AdminUnit {
  id: string;
  name: string;
  code: string;
}

interface Contact {
  id: string;
  contact_date: string;
  contact_type: string;
  relationship_to_case: string | null;
  risk_level: string;
  follow_up_status: string;
  follow_up_until: string | null;
  person: Person | null;
  case: Case | null;
  admin_unit: AdminUnit | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type ViewTab = 'list' | 'network' | 'timeline' | 'map';

export default function ContactsPage() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState({
    under_follow_up: 0,
    completed: 0,
    lost: 0,
    converted: 0,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>('list');

  // Options
  const [adminUnits, setAdminUnits] = useState<AdminUnit[]>([]);
  const [selectedAdminUnit, setSelectedAdminUnit] = useState('all');

  const supabase = createClient();

  // Fetch admin units for dropdown
  useEffect(() => {
    const fetchOptions = async () => {
      const { data } = await supabase
        .from('admin_units')
        .select('id, name, code')
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .order('name');

      if (data) setAdminUnits(data);
    };

    fetchOptions();
  }, []);

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      // Check if in demo mode
      if (isDemoMode()) {
        const demoContacts = generateDemoContacts();
        setContacts(demoContacts);
        setPagination({
          page: 1,
          limit: 25,
          total: 4523,
          totalPages: 181,
        });
        setStats({
          under_follow_up: 2345,
          completed: 1567,
          lost: 234,
          converted: 377,
        });
        setLoading(false);
        return;
      }

      const offset = (pagination.page - 1) * pagination.limit;

      let query = supabase
        .from('contacts')
        .select(
          `
          id, contact_date, contact_type, relationship_to_case, risk_level,
          follow_up_status, follow_up_until,
          person:persons(id, first_name, last_name, age_years, sex, phone),
          case:cases(id, external_id, disease:diseases(name)),
          admin_unit:admin_units(id, name, code)
        `,
          { count: 'exact' }
        )
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .order('created_at', { ascending: false })
        .range(offset, offset + pagination.limit - 1);

      // Apply filters
      if (selectedStatus !== 'all') {
        query = query.eq('follow_up_status', selectedStatus);
      }
      if (selectedRisk !== 'all') {
        query = query.eq('risk_level', selectedRisk);
      }
      if (selectedType !== 'all') {
        query = query.eq('contact_type', selectedType);
      }
      if (selectedAdminUnit !== 'all') {
        query = query.eq('admin_unit_id', selectedAdminUnit);
      }
      if (startDate) {
        query = query.gte('contact_date', startDate);
      }
      if (endDate) {
        query = query.lte('contact_date', endDate);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      // Transform data to match Contact interface
      const transformedData = (data || []).map((row: any) => ({
        ...row,
        person: Array.isArray(row.person) ? row.person[0] || null : row.person,
        case: Array.isArray(row.case) ? row.case[0] || null : row.case,
        admin_unit: Array.isArray(row.admin_unit) ? row.admin_unit[0] || null : row.admin_unit,
      })) as Contact[];

      setContacts(transformedData);
      setPagination((prev) => ({
        ...prev,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / prev.limit),
      }));

      // Fetch stats
      const [underFollowUp, completed, lost, converted] = await Promise.all([
        supabase
          .from('contacts')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', DEFAULT_TENANT_ID)
          .eq('follow_up_status', 'under_follow_up'),
        supabase
          .from('contacts')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', DEFAULT_TENANT_ID)
          .eq('follow_up_status', 'completed'),
        supabase
          .from('contacts')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', DEFAULT_TENANT_ID)
          .eq('follow_up_status', 'lost_to_follow_up'),
        supabase
          .from('contacts')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', DEFAULT_TENANT_ID)
          .eq('follow_up_status', 'converted_to_case'),
      ]);

      setStats({
        under_follow_up: underFollowUp.count || 0,
        completed: completed.count || 0,
        lost: lost.count || 0,
        converted: converted.count || 0,
      });
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    selectedStatus,
    selectedRisk,
    selectedType,
    selectedAdminUnit,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Reset page when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [selectedStatus, selectedRisk, selectedType, selectedAdminUnit, startDate, endDate, searchTerm]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch(`/api/tenants/${DEFAULT_TENANT_ID}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_type: 'contacts',
          format: 'csv',
          filters: {
            startDate,
            endDate,
          },
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contacts_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedRisk('all');
    setSelectedType('all');
    setSelectedAdminUnit('all');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters =
    searchTerm ||
    selectedStatus !== 'all' ||
    selectedRisk !== 'all' ||
    selectedType !== 'all' ||
    selectedAdminUnit !== 'all' ||
    startDate ||
    endDate;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'under_follow_up':
        return <Badge variant="warning">Under Follow-up</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'lost_to_follow_up':
        return <Badge variant="destructive">Lost to Follow-up</Badge>;
      case 'converted_to_case':
        return <Badge variant="destructive">Converted to Case</Badge>;
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

  // Calculate days remaining for follow-up
  const getDaysRemaining = (followUpUntil: string | null): number => {
    if (!followUpUntil) return 0;
    const today = new Date();
    const endDate = new Date(followUpUntil);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const tabs = [
    { id: 'list' as const, label: 'Contact List', icon: List },
    { id: 'network' as const, label: 'Network Diagram', icon: Network },
    { id: 'timeline' as const, label: 'Tracing Timeline', icon: GitBranch },
    { id: 'map' as const, label: 'Follow-up Map', icon: Map },
  ];

  // Filter contacts by search term (client-side for name search)
  const filteredContacts = contacts.filter((c) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const personName = `${c.person?.first_name || ''} ${c.person?.last_name || ''}`.toLowerCase();
      const caseId = c.case?.external_id?.toLowerCase() || '';
      const location = c.admin_unit?.name?.toLowerCase() || '';
      return personName.includes(search) || caseId.includes(search) || location.includes(search);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
          <p className="text-muted-foreground">
            Manage and track contact follow-up activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export
          </Button>
          <Link href="/etl/import">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Import Contacts
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-warning">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-warning/20 p-3">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.under_follow_up.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Under Follow-up</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-success/20 p-3">
                <UserCheck className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.completed.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-muted-foreground">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-muted p-3">
                <UserX className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.lost.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Lost to Follow-up</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-destructive/20 p-3">
                <Users className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.converted.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Converted to Case</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'list' && (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="py-4">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, case ID, or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="under_follow_up">Under Follow-up</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="lost_to_follow_up">Lost to Follow-up</SelectItem>
                      <SelectItem value="converted_to_case">Converted to Case</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedRisk} onValueChange={setSelectedRisk}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Risk Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk Levels</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Contact Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="household">Household</SelectItem>
                      <SelectItem value="workplace">Workplace</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="community">Community</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant={showFilters ? 'default' : 'outline'}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    More Filters
                  </Button>

                  {hasActiveFilters && (
                    <Button variant="ghost" onClick={clearFilters}>
                      <X className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                  )}

                  <Button variant="ghost" onClick={fetchContacts} disabled={loading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>

                {/* Extended Filters */}
                {showFilters && (
                  <div className="flex flex-wrap gap-4 border-t border-border pt-4">
                    <Select value={selectedAdminUnit} onValueChange={setSelectedAdminUnit}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        {adminUnits.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">From:</span>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-[150px]"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">To:</span>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-[150px]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contacts Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex h-[400px] items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading contacts...</p>
                  </div>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="flex h-[400px] items-center justify-center">
                  <div className="text-center">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium text-foreground">No contacts found</h3>
                    <p className="mt-2 text-muted-foreground">
                      {hasActiveFilters
                        ? 'Try adjusting your filters or clear them to see all contacts.'
                        : 'No contacts have been recorded yet.'}
                    </p>
                    {hasActiveFilters && (
                      <Button variant="outline" className="mt-4" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-border bg-muted/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Person
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Linked Case
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Contact Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Risk Level
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Days Remaining
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Location
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredContacts.map((contact) => {
                          const daysRemaining = getDaysRemaining(contact.follow_up_until);

                          return (
                            <tr key={contact.id} className="transition-colors hover:bg-muted/50">
                              <td className="whitespace-nowrap px-6 py-4">
                                {contact.person ? (
                                  <div>
                                    <p className="font-medium text-foreground">
                                      {contact.person.first_name} {contact.person.last_name}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <span>{contact.person.age_years} yrs, {contact.person.sex}</span>
                                      {contact.person.phone && (
                                        <span className="flex items-center gap-1">
                                          <Phone className="h-3 w-3" />
                                          {contact.person.phone}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                {contact.case ? (
                                  <div>
                                    <Link href={`/cases/${contact.case.id}`} className="font-mono text-sm text-primary hover:underline">
                                      {contact.case.external_id}
                                    </Link>
                                    {contact.case.disease && (
                                      <p className="text-xs text-muted-foreground">{contact.case.disease.name}</p>
                                    )}
                                    {contact.relationship_to_case && (
                                      <p className="text-xs text-muted-foreground capitalize">{contact.relationship_to_case}</p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <Badge variant="outline" className="capitalize">
                                  {contact.contact_type}
                                </Badge>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                {getRiskBadge(contact.risk_level)}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                {getStatusBadge(contact.follow_up_status)}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                {contact.follow_up_status === 'under_follow_up' ? (
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                                      <div
                                        className={`h-full transition-all ${
                                          daysRemaining <= 3 ? 'bg-destructive' : daysRemaining <= 7 ? 'bg-warning' : 'bg-primary'
                                        }`}
                                        style={{ width: `${Math.max(5, 100 - (daysRemaining / 21) * 100)}%` }}
                                      />
                                    </div>
                                    <span className={`text-xs font-medium ${
                                      daysRemaining <= 3 ? 'text-destructive' : daysRemaining <= 7 ? 'text-warning' : 'text-muted-foreground'
                                    }`}>
                                      {daysRemaining} days
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4" />
                                  {contact.admin_unit?.name || '-'}
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <Link href={`/contacts/${contact.id}`}>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="mr-1 h-4 w-4" />
                                    View
                                  </Button>
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between border-t border-border px-6 py-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total.toLocaleString()} results
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page === 1}
                        onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'network' && <ContactNetworkDiagram />}

      {activeTab === 'timeline' && <ContactTracingTimeline />}

      {activeTab === 'map' && <FollowUpMap />}
    </div>
  );
}
