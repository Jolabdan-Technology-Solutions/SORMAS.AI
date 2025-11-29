import Papa from 'papaparse';
import type { CSVParseResult } from './types';

export async function parseCSV(file: File): Promise<CSVParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: (results) => {
        const errors: string[] = [];

        // Collect parsing errors
        if (results.errors.length > 0) {
          results.errors.forEach((error) => {
            errors.push(`Row ${error.row}: ${error.message}`);
          });
        }

        resolve({
          headers: results.meta.fields || [],
          rows: results.data as Record<string, string>[],
          totalRows: results.data.length,
          errors,
        });
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
}

export function parseCSVString(csvString: string): CSVParseResult {
  const results = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
  });

  const errors: string[] = [];
  if (results.errors.length > 0) {
    results.errors.forEach((error) => {
      errors.push(`Row ${error.row}: ${error.message}`);
    });
  }

  return {
    headers: results.meta.fields || [],
    rows: results.data as Record<string, string>[],
    totalRows: results.data.length,
    errors,
  };
}

export function generateCSVTemplate(fields: string[]): string {
  return fields.join(',') + '\n';
}

export function exportToCSV(data: Record<string, unknown>[], fields: string[]): string {
  return Papa.unparse(data, {
    columns: fields,
    header: true,
  });
}
