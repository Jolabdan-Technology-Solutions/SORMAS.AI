import { createClient } from '@/lib/supabase/client';
import type {
  ETLConfig,
  ETLResult,
  ETLError,
  ETLWarning,
  FieldMapping,
} from './types';
import { parseCSV } from './csv-parser';
import { applyMappings, applyTransformations, calculateEpiWeek } from './transformer';
import { validateRow } from './validator';

export class ETLPipeline {
  private supabase;
  private tenantId: string;
  private config: ETLConfig;
  private errors: ETLError[] = [];
  private warnings: ETLWarning[] = [];
  private startTime: number = 0;

  constructor(tenantId: string, config: ETLConfig) {
    this.supabase = createClient();
    this.tenantId = tenantId;
    this.config = config;
  }

  // Main entry point for CSV import
  async processCSVFile(file: File): Promise<ETLResult> {
    this.startTime = Date.now();
    this.errors = [];
    this.warnings = [];

    try {
      // Step 1: Parse CSV
      const parseResult = await parseCSV(file);

      if (parseResult.errors.length > 0) {
        parseResult.errors.forEach((error, index) => {
          this.errors.push({
            row: index,
            errorType: 'validation',
            message: error,
          });
        });
      }

      if (parseResult.rows.length === 0) {
        return this.buildResult(0, 0, 0, 0);
      }

      // Step 2: Process each row
      const results = await this.processRows(parseResult.rows);

      return this.buildResult(
        parseResult.totalRows,
        results.processed,
        results.created,
        results.updated
      );
    } catch (error) {
      this.errors.push({
        row: 0,
        errorType: 'validation',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      return this.buildResult(0, 0, 0, 0);
    }
  }

  // Process rows from any source
  async processRows(
    rows: Record<string, unknown>[]
  ): Promise<{ processed: number; created: number; updated: number }> {
    let processed = 0;
    let created = 0;
    let updated = 0;

    for (let i = 0; i < rows.length; i++) {
      const rowIndex = i + 1; // 1-indexed for user display
      const row = rows[i];

      try {
        // Step 1: Apply field mappings
        const mappedData = applyMappings(row, this.config.mappings);

        // Step 2: Apply complex transformations
        const transformedData = applyTransformations(
          mappedData,
          this.config.transformations
        );

        // Step 3: Validate
        const validation = validateRow(
          transformedData,
          this.config.validationRules,
          rowIndex
        );

        if (!validation.isValid) {
          this.errors.push(...validation.errors);
          continue;
        }

        // Step 4: Enrich with calculated fields
        const enrichedData = this.enrichData(transformedData);

        // Step 5: Upsert to database
        const result = await this.upsertRecord(enrichedData, rowIndex);

        processed++;
        if (result.created) created++;
        if (result.updated) updated++;
      } catch (error) {
        this.errors.push({
          row: rowIndex,
          errorType: 'transformation',
          message: error instanceof Error ? error.message : 'Processing error',
        });
      }
    }

    return { processed, created, updated };
  }

  // Add calculated fields
  private enrichData(data: Record<string, unknown>): Record<string, unknown> {
    const enriched: Record<string, unknown> = { ...data, tenant_id: this.tenantId };

    // Calculate epidemiological week if report_date exists
    if (data.report_date && typeof data.report_date === 'string') {
      const epiWeek = calculateEpiWeek(data.report_date);
      enriched.epidemiological_week = epiWeek.week;
      enriched.epidemiological_year = epiWeek.year;
    }

    // Mark as imported
    enriched.is_imported = true;

    return enriched;
  }

  // Upsert record to database
  private async upsertRecord(
    data: Record<string, unknown>,
    rowIndex: number
  ): Promise<{ created: boolean; updated: boolean }> {
    const tableName = this.getTableName();
    const externalId = data.external_id as string | undefined;

    // Check for existing record by external_id
    if (externalId) {
      const { data: existing } = await this.supabase
        .from(tableName)
        .select('id')
        .eq('tenant_id', this.tenantId)
        .eq('external_id', externalId)
        .single();

      if (existing) {
        // Update existing record
        const { error } = await this.supabase
          .from(tableName)
          .update(data)
          .eq('id', existing.id);

        if (error) {
          this.errors.push({
            row: rowIndex,
            errorType: 'validation',
            message: `Database update error: ${error.message}`,
          });
          return { created: false, updated: false };
        }

        return { created: false, updated: true };
      }
    }

    // Handle person data if present
    if (this.config.entityType === 'case' || this.config.entityType === 'contact') {
      const personData = data.person as Record<string, unknown> | undefined;
      if (personData) {
        const personId = await this.upsertPerson(personData, rowIndex);
        if (personId) {
          data.person_id = personId;
        }
        delete data.person;
      }
    }

    // Resolve admin_unit_code to admin_unit_id
    if (data.admin_unit_code) {
      const adminUnitId = await this.resolveAdminUnit(
        data.admin_unit_code as string,
        rowIndex
      );
      if (adminUnitId) {
        data.admin_unit_id = adminUnitId;
      }
      delete data.admin_unit_code;
    }

    // Resolve disease name to disease_id
    if (data.disease && this.config.entityType === 'case') {
      const diseaseId = await this.resolveDisease(
        data.disease as string,
        rowIndex
      );
      if (diseaseId) {
        data.disease_id = diseaseId;
      }
      delete data.disease;
    }

    // Insert new record
    const { error } = await this.supabase.from(tableName).insert(data);

    if (error) {
      this.errors.push({
        row: rowIndex,
        errorType: 'validation',
        message: `Database insert error: ${error.message}`,
      });
      return { created: false, updated: false };
    }

    return { created: true, updated: false };
  }

  // Upsert person record
  private async upsertPerson(
    personData: Record<string, unknown>,
    rowIndex: number
  ): Promise<string | null> {
    const enrichedPerson = {
      ...personData,
      tenant_id: this.tenantId,
    };

    const { data, error } = await this.supabase
      .from('persons')
      .insert(enrichedPerson)
      .select('id')
      .single();

    if (error) {
      this.warnings.push({
        row: rowIndex,
        warningType: 'default_applied',
        message: `Could not create person record: ${error.message}`,
      });
      return null;
    }

    return data.id;
  }

  // Resolve admin unit code to ID
  private async resolveAdminUnit(
    code: string,
    rowIndex: number
  ): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('admin_units')
      .select('id')
      .eq('tenant_id', this.tenantId)
      .eq('code', code)
      .single();

    if (error || !data) {
      this.errors.push({
        row: rowIndex,
        field: 'admin_unit_code',
        value: code,
        errorType: 'reference',
        message: `Administrative unit not found: ${code}`,
      });
      return null;
    }

    return data.id;
  }

  // Resolve disease name to ID
  private async resolveDisease(
    name: string,
    rowIndex: number
  ): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('diseases')
      .select('id')
      .ilike('name', name)
      .single();

    if (error || !data) {
      this.warnings.push({
        row: rowIndex,
        field: 'disease',
        warningType: 'default_applied',
        message: `Disease not found: ${name}. Please check disease configuration.`,
      });
      return null;
    }

    return data.id;
  }

  // Get table name based on entity type
  private getTableName(): string {
    const tableMap = {
      case: 'cases',
      contact: 'contacts',
      event: 'events',
      sample: 'samples',
    };
    return tableMap[this.config.entityType];
  }

  // Build final result object
  private buildResult(
    total: number,
    processed: number,
    created: number,
    updated: number
  ): ETLResult {
    return {
      success: this.errors.length === 0,
      totalRecords: total,
      processedRecords: processed,
      createdRecords: created,
      updatedRecords: updated,
      failedRecords: total - processed,
      errors: this.errors,
      warnings: this.warnings,
      duration: Date.now() - this.startTime,
    };
  }
}

// Helper to create default case mappings
export function createDefaultCaseMappings(
  sourceFields: string[]
): FieldMapping[] {
  const fieldMappingSuggestions: Record<string, string[]> = {
    external_id: ['id', 'case_id', 'caseid', 'external_id', 'ref'],
    disease: ['disease', 'disease_name', 'diagnosis'],
    classification: ['classification', 'case_classification', 'status'],
    outcome: ['outcome', 'case_outcome', 'result'],
    onset_date: ['onset_date', 'onset', 'symptom_onset', 'date_onset'],
    report_date: ['report_date', 'reported_date', 'date_reported', 'notification_date'],
    admin_unit_code: ['lga', 'district', 'region', 'location', 'admin_unit', 'location_code'],
    'person.first_name': ['first_name', 'firstname', 'given_name', 'prenom'],
    'person.last_name': ['last_name', 'lastname', 'surname', 'family_name', 'nom'],
    'person.sex': ['sex', 'gender'],
    'person.age_years': ['age', 'age_years', 'patient_age'],
  };

  const mappings: FieldMapping[] = [];

  for (const [targetField, suggestions] of Object.entries(fieldMappingSuggestions)) {
    const match = sourceFields.find((sf) =>
      suggestions.includes(sf.toLowerCase())
    );

    if (match) {
      mappings.push({
        sourceField: match,
        targetField,
        required: ['disease', 'report_date', 'admin_unit_code'].includes(targetField),
      });
    }
  }

  return mappings;
}
