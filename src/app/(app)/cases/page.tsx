'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
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
  FileText,
  Calendar,
  MapPin,
  Activity,
  Plus,
  HeartPulse,
  UserCheck,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Default tenant ID - should come from auth context in production
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

interface Person {
  id: string;
  first_name: string;
  last_name: string;
  age_years: number;
  sex: string;
}

interface Disease {
  id: string;
  name: string;
}

interface AdminUnit {
  id: string;
  name: string;
  code: string;
}

interface Case {
  id: string;
  external_id: string;
  classification: string;
  outcome: string;
  hospitalized: boolean;
  icu_admission: boolean;
  report_date: string;
  onset_date: string | null;
  outcome_date: string | null;
  person: Person | null;
  disease: Disease | null;
  admin_unit: AdminUnit | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function CasesPage() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    active: 0,
    recovered: 0,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDisease, setSelectedDisease] = useState('all');
  const [selectedClassification, setSelectedClassification] = useState('all');
  const [selectedOutcome, setSelectedOutcome] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Options
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [adminUnits, setAdminUnits] = useState<AdminUnit[]>([]);
  const [selectedAdminUnit, setSelectedAdminUnit] = useState('all');

  const supabase = createClient();

  // Fetch diseases and admin units for dropdowns
  useEffect(() => {
    const fetchOptions = async () => {
      const [diseasesResult, adminUnitsResult] = await Promise.all([
        supabase.from('diseases').select('id, name').order('name'),
        supabase
          .from('admin_units')
          .select('id, name, code')
          .eq('tenant_id', DEFAULT_TENANT_ID)
          .order('name'),
      ]);

      if (diseasesResult.data) setDiseases(diseasesResult.data);
      if (adminUnitsResult.data) setAdminUnits(adminUnitsResult.data);
    };

    fetchOptions();
  }, []);

  // Fetch cases
  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      let query = supabase
        .from('cases')
        .select(
          `
          id, external_id, classification, outcome, hospitalized, icu_admission,
          report_date, onset_date, outcome_date,
          person:persons(id, first_name, last_name, age_years, sex),
          disease:diseases(id, name),
          admin_unit:admin_units(id, name, code)
        `,
          { count: 'exact' }
        )
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .order('report_date', { ascending: false })
        .range(offset, offset + pagination.limit - 1);

      // Apply filters
      if (selectedDisease !== 'all') {
        query = query.eq('disease_id', selectedDisease);
      }
      if (selectedClassification !== 'all') {
        query = query.eq('classification', selectedClassification);
      }
      if (selectedOutcome !== 'all') {
        query = query.eq('outcome', selectedOutcome);
      }
      if (selectedAdminUnit !== 'all') {
        query = query.eq('admin_unit_id', selectedAdminUnit);
      }
      if (startDate) {
        query = query.gte('report_date', startDate);
      }
      if (endDate) {
        query = query.lte('report_date', endDate);
      }
      if (searchTerm) {
        query = query.ilike('external_id', `%${searchTerm}%`);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      // Transform data to match Case interface (Supabase returns objects for singular relations)
      const transformedData = (data || []).map((row: any) => ({
        ...row,
        person: Array.isArray(row.person) ? row.person[0] || null : row.person,
        disease: Array.isArray(row.disease) ? row.disease[0] || null : row.disease,
        admin_unit: Array.isArray(row.admin_unit) ? row.admin_unit[0] || null : row.admin_unit,
      })) as Case[];

      setCases(transformedData);
      setPagination((prev) => ({
        ...prev,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / prev.limit),
      }));

      // Fetch stats
      const [totalResult, confirmedResult, activeResult, recoveredResult] = await Promise.all([
        supabase
          .from('cases')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', DEFAULT_TENANT_ID),
        supabase
          .from('cases')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', DEFAULT_TENANT_ID)
          .eq('classification', 'confirmed'),
        supabase
          .from('cases')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', DEFAULT_TENANT_ID)
          .in('outcome', ['unknown', 'ongoing']),
        supabase
          .from('cases')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', DEFAULT_TENANT_ID)
          .eq('outcome', 'recovered'),
      ]);

      setStats({
        total: totalResult.count || 0,
        confirmed: confirmedResult.count || 0,
        active: activeResult.count || 0,
        recovered: recoveredResult.count || 0,
      });
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    selectedDisease,
    selectedClassification,
    selectedOutcome,
    selectedAdminUnit,
    startDate,
    endDate,
    searchTerm,
  ]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [selectedDisease, selectedClassification, selectedOutcome, selectedAdminUnit, startDate, endDate, searchTerm]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch(`/api/tenants/${DEFAULT_TENANT_ID}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_type: 'cases',
          format: 'csv',
          filters: {
            startDate,
            endDate,
            diseaseId: selectedDisease !== 'all' ? selectedDisease : undefined,
            adminUnitId: selectedAdminUnit !== 'all' ? selectedAdminUnit : undefined,
          },
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cases_export_${new Date().toISOString().split('T')[0]}.csv`;
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
    setSelectedDisease('all');
    setSelectedClassification('all');
    setSelectedOutcome('all');
    setSelectedAdminUnit('all');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters =
    searchTerm ||
    selectedDisease !== 'all' ||
    selectedClassification !== 'all' ||
    selectedOutcome !== 'all' ||
    selectedAdminUnit !== 'all' ||
    startDate ||
    endDate;

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'confirmed':
        return <Badge variant="destructive">Confirmed</Badge>;
      case 'probable':
        return <Badge variant="warning">Probable</Badge>;
      case 'suspected':
        return <Badge variant="secondary">Suspected</Badge>;
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
          <h1 className="text-2xl font-bold text-foreground">Cases</h1>
          <p className="text-muted-foreground">
            View and manage disease surveillance cases
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
                <p className="text-2xl font-bold text-foreground">{stats.total.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-foreground">{stats.confirmed.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-foreground">{stats.active.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-foreground">{stats.recovered.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Recovered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by Case ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={selectedDisease} onValueChange={setSelectedDisease}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Disease" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Diseases</SelectItem>
                  {diseases.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedClassification} onValueChange={setSelectedClassification}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Classification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classifications</SelectItem>
                  <SelectItem value="suspected">Suspected</SelectItem>
                  <SelectItem value="probable">Probable</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="not_a_case">Not a Case</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedOutcome} onValueChange={setSelectedOutcome}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Outcomes</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="recovered">Recovered</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
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

              <Button variant="ghost" onClick={fetchCases} disabled={loading}>
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

      {/* Cases Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-[400px] items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading cases...</p>
              </div>
            </div>
          ) : cases.length === 0 ? (
            <div className="flex h-[400px] items-center justify-center">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium text-foreground">No cases found</h3>
                <p className="mt-2 text-muted-foreground">
                  {hasActiveFilters
                    ? 'Try adjusting your filters or clear them to see all cases.'
                    : 'No cases have been recorded yet.'}
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
                    {cases.map((caseItem) => (
                      <tr key={caseItem.id} className="transition-colors hover:bg-muted/50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="font-mono text-sm text-primary">
                            {caseItem.external_id}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {caseItem.person ? (
                            <div>
                              <p className="font-medium text-foreground">
                                {caseItem.person.first_name} {caseItem.person.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {caseItem.person.age_years} yrs, {caseItem.person.sex}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">
                              {caseItem.disease?.name || '-'}
                            </span>
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
                            {caseItem.admin_unit?.name || '-'}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {caseItem.report_date}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Link href={`/cases/${caseItem.id}`}>
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
    </div>
  );
}
