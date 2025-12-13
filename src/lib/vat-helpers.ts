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
