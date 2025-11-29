'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Upload,
  FileText,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Trash2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

// Default tenant ID
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

type ImportStep = 'upload' | 'mapping' | 'preview' | 'processing' | 'complete';

interface ParsedData {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

interface FieldMapping {
  sourceField: string;
  targetField: string;
}

interface ImportResult {
  job_id: string;
  status: string;
  records_processed: number;
  records_failed: number;
  total_rows: number;
  errors: string[];
}

const CASE_FIELDS = [
  'first_name',
  'last_name',
  'age',
  'sex',
  'phone',
  'address',
  'disease',
  'disease_id',
  'classification',
  'outcome',
  'hospitalized',
  'report_date',
  'onset_date',
  'location',
  'admin_unit_id',
];

const CONTACT_FIELDS = [
  'first_name',
  'last_name',
  'age',
  'sex',
  'phone',
  'contact_date',
  'contact_type',
  'relationship',
  'risk_level',
  'source_case',
  'case_id',
  'location',
  'admin_unit_id',
];

const EVENT_FIELDS = [
  'name',
  'event_type',
  'status',
  'disease',
  'disease_id',
  'start_date',
  'end_date',
  'total_cases',
  'total_deaths',
  'description',
  'location',
  'admin_unit_id',
];

export default function ImportPage() {
  const router = useRouter();
  const [step, setStep] = useState<ImportStep>('upload');
  const [entityType, setEntityType] = useState<'cases' | 'contacts' | 'events'>('cases');
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParsedData | null>(null);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const targetFields = entityType === 'cases'
    ? CASE_FIELDS
    : entityType === 'contacts'
      ? CONTACT_FIELDS
      : EVENT_FIELDS;

  const parseCSV = (text: string): ParsedData => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      throw new Error('Empty CSV file');
    }

    // Parse headers - handle quoted headers
    const parseRow = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseRow(lines[0]).map(h =>
      h.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    );

    const rows: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseRow(lines[i]);
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }

    return {
      headers,
      rows,
      totalRows: rows.length,
    };
  };

  const autoGenerateMappings = (headers: string[]): FieldMapping[] => {
    const mappings: FieldMapping[] = [];

    const fieldAliases: Record<string, string[]> = {
      first_name: ['first_name', 'firstname', 'fname', 'given_name', 'givenname'],
      last_name: ['last_name', 'lastname', 'lname', 'surname', 'family_name', 'familyname'],
      age: ['age', 'age_years', 'ageyears', 'years_old'],
      sex: ['sex', 'gender'],
      phone: ['phone', 'telephone', 'mobile', 'phone_number', 'phonenumber'],
      address: ['address', 'location_address', 'home_address'],
      disease: ['disease', 'disease_name', 'diseasename', 'diagnosis'],
      classification: ['classification', 'case_classification', 'status'],
      outcome: ['outcome', 'case_outcome', 'result'],
      hospitalized: ['hospitalized', 'hospital', 'admitted'],
      report_date: ['report_date', 'reportdate', 'date_reported', 'notification_date'],
      onset_date: ['onset_date', 'onsetdate', 'symptom_onset', 'date_of_onset'],
      location: ['location', 'area', 'region', 'district', 'state', 'lga'],
      contact_date: ['contact_date', 'contactdate', 'date_of_contact', 'exposure_date'],
      contact_type: ['contact_type', 'contacttype', 'type_of_contact'],
      relationship: ['relationship', 'relationship_to_case', 'relation'],
      risk_level: ['risk_level', 'risklevel', 'risk'],
      source_case: ['source_case', 'sourcecase', 'index_case', 'linked_case'],
      name: ['name', 'event_name', 'eventname', 'title'],
      event_type: ['event_type', 'eventtype', 'type'],
      start_date: ['start_date', 'startdate', 'date_started', 'begin_date'],
      end_date: ['end_date', 'enddate', 'date_ended'],
      total_cases: ['total_cases', 'totalcases', 'case_count', 'cases'],
      total_deaths: ['total_deaths', 'totaldeaths', 'death_count', 'deaths'],
      description: ['description', 'notes', 'details', 'comments'],
    };

    headers.forEach(header => {
      for (const [targetField, aliases] of Object.entries(fieldAliases)) {
        if (aliases.includes(header) && targetFields.includes(targetField)) {
          mappings.push({ sourceField: header, targetField });
          break;
        }
      }
    });

    return mappings;
  };

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      setFile(selectedFile);
      setError(null);

      try {
        const text = await selectedFile.text();
        const result = parseCSV(text);
        setParseResult(result);

        const autoMappings = autoGenerateMappings(result.headers);
        setMappings(autoMappings);

        setStep('mapping');
      } catch (err: any) {
        setError(err.message || 'Failed to parse CSV file');
      }
    },
    [entityType, targetFields]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
        const input = document.createElement('input');
        input.type = 'file';
        const dt = new DataTransfer();
        dt.items.add(droppedFile);
        input.files = dt.files;

        const event = {
          target: input,
        } as React.ChangeEvent<HTMLInputElement>;
        handleFileSelect(event);
      }
    },
    [handleFileSelect]
  );

  const updateMapping = (sourceField: string, targetField: string) => {
    setMappings((prev) => {
      const filtered = prev.filter((m) => m.sourceField !== sourceField);
      if (targetField) {
        return [...filtered, { sourceField, targetField }];
      }
      return filtered;
    });
  };

  const removeMapping = (sourceField: string) => {
    setMappings((prev) => prev.filter((m) => m.sourceField !== sourceField));
  };

  const handleStartImport = async () => {
    if (!file || !parseResult) return;

    setStep('processing');
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entity_type', entityType);

      // Convert mappings to column mapping format
      const columnMappings: Record<string, string> = {};
      mappings.forEach(m => {
        columnMappings[m.targetField] = m.sourceField;
      });
      formData.append('mappings', JSON.stringify(columnMappings));

      const response = await fetch(`/api/tenants/${DEFAULT_TENANT_ID}/etl/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Import failed');
      }

      setImportResult(result);
      setStep('complete');
    } catch (err: any) {
      setError(err.message || 'Import failed');
      setStep('preview'); // Go back to preview on error
    } finally {
      setIsProcessing(false);
    }
  };

  const resetImport = () => {
    setStep('upload');
    setFile(null);
    setParseResult(null);
    setMappings([]);
    setImportResult(null);
    setError(null);
  };

  const downloadTemplate = () => {
    let headers: string[];
    if (entityType === 'cases') {
      headers = ['first_name', 'last_name', 'age', 'sex', 'phone', 'address', 'disease', 'classification', 'outcome', 'hospitalized', 'report_date', 'onset_date', 'location'];
    } else if (entityType === 'contacts') {
      headers = ['first_name', 'last_name', 'age', 'sex', 'phone', 'contact_date', 'contact_type', 'relationship', 'risk_level', 'source_case', 'location'];
    } else {
      headers = ['name', 'event_type', 'status', 'disease', 'start_date', 'end_date', 'total_cases', 'total_deaths', 'description', 'location'];
    }

    const csv = headers.join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityType}_template.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Import Data</h1>
        <p className="text-muted-foreground">
          Upload CSV files to import cases, contacts, or events
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-destructive">{error}</p>
            <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        {['upload', 'mapping', 'preview', 'processing', 'complete'].map(
          (s, index) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  step === s
                    ? 'bg-primary text-primary-foreground'
                    : index <
                        ['upload', 'mapping', 'preview', 'processing', 'complete'].indexOf(
                          step
                        )
                      ? 'bg-success text-white'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {index <
                ['upload', 'mapping', 'preview', 'processing', 'complete'].indexOf(
                  step
                ) ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  index + 1
                )}
              </div>
              {index < 4 && (
                <div
                  className={`mx-2 h-0.5 w-12 ${
                    index <
                    ['upload', 'mapping', 'preview', 'processing', 'complete'].indexOf(
                      step
                    )
                      ? 'bg-success'
                      : 'bg-muted'
                  }`}
                />
              )}
            </div>
          )
        )}
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Select the type of data and upload your CSV file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Entity Type Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Data Type
              </label>
              <div className="flex gap-4">
                <Button
                  variant={entityType === 'cases' ? 'default' : 'outline'}
                  onClick={() => setEntityType('cases')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Cases
                </Button>
                <Button
                  variant={entityType === 'contacts' ? 'default' : 'outline'}
                  onClick={() => setEntityType('contacts')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Contacts
                </Button>
                <Button
                  variant={entityType === 'events' ? 'default' : 'outline'}
                  onClick={() => setEntityType('events')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Events
                </Button>
              </div>
            </div>

            {/* File Upload */}
            <div
              className="rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors hover:border-primary"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium text-foreground">
                Drag and drop your CSV file here
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                or click to browse your files
              </p>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                id="file-upload"
                onChange={handleFileSelect}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-4 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-border bg-background shadow-sm hover:bg-muted h-9 px-4 py-2">
                  <Upload className="mr-2 h-4 w-4" />
                  Select File
                </span>
              </label>
            </div>

            {/* Download Template */}
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Need a template?</p>
                  <p className="text-sm text-muted-foreground">
                    Download a CSV template with the expected columns for {entityType}
                  </p>
                </div>
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Mapping */}
      {step === 'mapping' && parseResult && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Map Fields</CardTitle>
                  <CardDescription>
                    Map your CSV columns to SORMAS AI fields
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {file?.name} • {parseResult.totalRows} rows
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Header row */}
                <div className="grid grid-cols-12 gap-4 border-b border-border pb-2 text-sm font-medium text-muted-foreground">
                  <div className="col-span-4">Source Column (CSV)</div>
                  <div className="col-span-1 text-center">
                    <ArrowRight className="mx-auto h-4 w-4" />
                  </div>
                  <div className="col-span-4">Target Field (SORMAS AI)</div>
                  <div className="col-span-2">Sample Value</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Mapping rows */}
                {parseResult.headers.map((header) => {
                  const mapping = mappings.find((m) => m.sourceField === header);
                  const sampleValue = parseResult.rows[0]?.[header];

                  return (
                    <div
                      key={header}
                      className="grid grid-cols-12 items-center gap-4"
                    >
                      <div className="col-span-4">
                        <Badge variant="outline" className="font-mono">
                          {header}
                        </Badge>
                      </div>
                      <div className="col-span-1 text-center">
                        <ArrowRight className="mx-auto h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="col-span-4">
                        <Select
                          value={mapping?.targetField || 'skip'}
                          onValueChange={(value) =>
                            updateMapping(header, value === 'skip' ? '' : value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Skip this column" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="skip">-- Skip this column --</SelectItem>
                            {targetFields.map((field) => (
                              <SelectItem key={field} value={field}>
                                {field}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 truncate text-sm text-muted-foreground">
                        {sampleValue || '-'}
                      </div>
                      <div className="col-span-1">
                        {mapping && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeMapping(header)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mapping Summary */}
              <div className="mt-6 rounded-lg bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span className="text-sm text-foreground">
                        {mappings.length} fields mapped
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-warning" />
                      <span className="text-sm text-foreground">
                        {parseResult.headers.length - mappings.length} fields
                        skipped
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={resetImport}>
                      Back
                    </Button>
                    <Button onClick={() => setStep('preview')}>
                      Continue to Preview
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 'preview' && parseResult && (
        <Card>
          <CardHeader>
            <CardTitle>Preview Import</CardTitle>
            <CardDescription>
              Review the first few records before importing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                      #
                    </th>
                    {mappings.map((m) => (
                      <th
                        key={m.targetField}
                        className="px-4 py-2 text-left font-medium text-muted-foreground"
                      >
                        {m.targetField}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parseResult.rows.slice(0, 5).map((row, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="px-4 py-2 text-muted-foreground">{index + 1}</td>
                      {mappings.map((m) => (
                        <td key={m.targetField} className="px-4 py-2 text-foreground">
                          {row[m.sourceField] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing 5 of {parseResult.totalRows} records
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('mapping')}>
                  Back to Mapping
                </Button>
                <Button onClick={handleStartImport}>
                  Start Import ({parseResult.totalRows} records)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Processing */}
      {step === 'processing' && (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h3 className="mt-4 text-lg font-medium text-foreground">Processing Import...</h3>
            <p className="mt-2 text-muted-foreground">
              This may take a few minutes depending on the file size
            </p>
            <div className="mx-auto mt-6 w-64">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-1/2 animate-pulse bg-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Complete */}
      {step === 'complete' && importResult && (
        <Card>
          <CardContent className="py-12 text-center">
            {importResult.status === 'failed' ? (
              <XCircle className="mx-auto h-16 w-16 text-destructive" />
            ) : importResult.records_failed > 0 ? (
              <AlertTriangle className="mx-auto h-16 w-16 text-warning" />
            ) : (
              <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
            )}

            <h3 className="mt-4 text-xl font-medium text-foreground">
              {importResult.status === 'failed'
                ? 'Import Failed'
                : importResult.records_failed > 0
                  ? 'Import Completed with Errors'
                  : 'Import Complete!'}
            </h3>
            <p className="mt-2 text-muted-foreground">
              {importResult.status === 'failed'
                ? 'All records failed to import'
                : `Successfully imported ${importResult.records_processed} records`}
            </p>

            <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-4">
              <div className="rounded-lg bg-success/10 p-4">
                <p className="text-2xl font-bold text-success">
                  {importResult.records_processed}
                </p>
                <p className="text-sm text-success">Created</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-4">
                <p className="text-2xl font-bold text-primary">
                  {importResult.total_rows}
                </p>
                <p className="text-sm text-primary">Total</p>
              </div>
              <div className="rounded-lg bg-destructive/10 p-4">
                <p className="text-2xl font-bold text-destructive">
                  {importResult.records_failed}
                </p>
                <p className="text-sm text-destructive">Failed</p>
              </div>
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <div className="mx-auto mt-6 max-w-2xl text-left">
                <p className="mb-2 font-medium text-foreground">Errors:</p>
                <div className="max-h-32 overflow-y-auto rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                  {importResult.errors.map((err, i) => (
                    <p key={i}>{err}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-center gap-4">
              <Button variant="outline" onClick={resetImport}>
                Import Another File
              </Button>
              <Button onClick={() => router.push(`/${entityType}`)}>
                View Imported Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
