// ETL Pipeline Types

export interface ETLConfig {
  sourceType: 'api' | 'csv' | 'manual';
  entityType: 'case' | 'contact' | 'event' | 'sample';
  mappings: FieldMapping[];
  transformations: TransformationConfig[];
  validationRules: ValidationRule[];
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  required: boolean;
  defaultValue?: unknown;
  transformFunction?: TransformFunction;
}

export type TransformFunction =
  | 'uppercase'
  | 'lowercase'
  | 'trim'
  | 'date_parse'
  | 'number_parse'
  | 'boolean_parse'
  | 'lookup'
  | 'concat'
  | 'split'
  | 'custom';

export interface TransformationConfig {
  type: TransformFunction;
  sourceFields: string[];
  targetField: string;
  config: Record<string, unknown>;
}

export interface ValidationRule {
  field: string;
  rule: 'required' | 'email' | 'date' | 'number' | 'regex' | 'range' | 'enum';
  config?: Record<string, unknown>;
  errorMessage: string;
}

export interface ETLResult {
  success: boolean;
  totalRecords: number;
  processedRecords: number;
  createdRecords: number;
  updatedRecords: number;
  failedRecords: number;
  errors: ETLError[];
  warnings: ETLWarning[];
  duration: number;
}

export interface ETLError {
  row: number;
  field?: string;
  value?: unknown;
  errorType: 'validation' | 'transformation' | 'duplicate' | 'missing_required' | 'reference';
  message: string;
}

export interface ETLWarning {
  row: number;
  field?: string;
  warningType: 'truncated' | 'default_applied' | 'format_corrected';
  message: string;
}

export interface CSVParseResult {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  errors: string[];
}

export interface APIFetchResult {
  data: Record<string, unknown>[];
  totalRecords: number;
  hasMore: boolean;
  nextCursor?: string;
}

// Standard SORMAS AI field names for mapping
export const CASE_FIELDS = [
  'external_id',
  'disease',
  'classification',
  'outcome',
  'onset_date',
  'report_date',
  'notification_date',
  'admin_unit_code',
  'hospitalized',
  'icu_admission',
  'lab_confirmed',
  'person.first_name',
  'person.last_name',
  'person.date_of_birth',
  'person.age_years',
  'person.sex',
  'person.phone',
  'person.address',
] as const;

export const CONTACT_FIELDS = [
  'external_id',
  'case_external_id',
  'contact_date',
  'contact_type',
  'relationship_to_case',
  'risk_level',
  'follow_up_status',
  'admin_unit_code',
  'person.first_name',
  'person.last_name',
  'person.date_of_birth',
  'person.age_years',
  'person.sex',
  'person.phone',
  'person.address',
] as const;

export type CaseField = (typeof CASE_FIELDS)[number];
export type ContactField = (typeof CONTACT_FIELDS)[number];
