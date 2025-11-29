import { createClient } from '@/lib/supabase/client';

// Types
export interface DateRange {
  startDate?: string;
  endDate?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface CaseFilters extends PaginationParams, DateRange {
  diseaseId?: string;
  classification?: string;
  outcome?: string;
  adminUnitId?: string;
  search?: string;
}

export interface ContactFilters extends PaginationParams, DateRange {
  caseId?: string;
  followUpStatus?: string;
  riskLevel?: string;
  contactType?: string;
  search?: string;
}

export interface EventFilters extends PaginationParams, DateRange {
  diseaseId?: string;
  eventType?: string;
  status?: string;
  adminUnitId?: string;
  search?: string;
}

export interface SampleFilters extends PaginationParams, DateRange {
  caseId?: string;
  testResult?: string;
  sampleType?: string;
  search?: string;
}

export interface DashboardStats {
  totalCases: number;
  casesChange: number;
  activeContacts: number;
  contactsChange: number;
  activeOutbreaks: number;
  outbreaksChange: number;
  pendingSamples: number;
  aiPredictions: number;
}

// Data Service Class
class DataService {
  private supabase = createClient();

  // Get current tenant ID (from store or session)
  private async getTenantId(): Promise<string | null> {
    // For now, get from first available tenant - in production this comes from user session
    const { data } = await this.supabase
      .from('tenants')
      .select('id')
      .eq('status', 'active')
      .limit(1)
      .single();
    return data?.id || null;
  }

  // ==================== CASES ====================

  async getCases(tenantId: string, filters: CaseFilters = {}) {
    const { page = 1, limit = 25, diseaseId, classification, outcome, adminUnitId, startDate, endDate, search } = filters;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('cases')
      .select(`
        *,
        person:persons(id, first_name, last_name, age_years, sex, phone),
        disease:diseases(id, name),
        admin_unit:admin_units(id, name, code)
      `, { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('report_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (diseaseId) query = query.eq('disease_id', diseaseId);
    if (classification) query = query.eq('classification', classification);
    if (outcome) query = query.eq('outcome', outcome);
    if (adminUnitId) query = query.eq('admin_unit_id', adminUnitId);
    if (startDate) query = query.gte('report_date', startDate);
    if (endDate) query = query.lte('report_date', endDate);
    if (search) {
      query = query.or(`external_id.ilike.%${search}%,person.first_name.ilike.%${search}%,person.last_name.ilike.%${search}%`);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    return {
      cases: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async getCaseById(tenantId: string, caseId: string) {
    const { data, error } = await this.supabase
      .from('cases')
      .select(`
        *,
        person:persons(*),
        disease:diseases(*),
        admin_unit:admin_units(*),
        contacts:contacts(count),
        samples:samples(count)
      `)
      .eq('tenant_id', tenantId)
      .eq('id', caseId)
      .single();

    if (error) throw error;
    return data;
  }

  async createCase(tenantId: string, caseData: Record<string, unknown>) {
    // Create person first if provided
    let personId = null;
    if (caseData.person) {
      const { data: person, error: personError } = await this.supabase
        .from('persons')
        .insert({ tenant_id: tenantId, ...(caseData.person as object) })
        .select('id')
        .single();
      if (personError) throw personError;
      personId = person.id;
    }

    // Calculate epi week
    const reportDate = new Date(caseData.report_date as string);
    const startOfYear = new Date(reportDate.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((reportDate.getTime() - startOfYear.getTime()) / 86400000);
    const epiWeek = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);

    const { data, error } = await this.supabase
      .from('cases')
      .insert({
        tenant_id: tenantId,
        person_id: personId,
        epidemiological_week: epiWeek,
        epidemiological_year: reportDate.getFullYear(),
        ...caseData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCase(tenantId: string, caseId: string, updates: Record<string, unknown>) {
    const { data, error } = await this.supabase
      .from('cases')
      .update(updates)
      .eq('tenant_id', tenantId)
      .eq('id', caseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ==================== CONTACTS ====================

  async getContacts(tenantId: string, filters: ContactFilters = {}) {
    const { page = 1, limit = 25, caseId, followUpStatus, riskLevel, contactType, startDate, endDate, search } = filters;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('contacts')
      .select(`
        *,
        person:persons(id, first_name, last_name, age_years, sex, phone),
        case:cases(id, external_id, disease:diseases(name)),
        admin_unit:admin_units(id, name, code)
      `, { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (caseId) query = query.eq('case_id', caseId);
    if (followUpStatus) query = query.eq('follow_up_status', followUpStatus);
    if (riskLevel) query = query.eq('risk_level', riskLevel);
    if (contactType) query = query.eq('contact_type', contactType);
    if (startDate) query = query.gte('contact_date', startDate);
    if (endDate) query = query.lte('contact_date', endDate);

    const { data, count, error } = await query;
    if (error) throw error;

    return {
      contacts: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async getContactById(tenantId: string, contactId: string) {
    const { data, error } = await this.supabase
      .from('contacts')
      .select(`
        *,
        person:persons(*),
        case:cases(*, disease:diseases(*)),
        admin_unit:admin_units(*)
      `)
      .eq('tenant_id', tenantId)
      .eq('id', contactId)
      .single();

    if (error) throw error;
    return data;
  }

  // ==================== EVENTS ====================

  async getEvents(tenantId: string, filters: EventFilters = {}) {
    const { page = 1, limit = 25, diseaseId, eventType, status, adminUnitId, startDate, endDate, search } = filters;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('events')
      .select(`
        *,
        disease:diseases(id, name),
        admin_unit:admin_units(id, name, code)
      `, { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('start_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (diseaseId) query = query.eq('disease_id', diseaseId);
    if (eventType) query = query.eq('event_type', eventType);
    if (status) query = query.eq('status', status);
    if (adminUnitId) query = query.eq('admin_unit_id', adminUnitId);
    if (startDate) query = query.gte('start_date', startDate);
    if (endDate) query = query.lte('start_date', endDate);
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    return {
      events: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  // ==================== SAMPLES ====================

  async getSamples(tenantId: string, filters: SampleFilters = {}) {
    const { page = 1, limit = 25, caseId, testResult, sampleType, startDate, endDate, search } = filters;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('samples')
      .select(`
        *,
        case:cases(id, external_id, person:persons(first_name, last_name), disease:diseases(name))
      `, { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('collection_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (caseId) query = query.eq('case_id', caseId);
    if (testResult) query = query.eq('test_result', testResult);
    if (sampleType) query = query.eq('sample_type', sampleType);
    if (startDate) query = query.gte('collection_date', startDate);
    if (endDate) query = query.lte('collection_date', endDate);

    const { data, count, error } = await query;
    if (error) throw error;

    return {
      samples: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  // ==================== DASHBOARD ====================

  async getDashboardStats(tenantId: string, dateRange?: DateRange): Promise<DashboardStats> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const startDate = dateRange?.startDate || thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = dateRange?.endDate || now.toISOString().split('T')[0];
    const prevStartDate = sixtyDaysAgo.toISOString().split('T')[0];
    const prevEndDate = thirtyDaysAgo.toISOString().split('T')[0];

    // Current period counts
    const [casesResult, contactsResult, eventsResult, samplesResult, predictionsResult] = await Promise.all([
      this.supabase.from('cases').select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('report_date', startDate)
        .lte('report_date', endDate),
      this.supabase.from('contacts').select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('follow_up_status', 'under_follow_up'),
      this.supabase.from('events').select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('status', 'ongoing'),
      this.supabase.from('samples').select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('test_result', 'pending'),
      this.supabase.from('predictions').select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('prediction_date', startDate),
    ]);

    // Previous period for comparison
    const [prevCasesResult, prevContactsResult, prevEventsResult] = await Promise.all([
      this.supabase.from('cases').select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('report_date', prevStartDate)
        .lte('report_date', prevEndDate),
      this.supabase.from('contacts').select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('created_at', prevStartDate)
        .lte('created_at', prevEndDate),
      this.supabase.from('events').select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('start_date', prevStartDate)
        .lte('start_date', prevEndDate),
    ]);

    const totalCases = casesResult.count || 0;
    const prevCases = prevCasesResult.count || 0;
    const casesChange = prevCases > 0 ? Math.round(((totalCases - prevCases) / prevCases) * 100) : 0;

    const activeContacts = contactsResult.count || 0;
    const prevContacts = prevContactsResult.count || 0;
    const contactsChange = prevContacts > 0 ? Math.round(((activeContacts - prevContacts) / prevContacts) * 100) : 0;

    const activeOutbreaks = eventsResult.count || 0;
    const prevOutbreaks = prevEventsResult.count || 0;
    const outbreaksChange = activeOutbreaks - prevOutbreaks;

    return {
      totalCases,
      casesChange,
      activeContacts,
      contactsChange,
      activeOutbreaks,
      outbreaksChange,
      pendingSamples: samplesResult.count || 0,
      aiPredictions: predictionsResult.count || 0,
    };
  }

  async getWeeklyTrend(tenantId: string, weeks: number = 8) {
    const data: { week: string; cases: number; contacts: number; deaths: number }[] = [];

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7 + 7));
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - (i * 7));

      const [casesResult, contactsResult, deathsResult] = await Promise.all([
        this.supabase.from('cases').select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .gte('report_date', weekStart.toISOString().split('T')[0])
          .lte('report_date', weekEnd.toISOString().split('T')[0]),
        this.supabase.from('contacts').select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .gte('contact_date', weekStart.toISOString().split('T')[0])
          .lte('contact_date', weekEnd.toISOString().split('T')[0]),
        this.supabase.from('cases').select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .eq('outcome', 'deceased')
          .gte('outcome_date', weekStart.toISOString().split('T')[0])
          .lte('outcome_date', weekEnd.toISOString().split('T')[0]),
      ]);

      const weekNum = Math.ceil((weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
      data.push({
        week: `W${String(weekNum).padStart(2, '0')}`,
        cases: casesResult.count || 0,
        contacts: contactsResult.count || 0,
        deaths: deathsResult.count || 0,
      });
    }

    return data;
  }

  async getTopDiseases(tenantId: string, limit: number = 5) {
    const { data, error } = await this.supabase
      .from('cases')
      .select('disease_id, disease:diseases(name)')
      .eq('tenant_id', tenantId)
      .gte('report_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    if (error) throw error;

    // Count by disease
    const diseaseCounts: Record<string, { name: string; count: number }> = {};
    (data || []).forEach((c: any) => {
      const name = c.disease?.name || 'Unknown';
      if (!diseaseCounts[name]) {
        diseaseCounts[name] = { name, count: 0 };
      }
      diseaseCounts[name].count++;
    });

    return Object.values(diseaseCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((d, i) => ({
        name: d.name,
        cases: d.count,
        change: Math.floor(Math.random() * 40) - 20, // TODO: Calculate real change
        color: ['#10B981', '#3B82F6', '#8B5CF6', '#F97316', '#EF4444'][i] || '#6B7280',
      }));
  }

  async getCaseClassification(tenantId: string) {
    const { data, error } = await this.supabase
      .from('cases')
      .select('classification')
      .eq('tenant_id', tenantId);

    if (error) throw error;

    const counts = {
      confirmed: 0,
      probable: 0,
      suspect: 0,
    };

    (data || []).forEach((c: any) => {
      if (c.classification === 'confirmed') counts.confirmed++;
      else if (c.classification === 'probable') counts.probable++;
      else if (c.classification === 'suspect') counts.suspect++;
    });

    return [
      { name: 'Confirmed', value: counts.confirmed, color: '#EF4444' },
      { name: 'Probable', value: counts.probable, color: '#F97316' },
      { name: 'Suspected', value: counts.suspect, color: '#FBBF24' },
    ];
  }

  async getActiveOutbreaks(tenantId: string, limit: number = 5) {
    const { data, error } = await this.supabase
      .from('events')
      .select(`
        *,
        disease:diseases(name),
        admin_unit:admin_units(name)
      `)
      .eq('tenant_id', tenantId)
      .eq('status', 'ongoing')
      .order('start_date', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((e: any) => ({
      id: e.id,
      disease: e.disease?.name || 'Unknown',
      location: e.admin_unit?.name || 'Unknown',
      cases: e.total_cases,
      deaths: e.total_deaths,
      status: e.status,
      startDate: e.start_date,
    }));
  }

  async getRecentAlerts(tenantId: string, limit: number = 5) {
    const { data, error } = await this.supabase
      .from('alerts')
      .select(`
        *,
        disease:diseases(name),
        admin_unit:admin_units(name)
      `)
      .eq('tenant_id', tenantId)
      .eq('is_resolved', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  }

  // ==================== ADMIN UNITS ====================

  async getAdminUnits(tenantId: string) {
    const { data, error } = await this.supabase
      .from('admin_units')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  // ==================== DISEASES ====================

  async getDiseases() {
    const { data, error } = await this.supabase
      .from('diseases')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  // ==================== SEARCH ====================

  async globalSearch(tenantId: string, query: string, limit: number = 20) {
    const searchTerm = `%${query}%`;

    const [cases, contacts, events] = await Promise.all([
      this.supabase
        .from('cases')
        .select('id, external_id, person:persons(first_name, last_name), disease:diseases(name)')
        .eq('tenant_id', tenantId)
        .or(`external_id.ilike.${searchTerm}`)
        .limit(limit),
      this.supabase
        .from('contacts')
        .select('id, external_id, person:persons(first_name, last_name)')
        .eq('tenant_id', tenantId)
        .or(`external_id.ilike.${searchTerm}`)
        .limit(limit),
      this.supabase
        .from('events')
        .select('id, name, disease:diseases(name)')
        .eq('tenant_id', tenantId)
        .or(`name.ilike.${searchTerm}`)
        .limit(limit),
    ]);

    return {
      cases: cases.data || [],
      contacts: contacts.data || [],
      events: events.data || [],
    };
  }

  // ==================== PREDICTIONS ====================

  async getPredictions(tenantId: string, filters: PaginationParams & { diseaseId?: string; adminUnitId?: string } = {}) {
    const { page = 1, limit = 25, diseaseId, adminUnitId } = filters;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('predictions')
      .select(`
        *,
        disease:diseases(id, name),
        admin_unit:admin_units(id, name)
      `, { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('prediction_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (diseaseId) query = query.eq('disease_id', diseaseId);
    if (adminUnitId) query = query.eq('admin_unit_id', adminUnitId);

    const { data, count, error } = await query;
    if (error) throw error;

    return {
      predictions: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  // ==================== ETL ====================

  async getETLJobs(tenantId: string) {
    const { data, error } = await this.supabase
      .from('etl_jobs')
      .select(`
        *,
        data_source:data_sources(id, name, type)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getETLJobRuns(tenantId: string, jobId?: string, limit: number = 50) {
    let query = this.supabase
      .from('etl_job_runs')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (jobId) query = query.eq('job_id', jobId);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getDataSources(tenantId: string) {
    const { data, error } = await this.supabase
      .from('data_sources')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  // ==================== EXPORT ====================

  async exportData(tenantId: string, entityType: string, filters: Record<string, unknown> = {}) {
    let query;

    switch (entityType) {
      case 'cases':
        query = this.supabase
          .from('cases')
          .select(`
            *,
            person:persons(*),
            disease:diseases(name),
            admin_unit:admin_units(name, code)
          `)
          .eq('tenant_id', tenantId);
        break;
      case 'contacts':
        query = this.supabase
          .from('contacts')
          .select(`
            *,
            person:persons(*),
            case:cases(external_id),
            admin_unit:admin_units(name, code)
          `)
          .eq('tenant_id', tenantId);
        break;
      case 'events':
        query = this.supabase
          .from('events')
          .select(`
            *,
            disease:diseases(name),
            admin_unit:admin_units(name, code)
          `)
          .eq('tenant_id', tenantId);
        break;
      case 'samples':
        query = this.supabase
          .from('samples')
          .select(`
            *,
            case:cases(external_id, person:persons(first_name, last_name))
          `)
          .eq('tenant_id', tenantId);
        break;
      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }

    // Apply date filters if provided
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate as string);
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate as string);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
}

export const dataService = new DataService();
export default dataService;
