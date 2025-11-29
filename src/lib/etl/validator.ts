import { isValid, parse } from 'date-fns';
import type { ValidationRule, ETLError } from './types';

export interface ValidationResult {
  isValid: boolean;
  errors: ETLError[];
}

// Validate a single value against a rule
function validateValue(
  value: unknown,
  rule: ValidationRule,
  rowIndex: number
): ETLError | null {
  const strValue = value === null || value === undefined ? '' : String(value).trim();

  switch (rule.rule) {
    case 'required':
      if (strValue === '') {
        return {
          row: rowIndex,
          field: rule.field,
          value,
          errorType: 'missing_required',
          message: rule.errorMessage || `${rule.field} is required`,
        };
      }
      break;

    case 'email':
      if (strValue !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strValue)) {
        return {
          row: rowIndex,
          field: rule.field,
          value,
          errorType: 'validation',
          message: rule.errorMessage || `${rule.field} must be a valid email`,
        };
      }
      break;

    case 'date': {
      if (strValue === '') break;

      const formats = (rule.config?.formats as string[]) || [
        'yyyy-MM-dd',
        'dd/MM/yyyy',
        'MM/dd/yyyy',
      ];

      let validDate = false;
      for (const fmt of formats) {
        const parsed = parse(strValue, fmt, new Date());
        if (isValid(parsed)) {
          validDate = true;
          break;
        }
      }

      // Try native parsing
      if (!validDate) {
        const nativeDate = new Date(strValue);
        validDate = isValid(nativeDate);
      }

      if (!validDate) {
        return {
          row: rowIndex,
          field: rule.field,
          value,
          errorType: 'validation',
          message: rule.errorMessage || `${rule.field} must be a valid date`,
        };
      }
      break;
    }

    case 'number': {
      if (strValue === '') break;

      const num = parseFloat(strValue.replace(/,/g, ''));
      if (isNaN(num)) {
        return {
          row: rowIndex,
          field: rule.field,
          value,
          errorType: 'validation',
          message: rule.errorMessage || `${rule.field} must be a valid number`,
        };
      }
      break;
    }

    case 'regex': {
      if (strValue === '') break;

      const pattern = rule.config?.pattern as string;
      if (pattern && !new RegExp(pattern).test(strValue)) {
        return {
          row: rowIndex,
          field: rule.field,
          value,
          errorType: 'validation',
          message: rule.errorMessage || `${rule.field} format is invalid`,
        };
      }
      break;
    }

    case 'range': {
      if (strValue === '') break;

      const num = parseFloat(strValue);
      const min = rule.config?.min as number | undefined;
      const max = rule.config?.max as number | undefined;

      if (min !== undefined && num < min) {
        return {
          row: rowIndex,
          field: rule.field,
          value,
          errorType: 'validation',
          message: rule.errorMessage || `${rule.field} must be at least ${min}`,
        };
      }

      if (max !== undefined && num > max) {
        return {
          row: rowIndex,
          field: rule.field,
          value,
          errorType: 'validation',
          message: rule.errorMessage || `${rule.field} must be at most ${max}`,
        };
      }
      break;
    }

    case 'enum': {
      if (strValue === '') break;

      const allowedValues = rule.config?.values as string[];
      if (allowedValues && !allowedValues.includes(strValue.toLowerCase())) {
        return {
          row: rowIndex,
          field: rule.field,
          value,
          errorType: 'validation',
          message:
            rule.errorMessage ||
            `${rule.field} must be one of: ${allowedValues.join(', ')}`,
        };
      }
      break;
    }
  }

  return null;
}

// Validate a single row against all rules
export function validateRow(
  row: Record<string, unknown>,
  rules: ValidationRule[],
  rowIndex: number
): ValidationResult {
  const errors: ETLError[] = [];

  for (const rule of rules) {
    const value = row[rule.field];
    const error = validateValue(value, rule, rowIndex);
    if (error) {
      errors.push(error);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Validate entire dataset
export function validateDataset(
  rows: Record<string, unknown>[],
  rules: ValidationRule[]
): ValidationResult {
  const allErrors: ETLError[] = [];

  rows.forEach((row, index) => {
    const result = validateRow(row, rules, index + 1); // 1-indexed for user-friendly messages
    allErrors.push(...result.errors);
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}

// Standard validation rules for Cases
export function getCaseValidationRules(): ValidationRule[] {
  return [
    {
      field: 'disease',
      rule: 'required',
      errorMessage: 'Disease is required',
    },
    {
      field: 'report_date',
      rule: 'required',
      errorMessage: 'Report date is required',
    },
    {
      field: 'report_date',
      rule: 'date',
      errorMessage: 'Report date must be a valid date',
    },
    {
      field: 'onset_date',
      rule: 'date',
      errorMessage: 'Onset date must be a valid date',
    },
    {
      field: 'classification',
      rule: 'enum',
      config: { values: ['suspect', 'probable', 'confirmed', 'not_a_case'] },
      errorMessage: 'Classification must be suspect, probable, confirmed, or not_a_case',
    },
    {
      field: 'admin_unit_code',
      rule: 'required',
      errorMessage: 'Administrative unit code is required',
    },
    {
      field: 'person.sex',
      rule: 'enum',
      config: { values: ['male', 'female', 'other', 'unknown', 'm', 'f'] },
      errorMessage: 'Sex must be male, female, other, or unknown',
    },
    {
      field: 'person.age_years',
      rule: 'range',
      config: { min: 0, max: 150 },
      errorMessage: 'Age must be between 0 and 150',
    },
  ];
}

// Standard validation rules for Contacts
export function getContactValidationRules(): ValidationRule[] {
  return [
    {
      field: 'case_external_id',
      rule: 'required',
      errorMessage: 'Case reference is required',
    },
    {
      field: 'contact_date',
      rule: 'required',
      errorMessage: 'Contact date is required',
    },
    {
      field: 'contact_date',
      rule: 'date',
      errorMessage: 'Contact date must be a valid date',
    },
    {
      field: 'admin_unit_code',
      rule: 'required',
      errorMessage: 'Administrative unit code is required',
    },
    {
      field: 'risk_level',
      rule: 'enum',
      config: { values: ['low', 'medium', 'high'] },
      errorMessage: 'Risk level must be low, medium, or high',
    },
  ];
}
