/**
 * VAT Helpers
 * Utilities for VAT number validation and checking
 */

import { getSupabaseClient } from './supabase';

/**
 * EU country codes
 */
export const EU_COUNTRIES = [
  'AT', // Austria
  'BE', // Belgium
  'BG', // Bulgaria
  'HR', // Croatia
  'CY', // Cyprus
  'CZ', // Czech Republic
  'DK', // Denmark
  'EE', // Estonia
  'FI', // Finland
  'FR', // France
  'DE', // Germany
  'GR', // Greece
  'HU', // Hungary
  'IE', // Ireland
  'IT', // Italy
  'LV', // Latvia
  'LT', // Lithuania
  'LU', // Luxembourg
  'MT', // Malta
  'NL', // Netherlands
  'PL', // Poland
  'PT', // Portugal
  'RO', // Romania
  'SK', // Slovakia
  'SI', // Slovenia
  'ES', // Spain
  'SE', // Sweden
];

/**
 * Check if a country is in the EU
 */
export function isEUCountry(countryCode: string): boolean {
  const code = (countryCode || '').toUpperCase();
  return EU_COUNTRIES.includes(code);
}

/**
 * Check if a company needs VAT number collection
 * Returns true if:
 * - Company is in EU
 * - Company does not have vat_number stored
 */
export async function checkVATNumberNeeded(companyId: string): Promise<{
  needed: boolean;
  company?: {
    company_id: string;
    company_name: string;
    country: string;
    vat_number: string | null;
  };
  error?: string;
}> {
  try {
    const supabase = getSupabaseClient();

    const { data: company, error } = await supabase
      .from('companies')
      .select('company_id, company_name, country, vat_number')
      .eq('company_id', companyId)
      .single();

    if (error || !company) {
      return {
        needed: false,
        error: 'Company not found',
      };
    }

    // Check if EU country
    const isEU = isEUCountry(company.country || '');

    // VAT number needed if EU AND no VAT number stored
    const needed = isEU && !company.vat_number;

    return {
      needed,
      company,
    };
  } catch (error) {
    console.error('[checkVATNumberNeeded] Error:', error);
    return {
      needed: false,
      error: 'Failed to check VAT status',
    };
  }
}

/**
 * Basic VAT number format validation
 * Returns true if format appears valid
 */
export function validateVATNumberFormat(vatNumber: string, countryCode: string): boolean {
  const cleaned = vatNumber.trim().toUpperCase();
  const country = countryCode.toUpperCase();

  // Must start with country code
  if (!cleaned.startsWith(country)) {
    return false;
  }

  // Must have digits after country code
  const numberPart = cleaned.substring(2);
  if (numberPart.length < 2) {
    return false;
  }

  // Basic length checks per country (simplified)
  const lengthChecks: Record<string, number[]> = {
    'DE': [9], // Germany: DE123456789
    'FR': [11], // France: FR12345678901
    'GB': [9, 12], // UK: GB123456789 or GB123456789012
    'IT': [11], // Italy: IT12345678901
    'ES': [9], // Spain: ES123456789
    'NL': [12], // Netherlands: NL123456789B01
    'BE': [10], // Belgium: BE0123456789
    'PL': [10], // Poland: PL1234567890
    'AT': [9], // Austria: ATU12345678
    'SE': [12], // Sweden: SE123456789012
    'DK': [8], // Denmark: DK12345678
    'FI': [8], // Finland: FI12345678
    'IE': [8, 9], // Ireland: IE1234567T or IE1234567AB
  };

  const expectedLengths = lengthChecks[country];
  if (expectedLengths) {
    return expectedLengths.includes(numberPart.length);
  }

  // For countries not in the list, just check it has some length
  return numberPart.length >= 2 && numberPart.length <= 15;
}

/**
 * VIES VAT Number Verification Result
 */
export interface VATVerificationResult {
  valid: boolean;
  countryCode?: string;
  vatNumber?: string;
  companyName?: string;
  companyAddress?: string;
  error?: string;
  errorCode?: 'INVALID_INPUT' | 'SERVICE_UNAVAILABLE' | 'MS_UNAVAILABLE' | 'TIMEOUT' | 'INVALID_REQUESTER_INFO' | 'SERVER_BUSY' | 'UNKNOWN';
}

/**
 * Verify EU VAT number using VIES (VAT Information Exchange System)
 *
 * @param countryCode - 2-letter EU country code (e.g., 'DE', 'FR')
 * @param vatNumber - VAT number WITHOUT country prefix (e.g., '123456789')
 * @returns Verification result with company details if valid
 *
 * @example
 * const result = await verifyVATNumber('DE', '123456789');
 * if (result.valid) {
 *   console.log('Valid VAT for:', result.companyName);
 * }
 */
export async function verifyVATNumber(
  countryCode: string,
  vatNumber: string
): Promise<VATVerificationResult> {
  try {
    const country = countryCode.toUpperCase();
    const vat = vatNumber.trim();

    // Remove country prefix if present
    const vatWithoutPrefix = vat.startsWith(country) ? vat.substring(2) : vat;

    // Validate country is in EU
    if (!isEUCountry(country)) {
      return {
        valid: false,
        error: 'Country is not in the EU',
        errorCode: 'INVALID_INPUT',
      };
    }

    // Basic format validation first
    if (!validateVATNumberFormat(country + vatWithoutPrefix, country)) {
      return {
        valid: false,
        error: 'VAT number format is invalid',
        errorCode: 'INVALID_INPUT',
      };
    }

    // Call VIES API
    const url = `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${country}/vat/${encodeURIComponent(vatWithoutPrefix)}`;

    console.log(`[verifyVATNumber] Calling VIES API:`, { country, vat: vatWithoutPrefix });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // 10 second timeout
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`[verifyVATNumber] VIES API error:`, response.status, response.statusText);

      if (response.status === 400) {
        return {
          valid: false,
          error: 'Invalid VAT number format',
          errorCode: 'INVALID_INPUT',
        };
      }

      if (response.status === 503) {
        return {
          valid: false,
          error: 'VAT verification service temporarily unavailable',
          errorCode: 'SERVICE_UNAVAILABLE',
        };
      }

      return {
        valid: false,
        error: `VAT verification failed: ${response.statusText}`,
        errorCode: 'UNKNOWN',
      };
    }

    const data = await response.json();

    console.log(`[verifyVATNumber] VIES response:`, data);

    // VIES returns different structures depending on validity
    // Valid: { isValid: true, name: "...", address: "..." }
    // Invalid: { isValid: false }
    // Error: { errorWrapperError: { error: "...", message: "..." } }

    if (data.errorWrapperError) {
      const errorMsg = data.errorWrapperError.message || data.errorWrapperError.error;
      console.error(`[verifyVATNumber] VIES error:`, errorMsg);

      return {
        valid: false,
        error: `VAT verification error: ${errorMsg}`,
        errorCode: 'UNKNOWN',
      };
    }

    if (data.isValid === true || data.valid === true) {
      return {
        valid: true,
        countryCode: country,
        vatNumber: vatWithoutPrefix,
        companyName: data.name || data.companyName || undefined,
        companyAddress: data.address || data.companyAddress || undefined,
      };
    }

    return {
      valid: false,
      error: 'VAT number is not registered',
      errorCode: 'INVALID_INPUT',
    };

  } catch (error: any) {
    console.error('[verifyVATNumber] Exception:', error);

    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return {
        valid: false,
        error: 'VAT verification timeout - service may be unavailable',
        errorCode: 'TIMEOUT',
      };
    }

    return {
      valid: false,
      error: `VAT verification failed: ${error.message}`,
      errorCode: 'UNKNOWN',
    };
  }
}
