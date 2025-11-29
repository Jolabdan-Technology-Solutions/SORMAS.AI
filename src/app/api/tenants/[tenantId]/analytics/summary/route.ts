import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/tenants/[tenantId]/analytics/summary - Get dashboard summary stats
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

    // Get date range from query params
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date') || getDefaultStartDate();
    const endDate = searchParams.get('end_date') || new Date().toISOString().split('T')[0];

    // Total cases
    const { count: totalCases } = await supabase
      .from('cases')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    // Cases in date range
    const { count: periodCases } = await supabase
      .from('cases')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .gte('report_date', startDate)
      .lte('report_date', endDate);

    // Cases by classification
    const { data: classificationCounts } = await supabase
      .from('cases')
      .select('classification')
      .eq('tenant_id', tenantId)
      .gte('report_date', startDate)
      .lte('report_date', endDate);

    const byClassification = classificationCounts?.reduce(
      (acc, row) => {
        acc[row.classification] = (acc[row.classification] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ) || {};

    // Cases by outcome
    const { data: outcomeCounts } = await supabase
      .from('cases')
      .select('outcome')
      .eq('tenant_id', tenantId)
      .gte('report_date', startDate)
      .lte('report_date', endDate);

    const byOutcome = outcomeCounts?.reduce(
      (acc, row) => {
        const outcome = row.outcome || 'unknown';
        acc[outcome] = (acc[outcome] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ) || {};

    // Active contacts
    const { count: activeContacts } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('follow_up_status', 'under_follow_up');

    // Active events/outbreaks
    const { count: activeEvents } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'ongoing');

    // Cases by disease
    const { data: diseaseCases } = await supabase
      .from('cases')
      .select(
        `
        disease:diseases(name),
        classification
      `
      )
      .eq('tenant_id', tenantId)
      .gte('report_date', startDate)
      .lte('report_date', endDate);

    const byDisease = diseaseCases?.reduce(
      (acc, row) => {
        const disease = row.disease as unknown as { name: string } | null;
        const diseaseName = disease?.name || 'Unknown';
        if (!acc[diseaseName]) {
          acc[diseaseName] = { total: 0, confirmed: 0 };
        }
        acc[diseaseName].total++;
        if (row.classification === 'confirmed') {
          acc[diseaseName].confirmed++;
        }
        return acc;
      },
      {} as Record<string, { total: number; confirmed: number }>
    ) || {};

    // Weekly trend (last 8 weeks)
    const { data: weeklyTrend } = await supabase
      .from('cases')
      .select('epidemiological_week, epidemiological_year')
      .eq('tenant_id', tenantId)
      .gte('report_date', getWeeksAgo(8))
      .order('epidemiological_year', { ascending: true })
      .order('epidemiological_week', { ascending: true });

    const weeklyData = weeklyTrend?.reduce(
      (acc, row) => {
        const key = `${row.epidemiological_year}-W${row.epidemiological_week}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ) || {};

    // Unacknowledged alerts
    const { count: pendingAlerts } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('is_acknowledged', false);

    return NextResponse.json({
      summary: {
        totalCases: totalCases || 0,
        periodCases: periodCases || 0,
        activeContacts: activeContacts || 0,
        activeEvents: activeEvents || 0,
        pendingAlerts: pendingAlerts || 0,
      },
      byClassification,
      byOutcome,
      byDisease,
      weeklyTrend: weeklyData,
      period: {
        startDate,
        endDate,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

function getDefaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30); // Last 30 days
  return date.toISOString().split('T')[0];
}

function getWeeksAgo(weeks: number): string {
  const date = new Date();
  date.setDate(date.getDate() - weeks * 7);
  return date.toISOString().split('T')[0];
}
