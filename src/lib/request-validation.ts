/**
 * Request Validation Utilities
 * Manual validation for API endpoints to prevent injection attacks and invalid data
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates a string field
 */
export function validateString(
  value: any,
  fieldName: string,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    patternMessage?: string;
  } = {}
): ValidationError | null {
  const {
    required = false,
    minLength = 0,
    maxLength = 10000,
    pattern,
    patternMessage,
  } = options;

  // Check if value exists
  if (value === undefined || value === null || value === '') {
    if (required) {
      return { field: fieldName, message: `${fieldName} is required` };
    }
    return null; // Optional field, no value provided
  }

  // Check type
  if (typeof value !== 'string') {
    return { field: fieldName, message: `${fieldName} must be a string` };
  }

  // Check length
  if (value.length < minLength) {
    return { field: fieldName, message: `${fieldName} must be at least ${minLength} characters` };
  }

  if (value.length > maxLength) {
    return { field: fieldName, message: `${fieldName} must be less than ${maxLength} characters` };
  }

  // Check pattern
  if (pattern && !pattern.test(value)) {
    return {
      field: fieldName,
      message: patternMessage || `${fieldName} has invalid format`,
    };
  }

  return null;
}

/**
 * Validates an email address
 */
export function validateEmail(value: any, fieldName: string, required: boolean = false): ValidationError | null {
  if (!required && (value === undefined || value === null || value === '')) {
    return null;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return validateString(value, fieldName, {
    required,
    maxLength: 255,
    pattern: emailPattern,
    patternMessage: `${fieldName} must be a valid email address`,
  });
}

/**
 * Validates a URL
 */
export function validateURL(value: any, fieldName: string, required: boolean = false): ValidationError | null {
  if (!required && (value === undefined || value === null || value === '')) {
    return null;
  }

  if (typeof value !== 'string') {
    return { field: fieldName, message: `${fieldName} must be a string` };
  }

  try {
    new URL(value);
    return null;
  } catch {
    return { field: fieldName, message: `${fieldName} must be a valid URL` };
  }
}

/**
 * Validates a VAT number (basic format check)
 */
export function validateVATNumber(value: any, fieldName: string, required: boolean = false): ValidationError | null {
  if (!required && (value === undefined || value === null || value === '')) {
    return null;
  }

  // VAT number should be 2-letter country code + alphanumeric
  const vatPattern = /^[A-Z]{2}[A-Z0-9]{2,15}$/i;
  return validateString(value, fieldName, {
    required,
    maxLength: 20,
    pattern: vatPattern,
    patternMessage: `${fieldName} must be a valid VAT number (e.g., GB123456789)`,
  });
}

/**
 * Validates a number field
 */
export function validateNumber(
  value: any,
  fieldName: string,
  options: {
    required?: boolean;
    min?: number;
    max?: number;
    integer?: boolean;
  } = {}
): ValidationError | null {
  const { required = false, min, max, integer = false } = options;

  // Check if value exists
  if (value === undefined || value === null || value === '') {
    if (required) {
      return { field: fieldName, message: `${fieldName} is required` };
    }
    return null;
  }

  // Check type
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return { field: fieldName, message: `${fieldName} must be a number` };
  }

  // Check integer
  if (integer && !Number.isInteger(numValue)) {
    return { field: fieldName, message: `${fieldName} must be an integer` };
  }

  // Check range
  if (min !== undefined && numValue < min) {
    return { field: fieldName, message: `${fieldName} must be at least ${min}` };
  }

  if (max !== undefined && numValue > max) {
    return { field: fieldName, message: `${fieldName} must be at most ${max}` };
  }

  return null;
}

/**
 * Validates an enum/choice field
 */
export function validateEnum(
  value: any,
  fieldName: string,
  allowedValues: string[],
  required: boolean = false
): ValidationError | null {
  if (!required && (value === undefined || value === null || value === '')) {
    return null;
  }

  if (!allowedValues.includes(value)) {
    return {
      field: fieldName,
      message: `${fieldName} must be one of: ${allowedValues.join(', ')}`,
    };
  }

  return null;
}

/**
 * Validates a UUID
 */
export function validateUUID(value: any, fieldName: string, required: boolean = false): ValidationError | null {
  if (!required && (value === undefined || value === null || value === '')) {
    return null;
  }

  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return validateString(value, fieldName, {
    required,
    pattern: uuidPattern,
    patternMessage: `${fieldName} must be a valid UUID`,
  });
}

/**
 * Collects all validation errors from multiple validators
 */
export function collectValidationErrors(validators: (ValidationError | null)[]): ValidationResult {
  const errors = validators.filter((e): e is ValidationError => e !== null);

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitizes a string for safe database storage (prevents XSS)
 */
export function sanitizeString(value: string | null | undefined): string | null {
  if (!value) return null;

  // Remove null bytes (can cause SQL issues)
  let sanitized = value.replace(/\0/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Return null for empty strings
  return sanitized === '' ? null : sanitized;
}

/**
 * Company Creation Validation Schema
 */
export function validateCompanyCreation(body: any): ValidationResult {
  return collectValidationErrors([
    validateString(body.company_name, 'company_name', {
      required: true,
      minLength: 1,
      maxLength: 255,
    }),
    validateURL(body.website, 'website', false),
    validateString(body.country, 'country', {
      required: false,
      maxLength: 100,
    }),
    validateString(body.billing_address_line_1, 'billing_address_line_1', {
      required: false,
      maxLength: 255,
    }),
    validateString(body.billing_address_line_2, 'billing_address_line_2', {
      required: false,
      maxLength: 255,
    }),
    validateString(body.billing_city, 'billing_city', {
      required: false,
      maxLength: 100,
    }),
    validateString(body.billing_state_province, 'billing_state_province', {
      required: false,
      maxLength: 100,
    }),
    validateString(body.billing_postal_code, 'billing_postal_code', {
      required: false,
      maxLength: 20,
    }),
    validateString(body.billing_country, 'billing_country', {
      required: false,
      maxLength: 100,
    }),
    validateVATNumber(body.vat_number, 'vat_number', false),
    validateString(body.company_reg_number, 'company_reg_number', {
      required: false,
      maxLength: 50,
    }),
  ]);
}

/**
 * Contact Creation Validation Schema
 */
export function validateContactCreation(body: any): ValidationResult {
  return collectValidationErrors([
    validateUUID(body.company_id, 'company_id', true),
    validateString(body.first_name, 'first_name', {
      required: false,
      maxLength: 100,
    }),
    validateString(body.last_name, 'last_name', {
      required: false,
      maxLength: 100,
    }),
    validateEmail(body.email, 'email', false),
    validateString(body.phone, 'phone', {
      required: false,
      maxLength: 50,
    }),
    validateString(body.job_title, 'job_title', {
      required: false,
      maxLength: 100,
    }),
    validateString(body.department, 'department', {
      required: false,
      maxLength: 100,
    }),
  ]);
}

/**
 * Distributor User Creation Validation Schema
 */
export function validateDistributorUserCreation(body: any): ValidationResult {
  return collectValidationErrors([
    validateUUID(body.company_id, 'company_id', true),
    validateEmail(body.email, 'email', true),
    validateString(body.full_name, 'full_name', {
      required: true,
      minLength: 1,
      maxLength: 255,
    }),
  ]);
}
