-- SORMAS AI Database Schema
-- Multi-tenant Global Disease Surveillance Platform
-- PostgreSQL / Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'pending_setup');
CREATE TYPE data_source_type AS ENUM ('api', 'csv', 'manual');
CREATE TYPE etl_job_status AS ENUM ('pending', 'running', 'completed', 'failed', 'paused');
CREATE TYPE case_classification AS ENUM ('suspect', 'probable', 'confirmed', 'not_a_case');
CREATE TYPE case_outcome AS ENUM ('recovered', 'deceased', 'unknown', 'ongoing');
CREATE TYPE user_role AS ENUM ('global_admin', 'country_admin', 'country_user', 'regional_viewer', 'analyst');
CREATE TYPE contact_type AS ENUM ('household', 'workplace', 'healthcare', 'social', 'travel', 'other');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE follow_up_status AS ENUM ('under_follow_up', 'completed', 'lost_to_follow_up', 'converted_to_case');
CREATE TYPE sex_type AS ENUM ('male', 'female', 'other', 'unknown');
CREATE TYPE event_type AS ENUM ('outbreak', 'cluster', 'signal', 'alert');
CREATE TYPE event_status AS ENUM ('ongoing', 'closed', 'under_investigation');
CREATE TYPE test_result AS ENUM ('positive', 'negative', 'indeterminate', 'pending');
CREATE TYPE period_type AS ENUM ('daily', 'weekly', 'monthly', 'yearly');
CREATE TYPE alert_type AS ENUM ('threshold_exceeded', 'unusual_pattern', 'prediction_warning', 'data_quality');
CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical');

-- ============================================
-- TENANTS (Countries)
-- ============================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL, -- ISO 3166-1 alpha-3
    status tenant_status DEFAULT 'pending_setup',
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tenants_code ON tenants(code);
CREATE INDEX idx_tenants_status ON tenants(status);

-- ============================================
-- ADMINISTRATIVE LEVELS (Hierarchy Definition)
-- ============================================

CREATE TABLE admin_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    level INTEGER NOT NULL, -- 0 = country, 1 = state, 2 = LGA, etc.
    name VARCHAR(100) NOT NULL,
    name_plural VARCHAR(100) NOT NULL,
    is_lowest_level BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, level)
);

CREATE INDEX idx_admin_levels_tenant ON admin_levels(tenant_id);

-- ============================================
-- ADMINISTRATIVE UNITS (Actual Regions/LGAs/etc.)
-- ============================================

CREATE TABLE admin_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    admin_level_id UUID NOT NULL REFERENCES admin_levels(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES admin_units(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    population INTEGER,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    metadata JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

CREATE INDEX idx_admin_units_tenant ON admin_units(tenant_id);
CREATE INDEX idx_admin_units_parent ON admin_units(parent_id);
CREATE INDEX idx_admin_units_level ON admin_units(admin_level_id);
CREATE INDEX idx_admin_units_code ON admin_units(tenant_id, code);

-- ============================================
-- DISEASES
-- ============================================

CREATE TABLE diseases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    icd10_code VARCHAR(20),
    icd11_code VARCHAR(20),
    description TEXT,
    transmission_mode TEXT[],
    incubation_period_min_days INTEGER,
    incubation_period_max_days INTEGER,
    is_notifiable BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_diseases_name ON diseases(name);
CREATE INDEX idx_diseases_icd10 ON diseases(icd10_code);

-- ============================================
-- TENANT DISEASES (Per-country disease config)
-- ============================================

CREATE TABLE tenant_diseases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    disease_id UUID NOT NULL REFERENCES diseases(id) ON DELETE CASCADE,
    local_name VARCHAR(255),
    is_priority BOOLEAN DEFAULT FALSE,
    reporting_threshold INTEGER,
    custom_fields JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, disease_id)
);

CREATE INDEX idx_tenant_diseases_tenant ON tenant_diseases(tenant_id);

-- ============================================
-- TENANT CUSTOM FIELDS
-- ============================================

CREATE TABLE tenant_custom_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- 'case', 'contact', 'event', 'sample'
    fields JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, entity_type)
);

CREATE INDEX idx_tenant_custom_fields_tenant ON tenant_custom_fields(tenant_id);

-- ============================================
-- DATA SOURCES
-- ============================================

CREATE TABLE data_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type data_source_type NOT NULL,
    description TEXT,
    api_config JSONB, -- Encrypted credentials stored here
    csv_config JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_data_sources_tenant ON data_sources(tenant_id);
CREATE INDEX idx_data_sources_type ON data_sources(type);

-- ============================================
-- VARIABLE MAPPINGS (ETL Configuration)
-- ============================================

CREATE TABLE variable_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    data_source_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    mappings JSONB DEFAULT '[]'::jsonb,
    transformation_rules JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(data_source_id, entity_type)
);

CREATE INDEX idx_variable_mappings_tenant ON variable_mappings(tenant_id);
CREATE INDEX idx_variable_mappings_source ON variable_mappings(data_source_id);

-- ============================================
-- ETL JOBS
-- ============================================

CREATE TABLE etl_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    data_source_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    schedule_cron VARCHAR(100),
    is_scheduled BOOLEAN DEFAULT FALSE,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    status etl_job_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_etl_jobs_tenant ON etl_jobs(tenant_id);
CREATE INDEX idx_etl_jobs_status ON etl_jobs(status);
CREATE INDEX idx_etl_jobs_next_run ON etl_jobs(next_run_at) WHERE is_scheduled = TRUE;

-- ============================================
-- ETL JOB RUNS (History)
-- ============================================

CREATE TABLE etl_job_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES etl_jobs(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    status etl_job_status NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    records_processed INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_log JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_etl_job_runs_job ON etl_job_runs(job_id);
CREATE INDEX idx_etl_job_runs_tenant ON etl_job_runs(tenant_id);
CREATE INDEX idx_etl_job_runs_started ON etl_job_runs(started_at DESC);

-- ============================================
-- PERSONS
-- ============================================

CREATE TABLE persons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    external_id VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    date_of_birth DATE,
    age_years INTEGER,
    age_months INTEGER,
    sex sex_type DEFAULT 'unknown',
    phone VARCHAR(50),
    email VARCHAR(255),
    address_line TEXT,
    admin_unit_id UUID REFERENCES admin_units(id),
    occupation VARCHAR(255),
    occupation_details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_persons_tenant ON persons(tenant_id);
CREATE INDEX idx_persons_external ON persons(tenant_id, external_id);
CREATE INDEX idx_persons_admin_unit ON persons(admin_unit_id);

-- ============================================
-- CASES
-- ============================================

CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    external_id VARCHAR(255),
    data_source_id UUID REFERENCES data_sources(id),

    -- Person
    person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,

    -- Disease & Classification
    disease_id UUID NOT NULL REFERENCES diseases(id),
    classification case_classification DEFAULT 'suspect',
    classification_date DATE,
    outcome case_outcome,
    outcome_date DATE,

    -- Location
    admin_unit_id UUID NOT NULL REFERENCES admin_units(id),
    residence_admin_unit_id UUID REFERENCES admin_units(id),

    -- Dates
    onset_date DATE,
    report_date DATE NOT NULL,
    notification_date DATE,
    investigation_date DATE,

    -- Clinical
    hospitalized BOOLEAN DEFAULT FALSE,
    hospitalization_date DATE,
    icu_admission BOOLEAN DEFAULT FALSE,

    -- Lab
    lab_confirmed BOOLEAN DEFAULT FALSE,
    specimens_collected BOOLEAN DEFAULT FALSE,

    -- Epidemiological
    epidemiological_week INTEGER,
    epidemiological_year INTEGER,

    -- Custom fields
    custom_data JSONB DEFAULT '{}'::jsonb,

    -- Metadata
    is_imported BOOLEAN DEFAULT FALSE,
    import_batch_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cases_tenant ON cases(tenant_id);
CREATE INDEX idx_cases_disease ON cases(disease_id);
CREATE INDEX idx_cases_admin_unit ON cases(admin_unit_id);
CREATE INDEX idx_cases_classification ON cases(classification);
CREATE INDEX idx_cases_report_date ON cases(report_date DESC);
CREATE INDEX idx_cases_epi_week ON cases(epidemiological_year, epidemiological_week);
CREATE INDEX idx_cases_external ON cases(tenant_id, external_id);

-- ============================================
-- CONTACTS
-- ============================================

CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    external_id VARCHAR(255),
    data_source_id UUID REFERENCES data_sources(id),

    -- Person
    person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,

    -- Linked Case
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,

    -- Contact Details
    contact_date DATE NOT NULL,
    contact_type contact_type DEFAULT 'other',
    relationship_to_case VARCHAR(255),

    -- Risk Assessment
    risk_level risk_level DEFAULT 'medium',

    -- Follow-up
    follow_up_status follow_up_status DEFAULT 'under_follow_up',
    follow_up_until DATE,
    last_contact_date DATE,

    -- Location
    admin_unit_id UUID NOT NULL REFERENCES admin_units(id),

    -- Custom fields
    custom_data JSONB DEFAULT '{}'::jsonb,

    -- Metadata
    is_imported BOOLEAN DEFAULT FALSE,
    import_batch_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contacts_tenant ON contacts(tenant_id);
CREATE INDEX idx_contacts_case ON contacts(case_id);
CREATE INDEX idx_contacts_person ON contacts(person_id);
CREATE INDEX idx_contacts_admin_unit ON contacts(admin_unit_id);
CREATE INDEX idx_contacts_follow_up ON contacts(follow_up_status);
CREATE INDEX idx_contacts_external ON contacts(tenant_id, external_id);

-- ============================================
-- EVENTS (Outbreaks, Clusters)
-- ============================================

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    external_id VARCHAR(255),

    name VARCHAR(255) NOT NULL,
    description TEXT,
    disease_id UUID REFERENCES diseases(id),

    event_type event_type NOT NULL,
    status event_status DEFAULT 'under_investigation',

    start_date DATE NOT NULL,
    end_date DATE,

    admin_unit_id UUID NOT NULL REFERENCES admin_units(id),

    total_cases INTEGER DEFAULT 0,
    total_deaths INTEGER DEFAULT 0,

    custom_data JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_tenant ON events(tenant_id);
CREATE INDEX idx_events_disease ON events(disease_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_admin_unit ON events(admin_unit_id);

-- ============================================
-- SAMPLES
-- ============================================

CREATE TABLE samples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    external_id VARCHAR(255),

    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,

    sample_type VARCHAR(100) NOT NULL,
    collection_date DATE NOT NULL,
    received_date DATE,

    lab_id VARCHAR(100),
    lab_name VARCHAR(255),

    test_type VARCHAR(100),
    test_result test_result,
    result_date DATE,

    custom_data JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_samples_tenant ON samples(tenant_id);
CREATE INDEX idx_samples_case ON samples(case_id);
CREATE INDEX idx_samples_result ON samples(test_result);

-- ============================================
-- AGGREGATED DATA
-- ============================================

CREATE TABLE aggregated_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    admin_unit_id UUID NOT NULL REFERENCES admin_units(id),
    disease_id UUID NOT NULL REFERENCES diseases(id),

    period_type period_type NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    epidemiological_week INTEGER,
    epidemiological_year INTEGER,

    total_cases INTEGER DEFAULT 0,
    confirmed_cases INTEGER DEFAULT 0,
    probable_cases INTEGER DEFAULT 0,
    suspect_cases INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,

    case_fatality_rate DECIMAL(5, 2),
    incidence_rate DECIMAL(10, 4),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, admin_unit_id, disease_id, period_type, period_start)
);

CREATE INDEX idx_aggregated_tenant ON aggregated_data(tenant_id);
CREATE INDEX idx_aggregated_admin_unit ON aggregated_data(admin_unit_id);
CREATE INDEX idx_aggregated_disease ON aggregated_data(disease_id);
CREATE INDEX idx_aggregated_period ON aggregated_data(period_type, period_start);

-- ============================================
-- USERS
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    role user_role NOT NULL DEFAULT 'country_user',
    tenant_id UUID REFERENCES tenants(id),
    allowed_admin_units UUID[],
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- AUDIT LOG
-- ============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================
-- PREDICTIONS
-- ============================================

CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    admin_unit_id UUID REFERENCES admin_units(id),
    disease_id UUID NOT NULL REFERENCES diseases(id),

    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50) NOT NULL,

    prediction_date DATE NOT NULL,
    prediction_horizon_days INTEGER NOT NULL,

    predicted_cases INTEGER NOT NULL,
    confidence_lower INTEGER,
    confidence_upper INTEGER,
    confidence_level DECIMAL(3, 2) DEFAULT 0.95,

    risk_level risk_level NOT NULL,
    risk_score DECIMAL(5, 2),

    factors JSONB DEFAULT '[]'::jsonb,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_predictions_tenant ON predictions(tenant_id);
CREATE INDEX idx_predictions_disease ON predictions(disease_id);
CREATE INDEX idx_predictions_admin_unit ON predictions(admin_unit_id);
CREATE INDEX idx_predictions_date ON predictions(prediction_date DESC);

-- ============================================
-- ALERTS
-- ============================================

CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    admin_unit_id UUID REFERENCES admin_units(id),
    disease_id UUID REFERENCES diseases(id),

    alert_type alert_type NOT NULL,
    severity alert_severity NOT NULL,

    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMPTZ,

    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_tenant ON alerts(tenant_id);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_unresolved ON alerts(is_resolved) WHERE is_resolved = FALSE;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tenant-specific tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE variable_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE etl_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE etl_job_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE aggregated_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's tenant_id
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT tenant_id FROM users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is global admin
CREATE OR REPLACE FUNCTION is_global_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role = 'global_admin' FROM users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example RLS policies for cases table
CREATE POLICY "Users can view cases in their tenant"
    ON cases FOR SELECT
    USING (tenant_id = get_user_tenant_id() OR is_global_admin());

CREATE POLICY "Country admins can insert cases"
    ON cases FOR INSERT
    WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "Country admins can update cases"
    ON cases FOR UPDATE
    USING (tenant_id = get_user_tenant_id());

-- Similar policies would be created for other tables...

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to calculate epidemiological week
CREATE OR REPLACE FUNCTION calculate_epi_week(d DATE)
RETURNS TABLE(epi_week INTEGER, epi_year INTEGER) AS $$
DECLARE
    jan1 DATE;
    week_num INTEGER;
BEGIN
    jan1 := DATE_TRUNC('year', d)::DATE;
    -- ISO week calculation
    epi_week := EXTRACT(WEEK FROM d)::INTEGER;
    epi_year := EXTRACT(ISOYEAR FROM d)::INTEGER;
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_units_updated_at BEFORE UPDATE ON admin_units
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_sources_updated_at BEFORE UPDATE ON data_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_persons_updated_at BEFORE UPDATE ON persons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_samples_updated_at BEFORE UPDATE ON samples
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA: Common Diseases
-- ============================================

INSERT INTO diseases (name, icd10_code, transmission_mode, incubation_period_min_days, incubation_period_max_days, is_notifiable) VALUES
('COVID-19', 'U07.1', ARRAY['respiratory', 'droplet', 'contact'], 1, 14, TRUE),
('Cholera', 'A00', ARRAY['waterborne', 'foodborne'], 1, 5, TRUE),
('Measles', 'B05', ARRAY['airborne', 'droplet'], 7, 21, TRUE),
('Yellow Fever', 'A95', ARRAY['vector-borne'], 3, 6, TRUE),
('Meningitis', 'A39', ARRAY['droplet', 'respiratory'], 2, 10, TRUE),
('Lassa Fever', 'A96.2', ARRAY['rodent', 'contact'], 6, 21, TRUE),
('Mpox', 'B04', ARRAY['contact', 'droplet'], 5, 21, TRUE),
('Dengue', 'A90', ARRAY['vector-borne'], 3, 14, TRUE),
('Malaria', 'B50', ARRAY['vector-borne'], 7, 30, TRUE),
('Typhoid', 'A01', ARRAY['waterborne', 'foodborne'], 7, 21, TRUE),
('Ebola', 'A98.4', ARRAY['contact', 'bodily fluids'], 2, 21, TRUE),
('Polio', 'A80', ARRAY['fecal-oral'], 3, 35, TRUE),
('Diphtheria', 'A36', ARRAY['droplet', 'contact'], 2, 5, TRUE),
('Pertussis', 'A37', ARRAY['droplet'], 7, 10, TRUE),
('Tuberculosis', 'A15', ARRAY['airborne'], 14, 84, TRUE),
('Influenza', 'J10', ARRAY['respiratory', 'droplet'], 1, 4, TRUE),
('Hepatitis A', 'B15', ARRAY['fecal-oral'], 15, 50, TRUE),
('Hepatitis B', 'B16', ARRAY['blood', 'sexual', 'vertical'], 45, 180, TRUE),
('Rabies', 'A82', ARRAY['animal bite'], 20, 90, TRUE),
('Anthrax', 'A22', ARRAY['contact', 'inhalation', 'ingestion'], 1, 7, TRUE);
