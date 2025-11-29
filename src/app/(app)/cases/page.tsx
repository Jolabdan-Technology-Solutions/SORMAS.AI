'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cases</h1>
          <p className="text-gray-500">
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
              <FileText className="mr-2 h-4 w-4" />
              Import Cases
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockCases.length}</p>
                <p className="text-sm text-gray-500">Total Cases</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-red-100 p-3">
                <Activity className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockCases.filter((c) => c.classification === 'confirmed').length}
                </p>
                <p className="text-sm text-gray-500">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-yellow-100 p-3">
                <Activity className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockCases.filter((c) => c.outcome === 'ongoing').length}
                </p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockCases.filter((c) => c.outcome === 'recovered').length}
                </p>
                <p className="text-sm text-gray-500">Recovered</p>
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
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Case ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Person
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Disease
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Classification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Outcome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Report Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredCases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="font-mono text-sm text-blue-600">
                        {caseItem.external_id}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div>
                        <p className="font-medium">
                          {caseItem.person.first_name} {caseItem.person.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {caseItem.person.age_years} yrs, {caseItem.person.sex}
                        </p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-gray-400" />
                        {caseItem.disease}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {getClassificationBadge(caseItem.classification)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {getOutcomeBadge(caseItem.outcome)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        {caseItem.admin_unit}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
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
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
            <p className="text-sm text-gray-500">
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
