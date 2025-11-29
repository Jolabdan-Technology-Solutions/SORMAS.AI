import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/tenants/[tenantId]/alerts - Get alerts/notifications
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
    const alertType = searchParams.get('alert_type');
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const unreadOnly = searchParams.get('unread') === 'true';

    const offset = (page - 1) * limit;

    let query = supabase
      .from('alerts')
      .select(`
        *,
        disease:diseases(id, name),
        admin_unit:admin_units(id, name)
      `, { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (alertType) query = query.eq('alert_type', alertType);
    if (severity) query = query.eq('severity', severity);
    if (status) query = query.eq('status', status);
    if (unreadOnly) query = query.eq('status', 'new');

    const { data: alerts, count, error } = await query;

    if (error) throw error;

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'new');

    return NextResponse.json({
      alerts,
      unreadCount: unreadCount || 0,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

// POST /api/tenants/[tenantId]/alerts - Create alert
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const {
      alert_type,
      severity,
      title,
      description,
      disease_id,
      admin_unit_id,
      threshold_value,
      actual_value,
      metadata,
    } = body;

    if (!alert_type || !severity || !title) {
      return NextResponse.json(
        { error: 'alert_type, severity, and title are required' },
        { status: 400 }
      );
    }

    const { data: newAlert, error } = await supabase
      .from('alerts')
      .insert({
        tenant_id: tenantId,
        alert_type,
        severity,
        title,
        description,
        disease_id,
        admin_unit_id,
        threshold_value,
        actual_value,
        metadata,
        status: 'new',
      })
      .select(`
        *,
        disease:diseases(id, name),
        admin_unit:admin_units(id, name)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ alert: newAlert }, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
  }
}

// PATCH /api/tenants/[tenantId]/alerts - Mark alerts as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { alert_ids, status = 'acknowledged' } = body;

    if (!alert_ids || !Array.isArray(alert_ids) || alert_ids.length === 0) {
      return NextResponse.json({ error: 'alert_ids array is required' }, { status: 400 });
    }

    const { data: updatedAlerts, error } = await supabase
      .from('alerts')
      .update({
        status,
        acknowledged_at: status === 'acknowledged' ? new Date().toISOString() : null,
      })
      .eq('tenant_id', tenantId)
      .in('id', alert_ids)
      .select();

    if (error) throw error;

    return NextResponse.json({ alerts: updatedAlerts });
  } catch (error) {
    console.error('Error updating alerts:', error);
    return NextResponse.json({ error: 'Failed to update alerts' }, { status: 500 });
  }
}
