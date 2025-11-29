'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  Database,
  FileText,
  CheckCircle,
  AlertTriangle,
  Save,
} from 'lucide-react';

const fieldMappings = [
  { id: 1, source_field: 'patient_id', target_field: 'external_id', source_type: 'DHIS2', status: 'active' },
  { id: 2, source_field: 'first_name', target_field: 'person.first_name', source_type: 'DHIS2', status: 'active' },
  { id: 3, source_field: 'last_name', target_field: 'person.last_name', source_type: 'DHIS2', status: 'active' },
  { id: 4, source_field: 'age', target_field: 'person.age_years', source_type: 'DHIS2', status: 'active' },
  { id: 5, source_field: 'gender', target_field: 'person.sex', source_type: 'DHIS2', status: 'active', transformation: 'GENDER_MAP' },
  { id: 6, source_field: 'disease_name', target_field: 'disease', source_type: 'DHIS2', status: 'active', transformation: 'DISEASE_LOOKUP' },
  { id: 7, source_field: 'case_status', target_field: 'classification', source_type: 'DHIS2', status: 'active', transformation: 'CLASSIFICATION_MAP' },
  { id: 8, source_field: 'outcome', target_field: 'outcome', source_type: 'DHIS2', status: 'active', transformation: 'OUTCOME_MAP' },
  { id: 9, source_field: 'report_date', target_field: 'report_date', source_type: 'DHIS2', status: 'active', transformation: 'DATE_FORMAT' },
  { id: 10, source_field: 'onset_date', target_field: 'onset_date', source_type: 'DHIS2', status: 'active', transformation: 'DATE_FORMAT' },
  { id: 11, source_field: 'lga_code', target_field: 'admin_unit_code', source_type: 'DHIS2', status: 'active' },
  { id: 12, source_field: 'lab_result', target_field: 'lab_confirmed', source_type: 'CSV Import', status: 'active', transformation: 'BOOLEAN_MAP' },
];

const transformations = [
  { id: 'GENDER_MAP', name: 'Gender Mapping', description: 'Maps M/F to male/female' },
  { id: 'DISEASE_LOOKUP', name: 'Disease Lookup', description: 'Matches disease name to disease ID' },
  { id: 'CLASSIFICATION_MAP', name: 'Classification Mapping', description: 'Maps case status to classification' },
  { id: 'OUTCOME_MAP', name: 'Outcome Mapping', description: 'Maps outcome values' },
  { id: 'DATE_FORMAT', name: 'Date Format', description: 'Converts date formats to ISO' },
  { id: 'BOOLEAN_MAP', name: 'Boolean Mapping', description: 'Maps yes/no to true/false' },
];

export default function MappingPage() {
  const [selectedSource, setSelectedSource] = useState('all');

  const sources = ['all', 'DHIS2', 'CSV Import', 'API'];

  const filteredMappings = selectedSource === 'all'
    ? fieldMappings
    : fieldMappings.filter(m => m.source_type === selectedSource);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Variable Mapping</h1>
          <p className="text-muted-foreground">
            Configure field mappings between external data sources and SORMAS AI
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save Mappings
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Mapping
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Mappings</p>
                <p className="text-2xl font-bold text-foreground">{fieldMappings.length}</p>
              </div>
              <Database className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Mappings</p>
                <p className="text-2xl font-bold text-foreground">{fieldMappings.filter(m => m.status === 'active').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transformations</p>
                <p className="text-2xl font-bold text-foreground">{transformations.length}</p>
              </div>
              <FileText className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex gap-4">
            <Select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-48"
            >
              <option value="all">All Sources</option>
              <option value="DHIS2">DHIS2</option>
              <option value="CSV Import">CSV Import</option>
              <option value="API">API</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Mappings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Field Mappings</CardTitle>
          <CardDescription>Map source fields to SORMAS AI target fields</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Source Field</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground"></th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Target Field</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Source Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Transformation</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMappings.map((mapping) => (
                  <tr key={mapping.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <code className="rounded bg-muted px-2 py-1 text-sm text-foreground">{mapping.source_field}</code>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ArrowRight className="mx-auto h-4 w-4 text-muted-foreground" />
                    </td>
                    <td className="px-6 py-4">
                      <code className="rounded bg-primary/10 px-2 py-1 text-sm text-primary">{mapping.target_field}</code>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{mapping.source_type}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      {mapping.transformation ? (
                        <Badge variant="secondary">{mapping.transformation}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={mapping.status === 'active' ? 'success' : 'secondary'}>
                        {mapping.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Transformations */}
      <Card>
        <CardHeader>
          <CardTitle>Available Transformations</CardTitle>
          <CardDescription>Data transformation rules applied during import</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {transformations.map((t) => (
              <div key={t.id} className="rounded-lg border border-border p-4 hover:border-primary/50">
                <div className="flex items-center justify-between">
                  <code className="text-sm font-medium text-primary">{t.id}</code>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
