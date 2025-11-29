import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/tenants/[tenantId]/samples - List samples
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
    const sampleType = searchParams.get('sample_type');
    const testResult = searchParams.get('test_result');
    const labId = searchParams.get('lab_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;

    let query = supabase
      .from('samples')
      .select(`
        *,
        case:cases(id, external_id, disease:diseases(name)),
        lab:labs(id, name)
      `, { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('collection_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (caseId) query = query.eq('case_id', caseId);
    if (sampleType) query = query.eq('sample_type', sampleType);
    if (testResult) query = query.eq('test_result', testResult);
    if (labId) query = query.eq('lab_id', labId);
    if (startDate) query = query.gte('collection_date', startDate);
    if (endDate) query = query.lte('collection_date', endDate);
    if (search) {
      query = query.or(`sample_id.ilike.%${search}%,lab_sample_id.ilike.%${search}%`);
    }

    const { data: samples, count, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      samples,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching samples:', error);
    return NextResponse.json({ error: 'Failed to fetch samples' }, { status: 500 });
  }
}

// POST /api/tenants/[tenantId]/samples - Create sample
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
      sample_type,
      collection_date,
      collected_by,
      lab_id,
      shipped_date,
      received_date,
      test_type,
      test_result,
      result_date,
      ct_value,
      pathogen_detected,
      notes,
    } = body;

    if (!case_id || !sample_type || !collection_date) {
      return NextResponse.json(
        { error: 'case_id, sample_type, and collection_date are required' },
        { status: 400 }
      );
    }

    // Generate sample ID
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const sampleId = `SMP-${timestamp}-${random}`;

    const { data: newSample, error } = await supabase
      .from('samples')
      .insert({
        tenant_id: tenantId,
        sample_id: sampleId,
        case_id,
        sample_type,
        collection_date,
        collected_by,
        lab_id,
        shipped_date,
        received_date,
        test_type,
        test_result: test_result || 'pending',
        result_date,
        ct_value,
        pathogen_detected,
        notes,
      })
      .select(`
        *,
        case:cases(*, disease:diseases(*)),
        lab:labs(*)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ sample: newSample }, { status: 201 });
  } catch (error) {
    console.error('Error creating sample:', error);
    return NextResponse.json({ error: 'Failed to create sample' }, { status: 500 });
  }
}
