'use client';

import { useState, useCallback } from 'react';
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
  Upload,
  FileText,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { parseCSV } from '@/lib/etl/csv-parser';
import { createDefaultCaseMappings } from '@/lib/etl/pipeline';
import type { FieldMapping, CSVParseResult } from '@/lib/etl/types';
import { CASE_FIELDS, CONTACT_FIELDS } from '@/lib/etl/types';

type ImportStep = 'upload' | 'mapping' | 'preview' | 'processing' | 'complete';

export default function ImportPage() {
  const [step, setStep] = useState<ImportStep>('upload');
  const [entityType, setEntityType] = useState<'case' | 'contact'>('case');
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const targetFields = entityType === 'case' ? CASE_FIELDS : CONTACT_FIELDS;

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      setFile(selectedFile);

      try {
        const result = await parseCSV(selectedFile);
        setParseResult(result);

        // Auto-generate mappings based on header names
        const autoMappings = createDefaultCaseMappings(result.headers);
        setMappings(autoMappings);

        setStep('mapping');
      } catch (error) {
        console.error('Failed to parse CSV:', error);
      }
    },
    []
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && droppedFile.type === 'text/csv') {
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
      const existing = prev.find((m) => m.sourceField === sourceField);
      if (existing) {
        return prev.map((m) =>
          m.sourceField === sourceField ? { ...m, targetField } : m
        );
      }
      return [
        ...prev,
        { sourceField, targetField, required: false },
      ];
    });
  };

  const removeMapping = (sourceField: string) => {
    setMappings((prev) => prev.filter((m) => m.sourceField !== sourceField));
  };

  const handleStartImport = async () => {
    setStep('processing');
    setIsProcessing(true);

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setIsProcessing(false);
    setStep('complete');
  };

  const resetImport = () => {
    setStep('upload');
    setFile(null);
    setParseResult(null);
    setMappings([]);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import Data</h1>
        <p className="text-gray-500">
          Upload CSV files to import cases, contacts, or other data
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        {['upload', 'mapping', 'preview', 'processing', 'complete'].map(
          (s, index) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  step === s
                    ? 'bg-blue-600 text-white'
                    : index <
                        ['upload', 'mapping', 'preview', 'processing', 'complete'].indexOf(
                          step
                        )
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
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
                      ? 'bg-green-500'
                      : 'bg-gray-200'
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
              <label className="mb-2 block text-sm font-medium">
                Data Type
              </label>
              <div className="flex gap-4">
                <Button
                  variant={entityType === 'case' ? 'default' : 'outline'}
                  onClick={() => setEntityType('case')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Cases
                </Button>
                <Button
                  variant={entityType === 'contact' ? 'default' : 'outline'}
                  onClick={() => setEntityType('contact')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Contacts
                </Button>
              </div>
            </div>

            {/* File Upload */}
            <div
              className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center transition-colors hover:border-blue-400"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-lg font-medium text-gray-900">
                Drag and drop your CSV file here
              </p>
              <p className="mt-1 text-sm text-gray-500">
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
                <span className="mt-4 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-gray-200 bg-white shadow-sm hover:bg-gray-100 hover:text-gray-900 h-9 px-4 py-2">
                  <Upload className="mr-2 h-4 w-4" />
                  Select File
                </span>
              </label>
            </div>

            {/* Download Template */}
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Need a template?</p>
                  <p className="text-sm text-gray-500">
                    Download a CSV template with the expected columns
                  </p>
                </div>
                <Button variant="outline">
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
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText className="h-4 w-4" />
                  {file?.name} • {parseResult.totalRows} rows
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Header row */}
                <div className="grid grid-cols-12 gap-4 border-b border-gray-200 pb-2 text-sm font-medium text-gray-500">
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
                        <ArrowRight className="mx-auto h-4 w-4 text-gray-400" />
                      </div>
                      <div className="col-span-4">
                        <Select
                          value={mapping?.targetField || ''}
                          onChange={(e) =>
                            updateMapping(header, e.target.value)
                          }
                        >
                          <option value="">-- Skip this column --</option>
                          {targetFields.map((field) => (
                            <option key={field} value={field}>
                              {field}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="col-span-2 truncate text-sm text-gray-500">
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
                            <Trash2 className="h-4 w-4 text-gray-400" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mapping Summary */}
              <div className="mt-6 rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        {mappings.length} fields mapped
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">
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
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-2 text-left font-medium text-gray-500">
                      #
                    </th>
                    {mappings.map((m) => (
                      <th
                        key={m.targetField}
                        className="px-4 py-2 text-left font-medium text-gray-500"
                      >
                        {m.targetField}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parseResult.rows.slice(0, 5).map((row, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="px-4 py-2 text-gray-400">{index + 1}</td>
                      {mappings.map((m) => (
                        <td key={m.targetField} className="px-4 py-2">
                          {row[m.sourceField] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-500">
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
            <RefreshCw className="mx-auto h-12 w-12 animate-spin text-blue-500" />
            <h3 className="mt-4 text-lg font-medium">Processing Import...</h3>
            <p className="mt-2 text-gray-500">
              This may take a few minutes depending on the file size
            </p>
            <div className="mx-auto mt-6 w-64">
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full w-1/2 animate-pulse bg-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Complete */}
      {step === 'complete' && (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
            <h3 className="mt-4 text-xl font-medium">Import Complete!</h3>
            <p className="mt-2 text-gray-500">
              Successfully imported {parseResult?.totalRows} records
            </p>

            <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-4">
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-2xl font-bold text-green-600">
                  {parseResult?.totalRows}
                </p>
                <p className="text-sm text-green-700">Created</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-2xl font-bold text-blue-600">0</p>
                <p className="text-sm text-blue-700">Updated</p>
              </div>
              <div className="rounded-lg bg-red-50 p-4">
                <p className="text-2xl font-bold text-red-600">0</p>
                <p className="text-sm text-red-700">Failed</p>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <Button variant="outline" onClick={resetImport}>
                Import Another File
              </Button>
              <Button>View Imported Data</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
