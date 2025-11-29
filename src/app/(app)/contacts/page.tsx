'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
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
} from 'lucide-react';
import { ContactNetworkDiagram } from '@/components/contacts/ContactNetworkDiagram';
import { ContactTracingTimeline } from '@/components/contacts/ContactTracingTimeline';

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

// Mock contacts data
const mockContacts = [
  {
    id: '1',
    external_id: 'CNT-2024-00456',
    case_id: 'NGA-2024-00123',
    person: {
      first_name: 'Sarah',
      last_name: 'Williams',
      age_years: 28,
      sex: 'female',
      phone: '+234 801 234 5678',
    },
    contact_date: '2024-01-14',
    contact_type: 'household',
    relationship_to_case: 'spouse',
    risk_level: 'high',
    follow_up_status: 'under_follow_up',
    admin_unit: 'Lagos - Ikeja',
    last_visit_date: '2024-01-20',
    visits_completed: 5,
    visits_remaining: 16,
  },
  {
    id: '2',
    external_id: 'CNT-2024-00457',
    case_id: 'NGA-2024-00123',
    person: {
      first_name: 'Michael',
      last_name: 'Brown',
      age_years: 45,
      sex: 'male',
      phone: '+234 802 345 6789',
    },
    contact_date: '2024-01-13',
    contact_type: 'workplace',
    relationship_to_case: 'colleague',
    risk_level: 'medium',
    follow_up_status: 'under_follow_up',
    admin_unit: 'Lagos - Ikeja',
    last_visit_date: '2024-01-19',
    visits_completed: 6,
    visits_remaining: 15,
  },
  {
    id: '3',
    external_id: 'CNT-2024-00458',
    case_id: 'NGA-2024-00124',
    person: {
      first_name: 'Elizabeth',
      last_name: 'Okonkwo',
      age_years: 32,
      sex: 'female',
      phone: '+234 803 456 7890',
    },
    contact_date: '2024-01-12',
    contact_type: 'healthcare',
    relationship_to_case: 'nurse',
    risk_level: 'high',
    follow_up_status: 'completed',
    admin_unit: 'Lagos - Eti-Osa',
    last_visit_date: '2024-01-18',
    visits_completed: 21,
    visits_remaining: 0,
  },
  {
    id: '4',
    external_id: 'CNT-2024-00459',
    case_id: 'NGA-2024-00125',
    person: {
      first_name: 'David',
      last_name: 'Adebayo',
      age_years: 55,
      sex: 'male',
      phone: '+234 804 567 8901',
    },
    contact_date: '2024-01-11',
    contact_type: 'community',
    relationship_to_case: 'neighbor',
    risk_level: 'low',
    follow_up_status: 'lost_to_follow_up',
    admin_unit: 'Kano - Fagge',
    last_visit_date: '2024-01-15',
    visits_completed: 3,
    visits_remaining: 18,
  },
  {
    id: '5',
    external_id: 'CNT-2024-00460',
    case_id: 'NGA-2024-00126',
    person: {
      first_name: 'Grace',
      last_name: 'Eze',
      age_years: 24,
      sex: 'female',
      phone: '+234 805 678 9012',
    },
    contact_date: '2024-01-10',
    contact_type: 'household',
    relationship_to_case: 'sibling',
    risk_level: 'high',
    follow_up_status: 'converted_to_case',
    admin_unit: 'Ogun - Abeokuta',
    last_visit_date: '2024-01-17',
    visits_completed: 7,
    visits_remaining: 0,
  },
];

const followUpStatuses = ['All Statuses', 'under_follow_up', 'completed', 'lost_to_follow_up', 'converted_to_case'];
const riskLevels = ['All Risk Levels', 'high', 'medium', 'low'];
const contactTypes = ['All Types', 'household', 'workplace', 'healthcare', 'community', 'other'];

type ViewTab = 'list' | 'network' | 'timeline' | 'map';

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedRisk, setSelectedRisk] = useState('All Risk Levels');
  const [selectedType, setSelectedType] = useState('All Types');
  const [activeTab, setActiveTab] = useState<ViewTab>('list');

  const filteredContacts = mockContacts.filter((c) => {
    if (selectedStatus !== 'All Statuses' && c.follow_up_status !== selectedStatus) return false;
    if (selectedRisk !== 'All Risk Levels' && c.risk_level !== selectedRisk) return false;
    if (selectedType !== 'All Types' && c.contact_type !== selectedType) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        c.external_id.toLowerCase().includes(search) ||
        c.person.first_name.toLowerCase().includes(search) ||
        c.person.last_name.toLowerCase().includes(search) ||
        c.admin_unit.toLowerCase().includes(search)
      );
    }
    return true;
  });

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

  const statusCounts = {
    under_follow_up: mockContacts.filter((c) => c.follow_up_status === 'under_follow_up').length,
    completed: mockContacts.filter((c) => c.follow_up_status === 'completed').length,
    lost: mockContacts.filter((c) => c.follow_up_status === 'lost_to_follow_up').length,
    converted: mockContacts.filter((c) => c.follow_up_status === 'converted_to_case').length,
  };

  const tabs = [
    { id: 'list' as const, label: 'Contact List', icon: List },
    { id: 'network' as const, label: 'Network Diagram', icon: Network },
    { id: 'timeline' as const, label: 'Tracing Timeline', icon: GitBranch },
    { id: 'map' as const, label: 'Follow-up Map', icon: Map },
  ];

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
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
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
                <p className="text-2xl font-bold text-foreground">{statusCounts.under_follow_up}</p>
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
                <p className="text-2xl font-bold text-foreground">{statusCounts.completed}</p>
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
                <p className="text-2xl font-bold text-foreground">{statusCounts.lost}</p>
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
                <p className="text-2xl font-bold text-foreground">{statusCounts.converted}</p>
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
              <div className="flex flex-wrap gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by ID, name, or location..."
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
                  {followUpStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s === 'All Statuses' ? s : s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                      {r === 'All Risk Levels' ? r : r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </Select>
                <Select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-40"
                >
                  {contactTypes.map((t) => (
                    <option key={t} value={t}>
                      {t === 'All Types' ? t : t.charAt(0).toUpperCase() + t.slice(1)}
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

          {/* Contacts Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Contact ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Person
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Linked Case
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Risk Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Follow-up Progress
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
                    {filteredContacts.map((contact) => (
                      <tr key={contact.id} className="transition-colors hover:bg-muted/50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="font-mono text-sm text-primary">
                            {contact.external_id}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div>
                            <p className="font-medium text-foreground">
                              {contact.person.first_name} {contact.person.last_name}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{contact.person.age_years} yrs, {contact.person.sex}</span>
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {contact.person.phone}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Link href={`/cases/${contact.case_id}`} className="font-mono text-sm text-primary hover:underline">
                            {contact.case_id}
                          </Link>
                          <p className="text-xs text-muted-foreground capitalize">{contact.relationship_to_case}</p>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {getRiskBadge(contact.risk_level)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {getStatusBadge(contact.follow_up_status)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{
                                  width: `${(contact.visits_completed / (contact.visits_completed + contact.visits_remaining)) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {contact.visits_completed}/{contact.visits_completed + contact.visits_remaining}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {contact.admin_unit}
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
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-border px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  Showing 1 to {filteredContacts.length} of {filteredContacts.length} results
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
