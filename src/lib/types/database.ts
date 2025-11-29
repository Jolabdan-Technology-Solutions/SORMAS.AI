// SORMAS AI - Database Types
// Multi-tenant Global Disease Surveillance Platform

export type TenantStatus = 'active' | 'suspended' | 'pending_setup';
export type DataSourceType = 'api' | 'csv' | 'manual';
export type ETLJobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'paused';
export type CaseClassification = 'suspect' | 'probable' | 'confirmed' | 'not_a_case';
export type CaseOutcome = 'recovered' | 'deceased' | 'unknown' | 'ongoing';
export type UserRole = 'global_admin' | 'country_admin' | 'country_user' | 'regional_viewer' | 'analyst';

// ============================================
// TENANT / COUNTRY CONFIGURATION
// ============================================

export interface Tenant {
  id: string;
  name: string; // e.g., "Nigeria", "Ghana"
  code: string; // ISO 3166-1 alpha-3 e.g., "NGA", "GHA"
  status: TenantStatus;
  settings: TenantSettings;
  created_at: string;
  updated_at: string;
}

export interface TenantSettings {
  timezone: string;
  date_format: string; // e.g., "DD/MM/YYYY"
  currency?: string;
  default_language: string;
  enabled_diseases: string[]; // Disease IDs enabled for this tenant
  data_retention_days: number;
  allow_manual_entry: boolean;
  require_data_approval: boolean;
}

// ============================================
// ADMINISTRATIVE HIERARCHY
// ============================================

export interface AdminLevel {
  id: string;
  tenant_id: string;
  level: number; // 0 = country, 1 = region/state, 2 = district/LGA, etc.
  name: string; // e.g., "State", "LGA", "Ward"
  name_plural: string; // e.g., "States", "LGAs", "Wards"
  is_lowest_level: boolean;
  created_at: string;
}

export interface AdminUnit {
  id: string;
  tenant_id: string;
  admin_level_id: string;
  parent_id: string | null;
  name: string;
  code: string; // Unique code within tenant
  population?: number;
  latitude?: number;
  longitude?: number;
  metadata: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// DISEASE CONFIGURATION
// ============================================

export interface Disease {
  id: string;
  name: string;
  icd10_code?: string;
  icd11_code?: string;
  description?: string;
  transmission_mode: string[];
  incubation_period_min_days?: number;
  incubation_period_max_days?: number;
  is_notifiable: boolean;
  is_active: boolean;
  created_at: string;
}

export interface TenantDisease {
  id: string;
  tenant_id: string;
  disease_id: string;
  local_name?: string; // Country-specific name
  is_priority: boolean;
  reporting_threshold?: number; // Alert threshold
  custom_fields: CustomFieldDefinition[];
  created_at: string;
}

// ============================================
// CUSTOM FIELDS (Per-tenant configurability)
// ============================================

export type CustomFieldType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean';

export interface CustomFieldDefinition {
  field_key: string;
  field_label: string;
  field_type: CustomFieldType;
  options?: string[]; // For select/multiselect
  is_required: boolean;
  validation_regex?: string;
  default_value?: string | number | boolean;
}

export interface TenantCustomFields {
  id: string;
  tenant_id: string;
  entity_type: 'case' | 'contact' | 'event' | 'sample';
  fields: CustomFieldDefinition[];
  created_at: string;
  updated_at: string;
}

// ============================================
// DATA SOURCES & ETL CONFIGURATION
// ============================================

export interface DataSource {
  id: string;
  tenant_id: string;
  name: string;
  type: DataSourceType;
  description?: string;

  // API Configuration
  api_config?: {
    base_url: string;
    auth_type: 'none' | 'api_key' | 'oauth2' | 'basic';
    auth_credentials: Record<string, string>; // Encrypted
    endpoints: DataSourceEndpoint[];
    rate_limit_per_minute?: number;
    timeout_seconds?: number;
  };

  // CSV Configuration
  csv_config?: {
    delimiter: string;
    has_header: boolean;
    date_format: string;
    encoding: string;
  };

  is_active: boolean;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DataSourceEndpoint {
  name: string;
  path: string;
  method: 'GET' | 'POST';
  entity_type: 'case' | 'contact' | 'event' | 'sample' | 'aggregate';
  pagination_type?: 'offset' | 'cursor' | 'page';
  response_data_path?: string; // JSONPath to data array
}

// ============================================
// VARIABLE MAPPING (ETL Configuration)
// ============================================

export interface VariableMapping {
  id: string;
  tenant_id: string;
  data_source_id: string;
  entity_type: 'case' | 'contact' | 'event' | 'sample';
  mappings: FieldMapping[];
  transformation_rules: TransformationRule[];
  created_at: string;
  updated_at: string;
}

export interface FieldMapping {
  source_field: string; // Field name in external system
  target_field: string; // Field name in SORMAS AI
  is_required: boolean;
  default_value?: string | number | boolean | null;
  transform_function?: string; // e.g., "uppercase", "date_parse", "lookup"
}

export interface TransformationRule {
  rule_type: 'value_map' | 'date_convert' | 'concat' | 'split' | 'lookup' | 'calculate';
  source_fields: string[];
  target_field: string;
  config: Record<string, unknown>;
}

// ============================================
// ETL JOBS & LOGS
// ============================================

export interface ETLJob {
  id: string;
  tenant_id: string;
  data_source_id: string;
  name: string;
  schedule_cron?: string; // Cron expression for scheduled jobs
  is_scheduled: boolean;
  last_run_at?: string;
  next_run_at?: string;
  status: ETLJobStatus;
  created_at: string;
  updated_at: string;
}

export interface ETLJobRun {
  id: string;
  job_id: string;
  tenant_id: string;
  status: ETLJobStatus;
  started_at: string;
  completed_at?: string;
  records_processed: number;
  records_created: number;
  records_updated: number;
  records_failed: number;
  error_log?: ETLError[];
  created_at: string;
}

export interface ETLError {
  row_number?: number;
  field?: string;
  error_type: 'validation' | 'transformation' | 'duplicate' | 'missing_required' | 'api_error';
  message: string;
  raw_data?: Record<string, unknown>;
}

// ============================================
// CASES
// ============================================

export interface Case {
  id: string;
  tenant_id: string;
  external_id?: string; // ID from source system
  data_source_id?: string;

  // Person Information
  person_id: string;

  // Disease & Classification
  disease_id: string;
  classification: CaseClassification;
  classification_date?: string;
  outcome?: CaseOutcome;
  outcome_date?: string;

  // Location
  admin_unit_id: string; // Reporting location
  residence_admin_unit_id?: string;

  // Dates
  onset_date?: string;
  report_date: string;
  notification_date?: string;
  investigation_date?: string;

  // Clinical
  hospitalized: boolean;
  hospitalization_date?: string;
  icu_admission: boolean;

  // Lab
  lab_confirmed: boolean;
  specimens_collected: boolean;

  // Epidemiological
  epidemiological_week: number;
  epidemiological_year: number;

  // Custom fields per tenant
  custom_data: Record<string, unknown>;

  // Metadata
  is_imported: boolean;
  import_batch_id?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// CONTACTS
// ============================================

export interface Contact {
  id: string;
  tenant_id: string;
  external_id?: string;
  data_source_id?: string;

  // Person Information
  person_id: string;

  // Linked Case
  case_id: string;

  // Contact Details
  contact_date: string;
  contact_type: 'household' | 'workplace' | 'healthcare' | 'social' | 'travel' | 'other';
  relationship_to_case?: string;

  // Risk Assessment
  risk_level: 'high' | 'medium' | 'low';

  // Follow-up
  follow_up_status: 'under_follow_up' | 'completed' | 'lost_to_follow_up' | 'converted_to_case';
  follow_up_until?: string;
  last_contact_date?: string;

  // Location
  admin_unit_id: string;

  // Custom fields
  custom_data: Record<string, unknown>;

  // Metadata
  is_imported: boolean;
  import_batch_id?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// PERSONS (Shared between Cases & Contacts)
// ============================================

export interface Person {
  id: string;
  tenant_id: string;
  external_id?: string;

  // Demographics
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  age_years?: number;
  age_months?: number;
  sex: 'male' | 'female' | 'other' | 'unknown';

  // Contact Info
  phone?: string;
  email?: string;

  // Address
  address_line?: string;
  admin_unit_id?: string;

  // Occupation
  occupation?: string;
  occupation_details?: string;

  created_at: string;
  updated_at: string;
}

// ============================================
// EVENTS (Outbreaks, Clusters)
// ============================================

export interface Event {
  id: string;
  tenant_id: string;
  external_id?: string;

  name: string;
  description?: string;
  disease_id?: string;

  event_type: 'outbreak' | 'cluster' | 'signal' | 'alert';
  status: 'ongoing' | 'closed' | 'under_investigation';

  start_date: string;
  end_date?: string;

  admin_unit_id: string;

  total_cases?: number;
  total_deaths?: number;

  custom_data: Record<string, unknown>;

  created_at: string;
  updated_at: string;
}

// ============================================
// SAMPLES / LAB
// ============================================

export interface Sample {
  id: string;
  tenant_id: string;
  external_id?: string;

  case_id: string;

  sample_type: string;
  collection_date: string;
  received_date?: string;

  lab_id?: string;
  lab_name?: string;

  test_type?: string;
  test_result?: 'positive' | 'negative' | 'indeterminate' | 'pending';
  result_date?: string;

  custom_data: Record<string, unknown>;

  created_at: string;
  updated_at: string;
}

// ============================================
// AGGREGATED DATA (For global views)
// ============================================

export interface AggregatedData {
  id: string;
  tenant_id: string;
  admin_unit_id: string;
  disease_id: string;

  period_type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  period_start: string;
  period_end: string;
  epidemiological_week?: number;
  epidemiological_year?: number;

  total_cases: number;
  confirmed_cases: number;
  probable_cases: number;
  suspect_cases: number;
  deaths: number;

  case_fatality_rate?: number;
  incidence_rate?: number;

  created_at: string;
  updated_at: string;
}

// ============================================
// USERS & ACCESS CONTROL
// ============================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;

  // For non-global roles
  tenant_id?: string;
  allowed_admin_units?: string[]; // Restrict access to specific regions

  is_active: boolean;
  last_login_at?: string;

  preferences: UserPreferences;

  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  dashboard_layout?: Record<string, unknown>;
  notification_settings: {
    email_alerts: boolean;
    outbreak_notifications: boolean;
  };
}

// ============================================
// AUDIT LOG
// ============================================

export interface AuditLog {
  id: string;
  tenant_id?: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// ============================================
// PREDICTIONS & ANALYTICS
// ============================================

export interface Prediction {
  id: string;
  tenant_id: string;
  admin_unit_id?: string;
  disease_id: string;

  model_name: string;
  model_version: string;

  prediction_date: string;
  prediction_horizon_days: number;

  predicted_cases: number;
  confidence_lower: number;
  confidence_upper: number;
  confidence_level: number; // e.g., 0.95 for 95% CI

  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;

  factors: PredictionFactor[];

  created_at: string;
}

export interface PredictionFactor {
  factor_name: string;
  contribution: number; // -1 to 1
  description: string;
}

// ============================================
// ALERTS
// ============================================

export interface Alert {
  id: string;
  tenant_id: string;
  admin_unit_id?: string;
  disease_id?: string;

  alert_type: 'threshold_exceeded' | 'unusual_pattern' | 'prediction_warning' | 'data_quality';
  severity: 'info' | 'warning' | 'critical';

  title: string;
  message: string;

  is_acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;

  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;

  created_at: string;
}
