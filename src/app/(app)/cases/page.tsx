'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  FileText,
  Calendar,
  MapPin,
  Activity,
  Plus,
  TrendingUp,
  HeartPulse,
  UserCheck,
} from 'lucide-react';

// Mock cases data
const mockCases = [
  {
    id: '1',
    external_id: 'NGA-2024-00123',
    disease: 'Cholera',
    classification: 'confirmed',
    outcome: 'recovered',
    report_date: '2024-01-15',
    onset_date: '2024-01-10',
    admin_unit: 'Lagos - Ikeja',
    person: {
      first_name: 'John',
      last_name: 'Doe',
      age_years: 35,
      sex: 'male',
    },
    hospitalized: true,
    lab_confirmed: true,
  },
  {
    id: '2',
    external_id: 'NGA-2024-00124',
    disease: 'Cholera',
    classification: 'probable',
    outcome: 'ongoing',
    report_date: '2024-01-15',
    onset_date: '2024-01-12',
    admin_unit: 'Lagos - Eti-Osa',
    person: {
      first_name: 'Jane',
      last_name: 'Smith',
      age_years: 28,
      sex: 'female',
    },
    hospitalized: false,
    lab_confirmed: false,
  },
  {
    id: '3',
    external_id: 'NGA-2024-00125',
    disease: 'Malaria',
    classification: 'confirmed',
    outcome: 'recovered',
    report_date: '2024-01-14',
    onset_date: '2024-01-08',
    admin_unit: 'Kano - Fagge',
    person: {
      first_name: 'Ahmed',
      last_name: 'Ibrahim',
      age_years: 42,
      sex: 'male',
    },
    hospitalized: true,
    lab_confirmed: true,
  },
  {
    id: '4',
    external_id: 'NGA-2024-00126',
    disease: 'COVID-19',
    classification: 'suspect',
    outcome: null,
    report_date: '2024-01-15',
    onset_date: '2024-01-13',
    admin_unit: 'Ogun - Abeokuta',
    person: {
      first_name: 'Mary',
      last_name: 'Johnson',
      age_years: 55,
      sex: 'female',
    },
    hospitalized: false,
    lab_confirmed: false,
  },
  {
    id: '5',
    external_id: 'NGA-2024-00127',
    disease: 'Lassa Fever',
    classification: 'confirmed',
    outcome: 'deceased',
    report_date: '2024-01-13',
    onset_date: '2024-01-05',
    admin_unit: 'Edo - Benin City',
    person: {
      first_name: 'Peter',
      last_name: 'Okonkwo',
      age_years: 67,
      sex: 'male',
    },
    hospitalized: true,
    lab_confirmed: true,
  },
];

const diseases = ['All Diseases', 'Cholera', 'Malaria', 'COVID-19', 'Lassa Fever', 'Measles'];
const classifications = ['All Classifications', 'suspect', 'probable', 'confirmed', 'not_a_case'];
const outcomes = ['All Outcomes', 'recovered', 'deceased', 'ongoing', 'unknown'];

export default function CasesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDisease, setSelectedDisease] = useState('All Diseases');
  const [selectedClassification, setSelectedClassification] = useState('All Classifications');
  const [selectedOutcome, setSelectedOutcome] = useState('All Outcomes');

  const filteredCases = mockCases.filter((c) => {
    if (selectedDisease !== 'All Diseases' && c.disease !== selectedDisease) return false;
    if (selectedClassification !== 'All Classifications' && c.classification !== selectedClassification) return false;
    if (selectedOutcome !== 'All Outcomes' && c.outcome !== selectedOutcome) return false;
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

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'confirmed':
        return <Badge variant="destructive">Confirmed</Badge>;
      case 'probable':
        return <Badge variant="warning">Probable</Badge>;
      case 'suspect':
        return <Badge variant="secondary">Suspect</Badge>;
      case 'not_a_case':
        return <Badge variant="outline">Not a Case</Badge>;
      default:
        return <Badge>{classification}</Badge>;
    }
  };

  const getOutcomeBadge = (outcome: string | null) => {
    switch (outcome) {
      case 'recovered':
        return <Badge variant="success">Recovered</Badge>;
      case 'deceased':
        return <Badge variant="destructive">Deceased</Badge>;
      case 'ongoing':
        return <Badge variant="warning">Ongoing</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const stats = {
    total: mockCases.length,
    confirmed: mockCases.filter((c) => c.classification === 'confirmed').length,
    active: mockCases.filter((c) => c.outcome === 'ongoing').length,
    recovered: mockCases.filter((c) => c.outcome === 'recovered').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cases</h1>
          <p className="text-muted-foreground">
            View and manage disease surveillance cases
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link href="/etl/import">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Import Cases
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/20 p-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Cases</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-destructive/20 p-3">
                <Activity className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.confirmed}</p>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-warning/20 p-3">
                <HeartPulse className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active</p>
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
                <p className="text-2xl font-bold text-foreground">{stats.recovered}</p>
                <p className="text-sm text-muted-foreground">Recovered</p>
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
                  placeholder="Search by ID, name, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={selectedDisease}
              onChange={(e) => setSelectedDisease(e.target.value)}
              className="w-48"
            >
              {diseases.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
            <Select
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value)}
              className="w-48"
            >
              {classifications.map((c) => (
                <option key={c} value={c}>
                  {c === 'All Classifications' ? c : c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </Select>
            <Select
              value={selectedOutcome}
              onChange={(e) => setSelectedOutcome(e.target.value)}
              className="w-40"
            >
              {outcomes.map((o) => (
                <option key={o} value={o}>
                  {o === 'All Outcomes' ? o : o.charAt(0).toUpperCase() + o.slice(1)}
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

      {/* Cases Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Case ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Person
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Disease
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Classification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Outcome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Report Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCases.map((caseItem) => (
                  <tr key={caseItem.id} className="transition-colors hover:bg-muted/50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="font-mono text-sm text-primary">
                        {caseItem.external_id}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {caseItem.person.first_name} {caseItem.person.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {caseItem.person.age_years} yrs, {caseItem.person.sex}
                        </p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{caseItem.disease}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {getClassificationBadge(caseItem.classification)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {getOutcomeBadge(caseItem.outcome)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {caseItem.admin_unit}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {caseItem.report_date}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <p className="text-sm text-muted-foreground">
              Showing 1 to {filteredCases.length} of {filteredCases.length} results
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
    </div>
  );
}
