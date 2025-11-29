import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/tenants/[tenantId]/cases - List cases for a tenant
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query params for filtering and pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const diseaseId = searchParams.get('disease_id');
    const classification = searchParams.get('classification');
    const outcome = searchParams.get('outcome');
    const adminUnitId = searchParams.get('admin_unit_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    const offset = (page - 1) * limit;

    let query = supabase
      .from('cases')
      .select(
        `
        *,
        person:persons(*),
        disease:diseases(id, name),
        admin_unit:admin_units(id, name, code)
      `,
        { count: 'exact' }
      )
      .eq('tenant_id', tenantId)
      .order('report_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (diseaseId) {
      query = query.eq('disease_id', diseaseId);
    }

    if (classification) {
      query = query.eq('classification', classification);
    }

    if (outcome) {
      query = query.eq('outcome', outcome);
    }

    if (adminUnitId) {
      query = query.eq('admin_unit_id', adminUnitId);
    }

    if (startDate) {
      query = query.gte('report_date', startDate);
    }

    if (endDate) {
      query = query.lte('report_date', endDate);
    }

    const { data: cases, count, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      cases,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cases' },
      { status: 500 }
    );
  }
}

// POST /api/tenants/[tenantId]/cases - Create a new case
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      external_id,
      disease_id,
      classification,
      outcome,
      admin_unit_id,
      onset_date,
      report_date,
      hospitalized,
      icu_admission,
      lab_confirmed,
      person,
      custom_data,
    } = body;

    if (!disease_id || !report_date || !admin_unit_id) {
      return NextResponse.json(
        { error: 'disease_id, report_date, and admin_unit_id are required' },
        { status: 400 }
      );
    }

    // Create person record first if provided
    let personId = null;
    if (person) {
      const { data: newPerson, error: personError } = await supabase
        .from('persons')
        .insert({
          tenant_id: tenantId,
          ...person,
        })
        .select('id')
        .single();

      if (personError) throw personError;
      personId = newPerson.id;
    }

    // Calculate epidemiological week
    const reportDateObj = new Date(report_date);
    const startOfYear = new Date(reportDateObj.getFullYear(), 0, 1);
    const dayOfYear = Math.floor(
      (reportDateObj.getTime() - startOfYear.getTime()) / 86400000
    );
    const epiWeek = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);

    // Create case
    const { data: newCase, error: caseError } = await supabase
      .from('cases')
      .insert({
        tenant_id: tenantId,
        external_id,
        person_id: personId,
        disease_id,
        classification: classification || 'suspect',
        outcome,
        admin_unit_id,
        onset_date,
        report_date,
        hospitalized: hospitalized || false,
        icu_admission: icu_admission || false,
        lab_confirmed: lab_confirmed || false,
        epidemiological_week: epiWeek,
        epidemiological_year: reportDateObj.getFullYear(),
        custom_data: custom_data || {},
        is_imported: false,
      })
      .select(
        `
        *,
        person:persons(*),
        disease:diseases(id, name),
        admin_unit:admin_units(id, name, code)
      `
      )
      .single();

    if (caseError) throw caseError;

    return NextResponse.json({ case: newCase }, { status: 201 });
  } catch (error) {
    console.error('Error creating case:', error);
    return NextResponse.json(
      { error: 'Failed to create case' },
      { status: 500 }
    );
  }
}
