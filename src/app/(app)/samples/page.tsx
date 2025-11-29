'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Microscope,
  Calendar,
  FlaskConical,
  TestTube,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Beaker,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Default tenant ID - should come from auth context in production
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

interface Sample {
  id: string;
  external_id: string;
  sample_type: string;
  sample_material: string | null;
  collection_date: string | null;
  received_date: string | null;
  lab_name: string | null;
  test_type: string | null;
  test_result: string;
  result_date: string | null;
  case: { external_id: string } | null;
  disease: { name: string } | null;
}

const statuses = ['All Statuses', 'pending', 'in_progress', 'positive', 'negative', 'inconclusive', 'rejected'];
const sampleTypes = ['All Types', 'blood', 'stool', 'serum', 'nasopharyngeal_swab', 'urine', 'sputum', 'cerebrospinal_fluid'];
const results = ['All Results', 'positive', 'negative', 'inconclusive', 'pending'];

export default function SamplesPage() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedResult, setSelectedResult] = useState('All Results');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  const supabase = createClient();

  const fetchSamples = async () => {
    try {
      let query = supabase
        .from('samples')
        .select(`
          id, external_id, sample_type, sample_material, collection_date,
          received_date, lab_name, test_type, test_result, result_date,
          case:cases(external_id),
          disease:diseases(name)
        `, { count: 'exact' })
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .order('collection_date', { ascending: false });

      // Apply filters
      if (selectedStatus !== 'All Statuses') {
        query = query.eq('test_result', selectedStatus);
      }
      if (selectedType !== 'All Types') {
        query = query.eq('sample_type', selectedType);
      }
      if (selectedResult !== 'All Results') {
        query = query.eq('test_result', selectedResult);
      }
      if (searchTerm) {
        query = query.or(`external_id.ilike.%${searchTerm}%,lab_name.ilike.%${searchTerm}%`);
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
        case: Array.isArray(row.case) ? row.case[0] || null : row.case,
        disease: Array.isArray(row.disease) ? row.disease[0] || null : row.disease,
      })) as Sample[];

      setSamples(transformedData);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching samples:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSamples();
  }, [selectedStatus, selectedType, selectedResult, page]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchSamples();
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSamples();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="warning">In Progress</Badge>;
      case 'positive':
        return <Badge variant="destructive">Positive</Badge>;
      case 'negative':
        return <Badge variant="success">Negative</Badge>;
      case 'inconclusive':
        return <Badge variant="warning">Inconclusive</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
    }
  };

  const getResultBadge = (result: string | null) => {
    if (!result || result === 'pending') return null;
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
    pending: samples.filter((s) => s.test_result === 'pending').length,
    inProgress: samples.filter((s) => s.test_result === 'in_progress').length,
    completed: samples.filter((s) => ['positive', 'negative', 'inconclusive'].includes(s.test_result)).length,
    positive: samples.filter((s) => s.test_result === 'positive').length,
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = totalCount > 0 ? (page - 1) * pageSize + 1 : 0;
  const endItem = Math.min(page * pageSize, totalCount);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading samples...</p>
        </div>
      </div>
    );
  }

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
                  placeholder="Search by sample ID or lab name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={(value) => { setSelectedStatus(value); setPage(1); }}>
              <SelectTrigger className="w-40">
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
                {sampleTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t === 'All Types' ? t : t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedResult} onValueChange={(value) => { setSelectedResult(value); setPage(1); }}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Result" />
              </SelectTrigger>
              <SelectContent>
                {results.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
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

      {/* Samples Table */}
      <Card>
        <CardContent className="p-0">
          {samples.length === 0 ? (
            <div className="flex h-[400px] flex-col items-center justify-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground">No Samples Found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm || selectedStatus !== 'All Statuses' || selectedType !== 'All Types' || selectedResult !== 'All Results'
                  ? 'Try adjusting your filters or search terms'
                  : 'No samples have been recorded yet'}
              </p>
            </div>
          ) : (
            <>
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
                    {samples.map((sample) => (
                      <tr key={sample.id} className="transition-colors hover:bg-muted/50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="font-mono text-sm text-primary">
                            {sample.external_id}
                          </span>
                          {sample.collection_date && (
                            <p className="text-xs text-muted-foreground">
                              <Calendar className="mr-1 inline h-3 w-3" />
                              {new Date(sample.collection_date).toLocaleDateString()}
                            </p>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {sample.case ? (
                            <Link href={`/cases/${sample.case.external_id}`} className="font-mono text-sm text-primary hover:underline">
                              {sample.case.external_id}
                            </Link>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-2">
                            <TestTube className="h-4 w-4 text-muted-foreground" />
                            <span className="capitalize text-foreground">{(sample.sample_type || 'unknown').replace(/_/g, ' ')}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div>
                            <p className="font-medium text-foreground">{sample.test_type || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{sample.disease?.name || 'Unknown'}</p>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {getStatusBadge(sample.test_result)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {sample.test_result && !['pending', 'in_progress'].includes(sample.test_result) ? (
                            <div>
                              {getResultBadge(sample.test_result)}
                              {sample.result_date && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {new Date(sample.result_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Beaker className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground truncate max-w-[150px]">{sample.lab_name || 'Unknown Lab'}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Link href={`/samples/${sample.id}`}>
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
                  Showing {startItem} to {endItem} of {totalCount} results
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
                    Page {page} of {totalPages || 1}
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
