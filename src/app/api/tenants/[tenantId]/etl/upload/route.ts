import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Papa from 'papaparse';

// POST /api/tenants/[tenantId]/etl/upload - Upload and process CSV
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const supabase = await createClient();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const entityType = formData.get('entity_type') as string;
    const mappings = formData.get('mappings') as string; // JSON string of column mappings

    if (!file || !entityType) {
      return NextResponse.json(
        { error: 'file and entity_type are required' },
        { status: 400 }
      );
    }

    // Create ETL job record
    const { data: etlJob, error: jobError } = await supabase
      .from('etl_jobs')
      .insert({
        tenant_id: tenantId,
        job_type: 'csv_import',
        source_type: 'file_upload',
        status: 'running',
        started_at: new Date().toISOString(),
        config: {
          entity_type: entityType,
          file_name: file.name,
          file_size: file.size,
          mappings: mappings ? JSON.parse(mappings) : null,
        },
      })
      .select()
      .single();

    if (jobError) throw jobError;

    // Parse CSV
    const csvText = await file.text();
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
    });

    if (parsed.errors.length > 0) {
      await supabase
        .from('etl_jobs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: `CSV parsing errors: ${parsed.errors.map((e) => e.message).join(', ')}`,
        })
        .eq('id', etlJob.id);

      return NextResponse.json(
        { error: 'CSV parsing failed', details: parsed.errors },
        { status: 400 }
      );
    }

    const columnMappings = mappings ? JSON.parse(mappings) : {};
    const rows = parsed.data as Record<string, string>[];
    let recordsProcessed = 0;
    let recordsFailed = 0;
    const errors: string[] = [];

    // Process based on entity type
    switch (entityType) {
      case 'cases':
        for (const row of rows) {
          try {
            // Create person first
            const { data: person, error: personError } = await supabase
              .from('persons')
              .insert({
                tenant_id: tenantId,
                first_name: row[columnMappings.first_name || 'first_name'] || 'Unknown',
                last_name: row[columnMappings.last_name || 'last_name'] || 'Unknown',
                age_years: row[columnMappings.age || 'age'] ? parseInt(row[columnMappings.age || 'age']) : null,
                sex: row[columnMappings.sex || 'sex'] || null,
                phone: row[columnMappings.phone || 'phone'] || null,
                address: row[columnMappings.address || 'address'] || null,
              })
              .select('id')
              .single();

            if (personError) throw personError;

            // Get disease ID if disease name provided
            let diseaseId = row[columnMappings.disease_id || 'disease_id'];
            if (!diseaseId && row[columnMappings.disease || 'disease']) {
              const { data: disease } = await supabase
                .from('diseases')
                .select('id')
                .ilike('name', row[columnMappings.disease || 'disease'])
                .single();
              diseaseId = disease?.id;
            }

            // Get admin unit ID if location name provided
            let adminUnitId = row[columnMappings.admin_unit_id || 'admin_unit_id'];
            if (!adminUnitId && row[columnMappings.location || 'location']) {
              const { data: adminUnit } = await supabase
                .from('admin_units')
                .select('id')
                .eq('tenant_id', tenantId)
                .ilike('name', `%${row[columnMappings.location || 'location']}%`)
                .limit(1)
                .single();
              adminUnitId = adminUnit?.id;
            }

            // Create case
            const timestamp = Date.now().toString(36).toUpperCase();
            const random = Math.random().toString(36).substring(2, 6).toUpperCase();
            const externalId = `CASE-${timestamp}-${random}`;

            await supabase.from('cases').insert({
              tenant_id: tenantId,
              external_id: externalId,
              person_id: person.id,
              disease_id: diseaseId,
              admin_unit_id: adminUnitId,
              classification: row[columnMappings.classification || 'classification'] || 'suspected',
              outcome: row[columnMappings.outcome || 'outcome'] || 'unknown',
              hospitalized: row[columnMappings.hospitalized || 'hospitalized']?.toLowerCase() === 'true',
              report_date: row[columnMappings.report_date || 'report_date'] || new Date().toISOString().split('T')[0],
              onset_date: row[columnMappings.onset_date || 'onset_date'] || null,
            });

            recordsProcessed++;
          } catch (err: any) {
            recordsFailed++;
            errors.push(`Row ${recordsProcessed + recordsFailed}: ${err.message}`);
          }
        }
        break;

      case 'contacts':
        for (const row of rows) {
          try {
            // Create person first
            const { data: person, error: personError } = await supabase
              .from('persons')
              .insert({
                tenant_id: tenantId,
                first_name: row[columnMappings.first_name || 'first_name'] || 'Unknown',
                last_name: row[columnMappings.last_name || 'last_name'] || 'Unknown',
                age_years: row[columnMappings.age || 'age'] ? parseInt(row[columnMappings.age || 'age']) : null,
                sex: row[columnMappings.sex || 'sex'] || null,
                phone: row[columnMappings.phone || 'phone'] || null,
              })
              .select('id')
              .single();

            if (personError) throw personError;

            // Get case ID if external_id provided
            let caseId = row[columnMappings.case_id || 'case_id'];
            if (!caseId && row[columnMappings.source_case || 'source_case']) {
              const { data: sourceCase } = await supabase
                .from('cases')
                .select('id')
                .eq('tenant_id', tenantId)
                .eq('external_id', row[columnMappings.source_case || 'source_case'])
                .single();
              caseId = sourceCase?.id;
            }

            // Get admin unit ID
            let adminUnitId = row[columnMappings.admin_unit_id || 'admin_unit_id'];
            if (!adminUnitId && row[columnMappings.location || 'location']) {
              const { data: adminUnit } = await supabase
                .from('admin_units')
                .select('id')
                .eq('tenant_id', tenantId)
                .ilike('name', `%${row[columnMappings.location || 'location']}%`)
                .limit(1)
                .single();
              adminUnitId = adminUnit?.id;
            }

            const contactDate = row[columnMappings.contact_date || 'contact_date'] || new Date().toISOString().split('T')[0];
            const followUpUntil = new Date(contactDate);
            followUpUntil.setDate(followUpUntil.getDate() + 21);

            await supabase.from('contacts').insert({
              tenant_id: tenantId,
              person_id: person.id,
              case_id: caseId,
              admin_unit_id: adminUnitId,
              contact_date: contactDate,
              contact_type: row[columnMappings.contact_type || 'contact_type'] || 'other',
              relationship_to_case: row[columnMappings.relationship || 'relationship'] || null,
              risk_level: row[columnMappings.risk_level || 'risk_level'] || 'medium',
              follow_up_status: 'under_follow_up',
              follow_up_until: followUpUntil.toISOString().split('T')[0],
            });

            recordsProcessed++;
          } catch (err: any) {
            recordsFailed++;
            errors.push(`Row ${recordsProcessed + recordsFailed}: ${err.message}`);
          }
        }
        break;

      case 'events':
        for (const row of rows) {
          try {
            // Get disease ID
            let diseaseId = row[columnMappings.disease_id || 'disease_id'];
            if (!diseaseId && row[columnMappings.disease || 'disease']) {
              const { data: disease } = await supabase
                .from('diseases')
                .select('id')
                .ilike('name', row[columnMappings.disease || 'disease'])
                .single();
              diseaseId = disease?.id;
            }

            // Get admin unit ID
            let adminUnitId = row[columnMappings.admin_unit_id || 'admin_unit_id'];
            if (!adminUnitId && row[columnMappings.location || 'location']) {
              const { data: adminUnit } = await supabase
                .from('admin_units')
                .select('id')
                .eq('tenant_id', tenantId)
                .ilike('name', `%${row[columnMappings.location || 'location']}%`)
                .limit(1)
                .single();
              adminUnitId = adminUnit?.id;
            }

            await supabase.from('events').insert({
              tenant_id: tenantId,
              name: row[columnMappings.name || 'name'] || 'Imported Event',
              event_type: row[columnMappings.event_type || 'event_type'] || 'outbreak',
              status: row[columnMappings.status || 'status'] || 'under_investigation',
              disease_id: diseaseId,
              admin_unit_id: adminUnitId,
              start_date: row[columnMappings.start_date || 'start_date'] || new Date().toISOString().split('T')[0],
              end_date: row[columnMappings.end_date || 'end_date'] || null,
              total_cases: row[columnMappings.total_cases || 'total_cases'] ? parseInt(row[columnMappings.total_cases || 'total_cases']) : 0,
              total_deaths: row[columnMappings.total_deaths || 'total_deaths'] ? parseInt(row[columnMappings.total_deaths || 'total_deaths']) : 0,
              description: row[columnMappings.description || 'description'] || null,
            });

            recordsProcessed++;
          } catch (err: any) {
            recordsFailed++;
            errors.push(`Row ${recordsProcessed + recordsFailed}: ${err.message}`);
          }
        }
        break;

      default:
        await supabase
          .from('etl_jobs')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: `Unsupported entity type: ${entityType}`,
          })
          .eq('id', etlJob.id);

        return NextResponse.json({ error: 'Unsupported entity type' }, { status: 400 });
    }

    // Update ETL job with results
    await supabase
      .from('etl_jobs')
      .update({
        status: recordsFailed === rows.length ? 'failed' : recordsFailed > 0 ? 'completed_with_errors' : 'completed',
        completed_at: new Date().toISOString(),
        records_processed: recordsProcessed,
        records_failed: recordsFailed,
        error_message: errors.length > 0 ? errors.slice(0, 10).join('\n') : null,
      })
      .eq('id', etlJob.id);

    return NextResponse.json({
      job_id: etlJob.id,
      status: recordsFailed === rows.length ? 'failed' : recordsFailed > 0 ? 'completed_with_errors' : 'completed',
      records_processed: recordsProcessed,
      records_failed: recordsFailed,
      total_rows: rows.length,
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    console.error('Error processing ETL upload:', error);
    return NextResponse.json({ error: 'Failed to process upload' }, { status: 500 });
  }
}
