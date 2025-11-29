import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/tenants/[tenantId]/etl/import - Import data from CSV
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
    const { entityType, data, mappings } = body;

    if (!entityType || !data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: 'entityType and data array are required' },
        { status: 400 }
      );
    }

    const results = {
      total: data.length,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [] as { row: number; message: string }[],
    };

    // Create import batch ID
    const batchId = crypto.randomUUID();

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      try {
        if (entityType === 'case') {
          await importCase(supabase, tenantId, row, mappings, batchId);
          results.created++;
        } else if (entityType === 'contact') {
          await importContact(supabase, tenantId, row, mappings, batchId);
          results.created++;
        } else {
          results.errors.push({ row: i + 1, message: `Unknown entity type: ${entityType}` });
          results.failed++;
        }
      } catch (error) {
        results.errors.push({
          row: i + 1,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        results.failed++;
      }
    }

    // Log the import job
    await supabase.from('etl_job_runs').insert({
      tenant_id: tenantId,
      job_id: null, // Manual import, no job
      status: results.failed === 0 ? 'completed' : 'completed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      records_processed: results.total,
      records_created: results.created,
      records_updated: results.updated,
      records_failed: results.failed,
      error_log: results.errors,
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error importing data:', error);
    return NextResponse.json(
      { error: 'Failed to import data' },
      { status: 500 }
    );
  }
}

async function importCase(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tenantId: string,
  row: Record<string, unknown>,
  mappings: Record<string, string>,
  batchId: string
) {
  // Apply mappings
  const mappedData: Record<string, unknown> = {};
  for (const [sourceField, targetField] of Object.entries(mappings)) {
    if (row[sourceField] !== undefined) {
      mappedData[targetField] = row[sourceField];
    }
  }

  // Resolve disease
  let diseaseId = null;
  if (mappedData.disease) {
    const { data: disease } = await supabase
      .from('diseases')
      .select('id')
      .ilike('name', String(mappedData.disease))
      .single();
    diseaseId = disease?.id;
  }

  if (!diseaseId) {
    throw new Error('Disease not found');
  }

  // Resolve admin unit
  let adminUnitId = null;
  if (mappedData.admin_unit_code) {
    const { data: adminUnit } = await supabase
      .from('admin_units')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('code', String(mappedData.admin_unit_code))
      .single();
    adminUnitId = adminUnit?.id;
  }

  if (!adminUnitId) {
    throw new Error('Admin unit not found');
  }

  // Create person if person fields exist
  let personId = null;
  const personFields = ['first_name', 'last_name', 'age_years', 'sex', 'phone'];
  const personData: Record<string, unknown> = { tenant_id: tenantId };
  let hasPersonData = false;

  for (const field of personFields) {
    const key = `person.${field}`;
    if (mappedData[key] !== undefined) {
      personData[field] = mappedData[key];
      hasPersonData = true;
    }
  }

  if (hasPersonData) {
    const { data: person, error } = await supabase
      .from('persons')
      .insert(personData)
      .select('id')
      .single();

    if (error) throw error;
    personId = person.id;
  }

  // Calculate epi week
  const reportDate = mappedData.report_date
    ? new Date(String(mappedData.report_date))
    : new Date();
  const startOfYear = new Date(reportDate.getFullYear(), 0, 1);
  const dayOfYear = Math.floor(
    (reportDate.getTime() - startOfYear.getTime()) / 86400000
  );
  const epiWeek = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);

  // Insert case
  const { error } = await supabase.from('cases').insert({
    tenant_id: tenantId,
    external_id: mappedData.external_id ? String(mappedData.external_id) : null,
    person_id: personId,
    disease_id: diseaseId,
    classification: mappedData.classification || 'suspect',
    outcome: mappedData.outcome || null,
    admin_unit_id: adminUnitId,
    onset_date: mappedData.onset_date || null,
    report_date: reportDate.toISOString().split('T')[0],
    hospitalized: Boolean(mappedData.hospitalized),
    icu_admission: Boolean(mappedData.icu_admission),
    lab_confirmed: Boolean(mappedData.lab_confirmed),
    epidemiological_week: epiWeek,
    epidemiological_year: reportDate.getFullYear(),
    is_imported: true,
    import_batch_id: batchId,
  });

  if (error) throw error;
}

async function importContact(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tenantId: string,
  row: Record<string, unknown>,
  mappings: Record<string, string>,
  batchId: string
) {
  // Apply mappings
  const mappedData: Record<string, unknown> = {};
  for (const [sourceField, targetField] of Object.entries(mappings)) {
    if (row[sourceField] !== undefined) {
      mappedData[targetField] = row[sourceField];
    }
  }

  // Resolve linked case
  let caseId = null;
  if (mappedData.case_external_id) {
    const { data: linkedCase } = await supabase
      .from('cases')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('external_id', String(mappedData.case_external_id))
      .single();
    caseId = linkedCase?.id;
  }

  if (!caseId) {
    throw new Error('Linked case not found');
  }

  // Resolve admin unit
  let adminUnitId = null;
  if (mappedData.admin_unit_code) {
    const { data: adminUnit } = await supabase
      .from('admin_units')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('code', String(mappedData.admin_unit_code))
      .single();
    adminUnitId = adminUnit?.id;
  }

  if (!adminUnitId) {
    throw new Error('Admin unit not found');
  }

  // Create person
  let personId = null;
  const personFields = ['first_name', 'last_name', 'age_years', 'sex', 'phone'];
  const personData: Record<string, unknown> = { tenant_id: tenantId };
  let hasPersonData = false;

  for (const field of personFields) {
    const key = `person.${field}`;
    if (mappedData[key] !== undefined) {
      personData[field] = mappedData[key];
      hasPersonData = true;
    }
  }

  if (hasPersonData) {
    const { data: person, error } = await supabase
      .from('persons')
      .insert(personData)
      .select('id')
      .single();

    if (error) throw error;
    personId = person.id;
  }

  // Insert contact
  const { error } = await supabase.from('contacts').insert({
    tenant_id: tenantId,
    external_id: mappedData.external_id ? String(mappedData.external_id) : null,
    person_id: personId,
    case_id: caseId,
    contact_date: mappedData.contact_date || new Date().toISOString().split('T')[0],
    contact_type: mappedData.contact_type || 'other',
    relationship_to_case: mappedData.relationship_to_case || null,
    risk_level: mappedData.risk_level || 'medium',
    follow_up_status: 'under_follow_up',
    admin_unit_id: adminUnitId,
    is_imported: true,
    import_batch_id: batchId,
  });

  if (error) throw error;
}
