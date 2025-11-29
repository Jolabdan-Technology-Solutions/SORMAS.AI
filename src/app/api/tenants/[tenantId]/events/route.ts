import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/tenants/[tenantId]/events - List events
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
    const diseaseId = searchParams.get('disease_id');
    const eventType = searchParams.get('event_type');
    const status = searchParams.get('status');
    const adminUnitId = searchParams.get('admin_unit_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;

    let query = supabase
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

    const { data: events, count, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST /api/tenants/[tenantId]/events - Create event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const {
      name,
      description,
      disease_id,
      event_type,
      status,
      start_date,
      end_date,
      admin_unit_id,
      total_cases,
      total_deaths,
    } = body;

    if (!name || !event_type || !start_date || !admin_unit_id) {
      return NextResponse.json(
        { error: 'name, event_type, start_date, and admin_unit_id are required' },
        { status: 400 }
      );
    }

    const { data: newEvent, error } = await supabase
      .from('events')
      .insert({
        tenant_id: tenantId,
        name,
        description,
        disease_id,
        event_type,
        status: status || 'under_investigation',
        start_date,
        end_date,
        admin_unit_id,
        total_cases: total_cases || 0,
        total_deaths: total_deaths || 0,
      })
      .select(`
        *,
        disease:diseases(*),
        admin_unit:admin_units(*)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ event: newEvent }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
