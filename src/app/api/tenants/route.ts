import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/tenants - List all tenants (for global admins)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('users')
      .select('role, tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Global admins can see all tenants
    if (profile.role === 'global_admin') {
      const { data: tenants, error } = await supabase
        .from('tenants')
        .select('*')
        .order('name');

      if (error) throw error;
      return NextResponse.json({ tenants });
    }

    // Other users can only see their own tenant
    if (profile.tenant_id) {
      const { data: tenant, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', profile.tenant_id)
        .single();

      if (error) throw error;
      return NextResponse.json({ tenants: [tenant] });
    }

    return NextResponse.json({ tenants: [] });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenants' },
      { status: 500 }
    );
  }
}

// POST /api/tenants - Create a new tenant (global admins only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is global admin
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'global_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, code, settings } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: 'Name and code are required' },
        { status: 400 }
      );
    }

    const { data: tenant, error } = await supabase
      .from('tenants')
      .insert({
        name,
        code: code.toUpperCase(),
        status: 'pending_setup',
        settings: settings || {
          timezone: 'UTC',
          date_format: 'YYYY-MM-DD',
          default_language: 'en',
          enabled_diseases: [],
          data_retention_days: 365,
          allow_manual_entry: false,
          require_data_approval: true,
        },
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A tenant with this code already exists' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ tenant }, { status: 201 });
  } catch (error) {
    console.error('Error creating tenant:', error);
    return NextResponse.json(
      { error: 'Failed to create tenant' },
      { status: 500 }
    );
  }
}
