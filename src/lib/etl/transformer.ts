import { parse, isValid, format } from 'date-fns';
import type { FieldMapping, TransformationConfig, TransformFunction } from './types';

// Transform a single value based on the transform function
export function transformValue(
  value: unknown,
  transformFn: TransformFunction,
  config?: Record<string, unknown>
): unknown {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const strValue = String(value).trim();

  switch (transformFn) {
    case 'uppercase':
      return strValue.toUpperCase();

    case 'lowercase':
      return strValue.toLowerCase();

    case 'trim':
      return strValue;

    case 'date_parse': {
      const formats = (config?.formats as string[]) || [
        'yyyy-MM-dd',
        'dd/MM/yyyy',
        'MM/dd/yyyy',
        'dd-MM-yyyy',
        'yyyy/MM/dd',
      ];

      for (const fmt of formats) {
        const parsed = parse(strValue, fmt, new Date());
        if (isValid(parsed)) {
          return format(parsed, 'yyyy-MM-dd');
        }
      }

      // Try native Date parsing as fallback
      const nativeDate = new Date(strValue);
      if (isValid(nativeDate)) {
        return format(nativeDate, 'yyyy-MM-dd');
      }

      return null;
    }

    case 'number_parse': {
      const num = parseFloat(strValue.replace(/,/g, ''));
      return isNaN(num) ? null : num;
    }

    case 'boolean_parse': {
      const trueValues = ['true', 'yes', '1', 'y', 'oui', 'si'];
      const falseValues = ['false', 'no', '0', 'n', 'non'];
      const lower = strValue.toLowerCase();

      if (trueValues.includes(lower)) return true;
      if (falseValues.includes(lower)) return false;
      return null;
    }

    case 'lookup': {
      const lookupTable = config?.lookupTable as Record<string, string>;
      const caseSensitive = config?.caseSensitive as boolean;

      if (!lookupTable) return strValue;

      const key = caseSensitive ? strValue : strValue.toLowerCase();
      const lookupKeys = caseSensitive
        ? Object.keys(lookupTable)
        : Object.keys(lookupTable).map((k) => k.toLowerCase());

      const index = lookupKeys.indexOf(key);
      return index >= 0 ? Object.values(lookupTable)[index] : strValue;
    }

    case 'concat': {
      // This is handled at the row level, not single value
      return strValue;
    }

    case 'split': {
      const delimiter = (config?.delimiter as string) || ',';
      const index = (config?.index as number) || 0;
      const parts = strValue.split(delimiter);
      return parts[index]?.trim() || null;
    }

    case 'custom': {
      // Custom transformation would be defined per-tenant
      return strValue;
    }

    default:
      return strValue;
  }
}

// Apply field mappings to a single row
export function applyMappings(
  row: Record<string, unknown>,
  mappings: FieldMapping[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const mapping of mappings) {
    let value = row[mapping.sourceField];

    // Apply transformation if specified
    if (mapping.transformFunction) {
      value = transformValue(value, mapping.transformFunction);
    }

    // Apply default value if null and default exists
    if ((value === null || value === undefined || value === '') && mapping.defaultValue !== undefined) {
      value = mapping.defaultValue;
    }

    // Handle nested fields (e.g., "person.first_name")
    if (mapping.targetField.includes('.')) {
      const parts = mapping.targetField.split('.');
      let current = result;

      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]] as Record<string, unknown>;
      }

      current[parts[parts.length - 1]] = value;
    } else {
      result[mapping.targetField] = value;
    }
  }

  return result;
}

// Apply complex transformations that work across multiple fields
export function applyTransformations(
  row: Record<string, unknown>,
  transformations: TransformationConfig[]
): Record<string, unknown> {
  const result = { ...row };

  for (const transform of transformations) {
    switch (transform.type) {
      case 'concat': {
        const delimiter = (transform.config?.delimiter as string) || ' ';
        const values = transform.sourceFields
          .map((field) => row[field])
          .filter((v) => v !== null && v !== undefined && v !== '')
          .map(String);
        result[transform.targetField] = values.join(delimiter);
        break;
      }

      case 'lookup': {
        const lookupTable = transform.config?.lookupTable as Record<string, string>;
        const sourceValue = String(row[transform.sourceFields[0]] || '').toLowerCase();
        result[transform.targetField] = lookupTable?.[sourceValue] || sourceValue;
        break;
      }

      // Add more complex transformation types as needed
    }
  }

  return result;
}

// Calculate epidemiological week from a date
export function calculateEpiWeek(dateStr: string): { week: number; year: number } {
  const date = new Date(dateStr);
  if (!isValid(date)) {
    return { week: 0, year: 0 };
  }

  // ISO week calculation
  const jan1 = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - jan1.getTime()) / 86400000) + 1;
  const week = Math.ceil((dayOfYear + jan1.getDay()) / 7);

  return {
    week,
    year: date.getFullYear(),
  };
}

// Standardize sex values
export function standardizeSex(value: string): 'male' | 'female' | 'other' | 'unknown' {
  const lower = value.toLowerCase().trim();

  if (['m', 'male', 'man', 'boy', 'homme', 'masculin'].includes(lower)) {
    return 'male';
  }

  if (['f', 'female', 'woman', 'girl', 'femme', 'feminin'].includes(lower)) {
    return 'female';
  }

  if (['o', 'other', 'autre'].includes(lower)) {
    return 'other';
  }

  return 'unknown';
}

// Standardize case classification
export function standardizeClassification(
  value: string
): 'suspect' | 'probable' | 'confirmed' | 'not_a_case' {
  const lower = value.toLowerCase().trim();

  if (['confirmed', 'confirmé', 'positive', 'pos', 'lab confirmed'].includes(lower)) {
    return 'confirmed';
  }

  if (['probable', 'likely'].includes(lower)) {
    return 'probable';
  }

  if (['suspect', 'suspected', 'suspecté', 'suspecte'].includes(lower)) {
    return 'suspect';
  }

  if (['not a case', 'negative', 'neg', 'discarded', 'ruled out'].includes(lower)) {
    return 'not_a_case';
  }

  return 'suspect';
}

// Standardize outcome
export function standardizeOutcome(
  value: string
): 'recovered' | 'deceased' | 'unknown' | 'ongoing' {
  const lower = value.toLowerCase().trim();

  if (['recovered', 'cured', 'discharged', 'guéri', 'alive'].includes(lower)) {
    return 'recovered';
  }

  if (['deceased', 'dead', 'died', 'death', 'décédé', 'mort'].includes(lower)) {
    return 'deceased';
  }

  if (['ongoing', 'active', 'hospitalized', 'in treatment', 'en cours'].includes(lower)) {
    return 'ongoing';
  }

  return 'unknown';
}
