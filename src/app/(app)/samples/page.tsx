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
  Microscope,
  Calendar,
  MapPin,
  FlaskConical,
  TestTube,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Beaker,
} from 'lucide-react';

// Mock samples data
const mockSamples = [
  {
    id: '1',
    external_id: 'SMP-2024-00789',
    case_id: 'NGA-2024-00123',
    sample_type: 'blood',
    collection_date: '2024-01-15',
    received_date: '2024-01-16',
    lab_name: 'NCDC Reference Laboratory',
    test_type: 'PCR',
    disease: 'Cholera',
    status: 'completed',
    result: 'positive',
    result_date: '2024-01-17',
    turnaround_time: 2,
    admin_unit: 'Lagos - Ikeja',
    collector: 'Dr. Aisha Mohammed',
  },
  {
    id: '2',
    external_id: 'SMP-2024-00790',
    case_id: 'NGA-2024-00124',
    sample_type: 'stool',
    collection_date: '2024-01-15',
    received_date: '2024-01-15',
    lab_name: 'Lagos State Laboratory',
    test_type: 'Culture',
    disease: 'Cholera',
    status: 'in_progress',
    result: null,
    result_date: null,
    turnaround_time: null,
    admin_unit: 'Lagos - Eti-Osa',
    collector: 'Nurse Blessing Okafor',
  },
  {
    id: '3',
    external_id: 'SMP-2024-00791',
    case_id: 'NGA-2024-00125',
    sample_type: 'blood',
    collection_date: '2024-01-14',
    received_date: '2024-01-14',
    lab_name: 'NCDC Reference Laboratory',
    test_type: 'ELISA',
    disease: 'Lassa Fever',
    status: 'completed',
    result: 'positive',
    result_date: '2024-01-16',
    turnaround_time: 2,
    admin_unit: 'Edo - Benin City',
    collector: 'Dr. Emmanuel Obi',
  },
  {
    id: '4',
    external_id: 'SMP-2024-00792',
    case_id: 'NGA-2024-00126',
    sample_type: 'nasopharyngeal_swab',
    collection_date: '2024-01-15',
    received_date: null,
    lab_name: 'Kano State Laboratory',
    test_type: 'RT-PCR',
    disease: 'COVID-19',
    status: 'pending',
    result: null,
    result_date: null,
    turnaround_time: null,
    admin_unit: 'Kano - Fagge',
    collector: 'Dr. Aminu Yusuf',
  },
  {
    id: '5',
    external_id: 'SMP-2024-00793',
    case_id: 'NGA-2024-00127',
    sample_type: 'blood',
    collection_date: '2024-01-13',
    received_date: '2024-01-13',
    lab_name: 'NCDC Reference Laboratory',
    test_type: 'PCR',
    disease: 'Malaria',
    status: 'completed',
    result: 'negative',
    result_date: '2024-01-14',
    turnaround_time: 1,
    admin_unit: 'Ogun - Abeokuta',
    collector: 'Nurse Grace Adeyemi',
  },
  {
    id: '6',
    external_id: 'SMP-2024-00794',
    case_id: 'NGA-2024-00128',
    sample_type: 'serum',
    collection_date: '2024-01-14',
    received_date: '2024-01-15',
    lab_name: 'Lagos State Laboratory',
    test_type: 'Serology',
    disease: 'Yellow Fever',
    status: 'rejected',
    result: null,
    result_date: null,
    turnaround_time: null,
    admin_unit: 'Cross River - Ogoja',
    collector: 'Dr. Mary Effiong',
    rejection_reason: 'Sample hemolyzed',
  },
];

const statuses = ['All Statuses', 'pending', 'in_progress', 'completed', 'rejected'];
const sampleTypes = ['All Types', 'blood', 'stool', 'serum', 'nasopharyngeal_swab', 'urine'];
const results = ['All Results', 'positive', 'negative', 'inconclusive'];

export default function SamplesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedResult, setSelectedResult] = useState('All Results');

  const filteredSamples = mockSamples.filter((s) => {
    if (selectedStatus !== 'All Statuses' && s.status !== selectedStatus) return false;
    if (selectedType !== 'All Types' && s.sample_type !== selectedType) return false;
    if (selectedResult !== 'All Results' && s.result !== selectedResult) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        s.external_id.toLowerCase().includes(search) ||
        s.case_id.toLowerCase().includes(search) ||
        s.disease.toLowerCase().includes(search) ||
        s.lab_name.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="warning">In Progress</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getResultBadge = (result: string | null) => {
    if (!result) return null;
    switch (result) {
      case 'positive':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Positive
          </Badge>
        );
      case 'negative':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Negative
          </Badge>
        );
      case 'inconclusive':
        return <Badge variant="warning">Inconclusive</Badge>;
      default:
        return <Badge variant="secondary">{result}</Badge>;
    }
  };

  const stats = {
    pending: mockSamples.filter((s) => s.status === 'pending').length,
    inProgress: mockSamples.filter((s) => s.status === 'in_progress').length,
    completed: mockSamples.filter((s) => s.status === 'completed').length,
    positive: mockSamples.filter((s) => s.result === 'positive').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Laboratory Samples</h1>
          <p className="text-muted-foreground">
            Track sample collection, processing, and test results
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Register Sample
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-muted-foreground">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-muted p-3">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending Collection</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-warning/20 p-3">
                <FlaskConical className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
                <p className="text-sm text-muted-foreground">In Lab Processing</p>
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
                <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed Tests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-destructive/20 p-3">
                <Microscope className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.positive}</p>
                <p className="text-sm text-muted-foreground">Positive Results</p>
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
                  placeholder="Search by sample ID, case ID, disease, or lab..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-40"
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
              {sampleTypes.map((t) => (
                <option key={t} value={t}>
                  {t === 'All Types' ? t : t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </Select>
            <Select
              value={selectedResult}
              onChange={(e) => setSelectedResult(e.target.value)}
              className="w-36"
            >
              {results.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
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

      {/* Samples Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Sample ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Case
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Sample Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Test / Disease
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Result
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Laboratory
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSamples.map((sample) => (
                  <tr key={sample.id} className="transition-colors hover:bg-muted/50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="font-mono text-sm text-primary">
                        {sample.external_id}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        <Calendar className="mr-1 inline h-3 w-3" />
                        {sample.collection_date}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <Link href={`/cases/${sample.case_id}`} className="font-mono text-sm text-primary hover:underline">
                        {sample.case_id}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TestTube className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize text-foreground">{sample.sample_type.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">{sample.test_type}</p>
                        <p className="text-sm text-muted-foreground">{sample.disease}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {getStatusBadge(sample.status)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {sample.result ? (
                        <div>
                          {getResultBadge(sample.result)}
                          {sample.result_date && (
                            <p className="mt-1 text-xs text-muted-foreground">{sample.result_date}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Beaker className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{sample.lab_name}</span>
                      </div>
                      {sample.turnaround_time && (
                        <p className="text-xs text-muted-foreground">TAT: {sample.turnaround_time} days</p>
                      )}
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
              Showing 1 to {filteredSamples.length} of {filteredSamples.length} results
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
