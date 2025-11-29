import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/tenants/[tenantId]/contacts - List contacts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const caseId = searchParams.get('case_id');
    const followUpStatus = searchParams.get('follow_up_status');
    const riskLevel = searchParams.get('risk_level');
    const contactType = searchParams.get('contact_type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;

    let query = supabase
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

    const { data: contacts, count, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

// POST /api/tenants/[tenantId]/contacts - Create contact
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const {
      case_id,
      contact_date,
      contact_type,
      relationship_to_case,
      risk_level,
      admin_unit_id,
      person,
    } = body;

    if (!case_id || !contact_date || !admin_unit_id) {
      return NextResponse.json(
        { error: 'case_id, contact_date, and admin_unit_id are required' },
        { status: 400 }
      );
    }

    // Create person first
    let personId = null;
    if (person) {
      const { data: newPerson, error: personError } = await supabase
        .from('persons')
        .insert({ tenant_id: tenantId, ...person })
        .select('id')
        .single();

      if (personError) throw personError;
      personId = newPerson.id;
    }

    // Calculate follow-up end date (21 days from contact date)
    const followUpUntil = new Date(contact_date);
    followUpUntil.setDate(followUpUntil.getDate() + 21);

    const { data: newContact, error } = await supabase
      .from('contacts')
      .insert({
        tenant_id: tenantId,
        person_id: personId,
        case_id,
        contact_date,
        contact_type: contact_type || 'other',
        relationship_to_case,
        risk_level: risk_level || 'medium',
        follow_up_status: 'under_follow_up',
        follow_up_until: followUpUntil.toISOString().split('T')[0],
        admin_unit_id,
      })
      .select(`
        *,
        person:persons(*),
        case:cases(*, disease:diseases(*)),
        admin_unit:admin_units(*)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ contact: newContact }, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}
