import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { aiService } from '@/lib/services/ai-service';

// GET /api/tenants/[tenantId]/predictions - Get predictions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const diseaseId = searchParams.get('disease_id');
    const adminUnitId = searchParams.get('admin_unit_id');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = supabase
      .from('predictions')
      .select(`
        *,
        disease:diseases(id, name),
        admin_unit:admin_units(id, name)
      `)
      .eq('tenant_id', tenantId)
      .order('prediction_date', { ascending: false })
      .limit(limit);

    if (diseaseId) query = query.eq('disease_id', diseaseId);
    if (adminUnitId) query = query.eq('admin_unit_id', adminUnitId);

    const { data: predictions, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      predictions,
      aiConfigured: aiService.isConfigured(),
      provider: aiService.getProviderName(),
    });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return NextResponse.json({ error: 'Failed to fetch predictions' }, { status: 500 });
  }
}

// POST /api/tenants/[tenantId]/predictions - Generate new prediction
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { disease_id, admin_unit_id, days = 30 } = body;

    if (!disease_id) {
      return NextResponse.json({ error: 'disease_id is required' }, { status: 400 });
    }

    // Get historical data
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let casesQuery = supabase
      .from('cases')
      .select('report_date, outcome')
      .eq('tenant_id', tenantId)
      .eq('disease_id', disease_id)
      .gte('report_date', startDate)
      .order('report_date', { ascending: true });

    if (admin_unit_id) {
      casesQuery = casesQuery.eq('admin_unit_id', admin_unit_id);
    }

    const { data: cases, error: casesError } = await casesQuery;

    if (casesError) throw casesError;

    // Aggregate by date
    const dateAggregated: Record<string, { cases: number; deaths: number }> = {};
    (cases || []).forEach((c: any) => {
      const date = c.report_date;
      if (!dateAggregated[date]) {
        dateAggregated[date] = { cases: 0, deaths: 0 };
      }
      dateAggregated[date].cases++;
      if (c.outcome === 'deceased') {
        dateAggregated[date].deaths++;
      }
    });

    const historicalData = Object.entries(dateAggregated).map(([date, data]) => ({
      date,
      cases: data.cases,
      deaths: data.deaths,
    }));

    if (historicalData.length < 3) {
      return NextResponse.json(
        { error: 'Insufficient historical data for prediction (minimum 3 data points required)' },
        { status: 400 }
      );
    }

    // Get context data
    let population: number | undefined;
    if (admin_unit_id) {
      const { data: adminUnit } = await supabase
        .from('admin_units')
        .select('population')
        .eq('id', admin_unit_id)
        .single();
      population = adminUnit?.population;
    }

    // Generate prediction
    const prediction = await aiService.generatePrediction({
      tenantId,
      diseaseId: disease_id,
      adminUnitId: admin_unit_id,
      historicalData,
      contextData: { population },
    });

    // Store prediction
    const { data: storedPrediction, error: insertError } = await supabase
      .from('predictions')
      .insert({
        tenant_id: tenantId,
        disease_id,
        admin_unit_id,
        model_name: aiService.getProviderName(),
        model_version: '1.0',
        prediction_date: new Date().toISOString().split('T')[0],
        prediction_horizon_days: 7,
        predicted_cases: prediction.predictedCases,
        confidence_lower: prediction.confidenceLower,
        confidence_upper: prediction.confidenceUpper,
        confidence_level: 0.95,
        risk_level: prediction.riskLevel,
        risk_score: prediction.riskScore,
        factors: prediction.factors,
      })
      .select(`
        *,
        disease:diseases(id, name),
        admin_unit:admin_units(id, name)
      `)
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      prediction: storedPrediction,
      analysis: {
        explanation: prediction.explanation,
        recommendations: prediction.recommendations,
      },
      aiConfigured: aiService.isConfigured(),
      provider: aiService.getProviderName(),
    }, { status: 201 });
  } catch (error) {
    console.error('Error generating prediction:', error);
    return NextResponse.json({ error: 'Failed to generate prediction' }, { status: 500 });
  }
}

// POST /api/tenants/[tenantId]/predictions/batch - Generate batch predictions
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;

    // Generate predictions for all diseases with recent activity
    await aiService.generateBatchPredictions(tenantId);

    return NextResponse.json({ message: 'Batch predictions generated successfully' });
  } catch (error) {
    console.error('Error generating batch predictions:', error);
    return NextResponse.json({ error: 'Failed to generate batch predictions' }, { status: 500 });
  }
}
