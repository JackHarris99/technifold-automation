/**
 * Text utility functions for placeholder replacement
 */

export interface MachineData {
  brand?: string;
  model?: string;
  display_name?: string;
  type?: string;
}

/**
 * Replace placeholders in marketing copy with actual machine/company data
 * Supports formats:
 * - {brand|fallback} → actual brand or "fallback"
 * - {brand} → actual brand or "your"
 */
export function replacePlaceholders(
  text: string,
  machineData?: MachineData,
  companyName?: string
): string {
  if (!text) return '';

  const brand = machineData?.brand || '';
  const model = machineData?.model || '';
  const displayName = machineData?.display_name || '';
  const type = machineData?.type?.replace(/_/g, ' ') || '';

  return text
    // With fallback: {brand|your} → brand or "your"
    .replace(/\{brand\|([^}]+)\}/gi, brand || '$1')
    .replace(/\{model\|([^}]+)\}/gi, model || '$1')
    .replace(/\{display_name\|([^}]+)\}/gi, displayName || '$1')
    .replace(/\{type\|([^}]+)\}/gi, type || '$1')
    .replace(/\{company\|([^}]+)\}/gi, companyName || '$1')
    // Without fallback: {brand} → brand or "your"
    .replace(/\{brand\}/gi, brand || 'your')
    .replace(/\{model\}/gi, model || 'machine')
    .replace(/\{display_name\}/gi, displayName || 'your machine')
    .replace(/\{type\}/gi, type || 'machine')
    .replace(/\{company\}/gi, companyName || 'your company');
}
