import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/tenants/[tenantId]/search - Global search across all entities
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type'); // cases, contacts, events, samples, persons, or all
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Search query must be at least 2 characters' }, { status: 400 });
    }

    const searchPattern = `%${query}%`;
    const results: {
      cases: any[];
      contacts: any[];
      events: any[];
      samples: any[];
      persons: any[];
    } = {
      cases: [],
      contacts: [],
      events: [],
      samples: [],
      persons: [],
    };

    // Search cases
    if (!type || type === 'all' || type === 'cases') {
      const { data: cases } = await supabase
        .from('cases')
        .select(`
          id, external_id, classification, outcome,
          person:persons(first_name, last_name),
          disease:diseases(name)
        `)
        .eq('tenant_id', tenantId)
        .or(`external_id.ilike.${searchPattern}`)
        .limit(limit);

      results.cases = cases || [];
    }

    // Search contacts
    if (!type || type === 'all' || type === 'contacts') {
      const { data: contacts } = await supabase
        .from('contacts')
        .select(`
          id, follow_up_status, risk_level,
          person:persons(first_name, last_name),
          case:cases(external_id)
        `)
        .eq('tenant_id', tenantId)
        .limit(limit);

      results.contacts = contacts || [];
    }

    // Search events
    if (!type || type === 'all' || type === 'events') {
      const { data: events } = await supabase
        .from('events')
        .select(`
          id, name, event_type, status,
          disease:diseases(name),
          admin_unit:admin_units(name)
        `)
        .eq('tenant_id', tenantId)
        .or(`name.ilike.${searchPattern},description.ilike.${searchPattern}`)
        .limit(limit);

      results.events = events || [];
    }

    // Search samples
    if (!type || type === 'all' || type === 'samples') {
      const { data: samples } = await supabase
        .from('samples')
        .select(`
          id, sample_id, sample_type, test_result,
          case:cases(external_id)
        `)
        .eq('tenant_id', tenantId)
        .or(`sample_id.ilike.${searchPattern},lab_sample_id.ilike.${searchPattern}`)
        .limit(limit);

      results.samples = samples || [];
    }

    // Search persons
    if (!type || type === 'all' || type === 'persons') {
      const { data: persons } = await supabase
        .from('persons')
        .select(`
          id, first_name, last_name, phone, national_id
        `)
        .eq('tenant_id', tenantId)
        .or(`first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},phone.ilike.${searchPattern},national_id.ilike.${searchPattern}`)
        .limit(limit);

      results.persons = persons || [];
    }

    // Calculate total results
    const totalResults =
      results.cases.length +
      results.contacts.length +
      results.events.length +
      results.samples.length +
      results.persons.length;

    return NextResponse.json({
      query,
      totalResults,
      results,
    });
  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
