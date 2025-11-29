import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/tenants/[tenantId]/admin-units - List admin units for a tenant
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

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parent_id');
    const levelId = searchParams.get('level_id');

    let query = supabase
      .from('admin_units')
      .select(
        `
        *,
        admin_level:admin_levels(id, name, level)
      `
      )
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('name');

    if (parentId) {
      query = query.eq('parent_id', parentId);
    }

    if (levelId) {
      query = query.eq('admin_level_id', levelId);
    }

    const { data: adminUnits, error } = await query;

    if (error) throw error;

    return NextResponse.json({ adminUnits });
  } catch (error) {
    console.error('Error fetching admin units:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin units' },
      { status: 500 }
    );
  }
}

// POST /api/tenants/[tenantId]/admin-units - Create admin unit
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
    const { name, code, admin_level_id, parent_id, population, latitude, longitude } = body;

    if (!name || !code || !admin_level_id) {
      return NextResponse.json(
        { error: 'Name, code, and admin_level_id are required' },
        { status: 400 }
      );
    }

    const { data: adminUnit, error } = await supabase
      .from('admin_units')
      .insert({
        tenant_id: tenantId,
        name,
        code,
        admin_level_id,
        parent_id: parent_id || null,
        population: population || null,
        latitude: latitude || null,
        longitude: longitude || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'An admin unit with this code already exists' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ adminUnit }, { status: 201 });
  } catch (error) {
    console.error('Error creating admin unit:', error);
    return NextResponse.json(
      { error: 'Failed to create admin unit' },
      { status: 500 }
    );
  }
}
