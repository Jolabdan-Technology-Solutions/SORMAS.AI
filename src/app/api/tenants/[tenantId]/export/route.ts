import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/tenants/[tenantId]/export - Export data
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const {
      entity_type, // cases, contacts, events, samples
      format = 'csv', // csv, json
      filters = {},
    } = body;

    if (!entity_type) {
      return NextResponse.json({ error: 'entity_type is required' }, { status: 400 });
    }

    let data: any[] = [];
    const { startDate, endDate, diseaseId, adminUnitId } = filters;

    switch (entity_type) {
      case 'cases': {
        let query = supabase
          .from('cases')
          .select(`
            external_id,
            classification,
            outcome,
            hospitalized,
            icu_admission,
            report_date,
            onset_date,
            outcome_date,
            person:persons(first_name, last_name, age_years, sex, phone, address),
            disease:diseases(name),
            admin_unit:admin_units(name, code)
          `)
          .eq('tenant_id', tenantId);

        if (startDate) query = query.gte('report_date', startDate);
        if (endDate) query = query.lte('report_date', endDate);
        if (diseaseId) query = query.eq('disease_id', diseaseId);
        if (adminUnitId) query = query.eq('admin_unit_id', adminUnitId);

        const { data: cases, error } = await query;
        if (error) throw error;

        data = (cases || []).map((c: any) => ({
          case_id: c.external_id,
          disease: c.disease?.name,
          classification: c.classification,
          outcome: c.outcome,
          hospitalized: c.hospitalized,
          icu_admission: c.icu_admission,
          report_date: c.report_date,
          onset_date: c.onset_date,
          outcome_date: c.outcome_date,
          first_name: c.person?.first_name,
          last_name: c.person?.last_name,
          age: c.person?.age_years,
          sex: c.person?.sex,
          phone: c.person?.phone,
          address: c.person?.address,
          location: c.admin_unit?.name,
          location_code: c.admin_unit?.code,
        }));
        break;
      }

      case 'contacts': {
        let query = supabase
          .from('contacts')
          .select(`
            contact_date,
            contact_type,
            relationship_to_case,
            risk_level,
            follow_up_status,
            follow_up_until,
            person:persons(first_name, last_name, age_years, sex, phone, address),
            case:cases(external_id, disease:diseases(name)),
            admin_unit:admin_units(name, code)
          `)
          .eq('tenant_id', tenantId);

        if (startDate) query = query.gte('contact_date', startDate);
        if (endDate) query = query.lte('contact_date', endDate);

        const { data: contacts, error } = await query;
        if (error) throw error;

        data = (contacts || []).map((c: any) => ({
          contact_date: c.contact_date,
          contact_type: c.contact_type,
          relationship_to_case: c.relationship_to_case,
          risk_level: c.risk_level,
          follow_up_status: c.follow_up_status,
          follow_up_until: c.follow_up_until,
          first_name: c.person?.first_name,
          last_name: c.person?.last_name,
          age: c.person?.age_years,
          sex: c.person?.sex,
          phone: c.person?.phone,
          address: c.person?.address,
          source_case_id: c.case?.external_id,
          disease: c.case?.disease?.name,
          location: c.admin_unit?.name,
          location_code: c.admin_unit?.code,
        }));
        break;
      }

      case 'events': {
        let query = supabase
          .from('events')
          .select(`
            name,
            event_type,
            status,
            start_date,
            end_date,
            total_cases,
            total_deaths,
            description,
            disease:diseases(name),
            admin_unit:admin_units(name, code)
          `)
          .eq('tenant_id', tenantId);

        if (startDate) query = query.gte('start_date', startDate);
        if (endDate) query = query.lte('start_date', endDate);
        if (diseaseId) query = query.eq('disease_id', diseaseId);
        if (adminUnitId) query = query.eq('admin_unit_id', adminUnitId);

        const { data: events, error } = await query;
        if (error) throw error;

        data = (events || []).map((e: any) => ({
          name: e.name,
          event_type: e.event_type,
          status: e.status,
          disease: e.disease?.name,
          start_date: e.start_date,
          end_date: e.end_date,
          total_cases: e.total_cases,
          total_deaths: e.total_deaths,
          description: e.description,
          location: e.admin_unit?.name,
          location_code: e.admin_unit?.code,
        }));
        break;
      }

      case 'samples': {
        let query = supabase
          .from('samples')
          .select(`
            sample_id,
            sample_type,
            collection_date,
            shipped_date,
            received_date,
            test_type,
            test_result,
            result_date,
            ct_value,
            pathogen_detected,
            case:cases(external_id, disease:diseases(name)),
            lab:labs(name)
          `)
          .eq('tenant_id', tenantId);

        if (startDate) query = query.gte('collection_date', startDate);
        if (endDate) query = query.lte('collection_date', endDate);

        const { data: samples, error } = await query;
        if (error) throw error;

        data = (samples || []).map((s: any) => ({
          sample_id: s.sample_id,
          sample_type: s.sample_type,
          collection_date: s.collection_date,
          shipped_date: s.shipped_date,
          received_date: s.received_date,
          test_type: s.test_type,
          test_result: s.test_result,
          result_date: s.result_date,
          ct_value: s.ct_value,
          pathogen_detected: s.pathogen_detected,
          case_id: s.case?.external_id,
          disease: s.case?.disease?.name,
          lab: s.lab?.name,
        }));
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid entity_type' }, { status: 400 });
    }

    if (format === 'json') {
      return NextResponse.json({
        entity_type,
        count: data.length,
        exported_at: new Date().toISOString(),
        data,
      });
    }

    // Generate CSV
    if (data.length === 0) {
      return NextResponse.json({ error: 'No data to export' }, { status: 404 });
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            // Escape quotes and wrap in quotes if contains comma or newline
            if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          })
          .join(',')
      ),
    ];

    const csv = csvRows.join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${entity_type}_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
