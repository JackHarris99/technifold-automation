/**
 * Customs Declaration Generation
 * Generates customs invoices and declarations for international shipments
 */

import { getSupabaseClient } from './supabase';

export interface CustomsItem {
  product_code: string;
  description: string;
  hs_code: string;
  country_of_origin: string;
  value_gbp: number;
  quantity: number;
  weight_kg: number;
}

export interface CustomsDeclaration {
  manifest_id: string;
  company_id: string;
  destination_country: string;
  shipment_type: 'rental' | 'sale' | 'consumables' | 'return';
  items: CustomsItem[];
  total_value_gbp: number;
  total_weight_kg: number;
  customs_invoice_number: string;
  created_at: Date;
}

/**
 * Generate customs declaration for international shipment
 */
export async function generateCustomsDeclaration(params: {
  company_id: string;
  destination_country: string;
  shipment_type: 'rental' | 'sale' | 'consumables' | 'return';
  product_codes: string[];
  subscription_id?: string;
  order_id?: string;
}): Promise<CustomsDeclaration> {
  const supabase = getSupabaseClient();

  // Fetch product details with customs info
  const { data: products, error } = await supabase
    .from('products')
    .select('product_code, description, hs_code, country_of_origin, customs_value_gbp, weight_kg')
    .in('product_code', params.product_codes);

  if (error || !products) {
    throw new Error(`Failed to fetch product customs data: ${error?.message}`);
  }

  // Build customs items
  const items: CustomsItem[] = products.map(p => ({
    product_code: p.product_code,
    description: p.description || p.product_code,
    hs_code: p.hs_code || '8442.30.00', // Default for printing machinery
    country_of_origin: p.country_of_origin || 'GB',
    value_gbp: p.customs_value_gbp || 1500.00,
    quantity: 1,
    weight_kg: p.weight_kg || 5.0,
  }));

  // Calculate totals
  const total_value_gbp = items.reduce((sum, item) => sum + (item.value_gbp * item.quantity), 0);
  const total_weight_kg = items.reduce((sum, item) => sum + (item.weight_kg * item.quantity), 0);

  // Generate customs invoice number
  const timestamp = Date.now().toString(36).toUpperCase();
  const customs_invoice_number = `TNF-${params.destination_country}-${timestamp}`;

  // Create shipping manifest record
  const { data: manifest, error: manifestError } = await supabase
    .from('shipping_manifests')
    .insert({
      company_id: params.company_id,
      subscription_id: params.subscription_id,
      order_id: params.order_id,
      destination_country: params.destination_country,
      shipment_type: params.shipment_type,
      customs_invoice_number,
      total_customs_value_gbp: total_value_gbp,
      total_weight_kg,
      items: items, // Store as JSONB
    })
    .select()
    .single();

  if (manifestError || !manifest) {
    throw new Error(`Failed to create shipping manifest: ${manifestError?.message}`);
  }

  return {
    manifest_id: manifest.manifest_id,
    company_id: params.company_id,
    destination_country: params.destination_country,
    shipment_type: params.shipment_type,
    items,
    total_value_gbp,
    total_weight_kg,
    customs_invoice_number,
    created_at: new Date(manifest.created_at),
  };
}

/**
 * Generate customs invoice text (for printing/emailing)
 */
export function formatCustomsInvoice(declaration: CustomsDeclaration, sender: {
  company_name: string;
  address: string;
  country: string;
  vat_number?: string;
  eori_number?: string;
}, recipient: {
  company_name: string;
  address: string;
  country: string;
  vat_number?: string;
}): string {
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════════════════════');
  lines.push('               CUSTOMS COMMERCIAL INVOICE');
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('');
  lines.push(`Invoice Number: ${declaration.customs_invoice_number}`);
  lines.push(`Date: ${declaration.created_at.toLocaleDateString('en-GB')}`);
  lines.push(`Shipment Type: ${declaration.shipment_type.toUpperCase()}`);
  lines.push('');
  lines.push('SENDER (EXPORTER):');
  lines.push(`  ${sender.company_name}`);
  lines.push(`  ${sender.address}`);
  lines.push(`  ${sender.country}`);
  if (sender.vat_number) lines.push(`  VAT: ${sender.vat_number}`);
  if (sender.eori_number) lines.push(`  EORI: ${sender.eori_number}`);
  lines.push('');
  lines.push('RECIPIENT (IMPORTER):');
  lines.push(`  ${recipient.company_name}`);
  lines.push(`  ${recipient.address}`);
  lines.push(`  ${recipient.country}`);
  if (recipient.vat_number) lines.push(`  VAT: ${recipient.vat_number}`);
  lines.push('');
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('ITEMIZED CONTENTS FOR CUSTOMS:');
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('');

  // Header
  lines.push('Item Description               HS Code    Origin  Value(£)  Qty  Weight(kg)');
  lines.push('───────────────────────────────────────────────────────────────────────────');

  // Items
  declaration.items.forEach(item => {
    const desc = item.description.padEnd(30).substring(0, 30);
    const hs = item.hs_code.padEnd(10);
    const origin = item.country_of_origin.padEnd(6);
    const value = item.value_gbp.toFixed(2).padStart(8);
    const qty = item.quantity.toString().padStart(3);
    const weight = item.weight_kg.toFixed(2).padStart(8);

    lines.push(`${desc} ${hs} ${origin} ${value}  ${qty}  ${weight}`);
  });

  lines.push('───────────────────────────────────────────────────────────────────────────');
  lines.push('');
  lines.push(`TOTAL VALUE:  £${declaration.total_value_gbp.toFixed(2)}`);
  lines.push(`TOTAL WEIGHT: ${declaration.total_weight_kg.toFixed(2)} kg`);
  lines.push('');

  if (declaration.shipment_type === 'rental') {
    lines.push('═══════════════════════════════════════════════════════');
    lines.push('           TEMPORARY EXPORT / RENTAL EQUIPMENT');
    lines.push('═══════════════════════════════════════════════════════');
    lines.push('');
    lines.push('This equipment remains the property of the sender.');
    lines.push('Equipment is being rented under a subscription agreement.');
    lines.push('No sale or transfer of ownership is taking place.');
    lines.push('Equipment will be returned to sender when rental ends.');
    lines.push('');
    lines.push('Purpose: Commercial Rental / Subscription Service');
    lines.push('');
  }

  lines.push('═══════════════════════════════════════════════════════');
  lines.push('Technifold Ltd - World-Leading Print Finishing Solutions');
  lines.push('═══════════════════════════════════════════════════════');

  return lines.join('\n');
}

/**
 * Get shipping country name from ISO code
 */
export function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    GB: 'United Kingdom',
    DE: 'Germany',
    FR: 'France',
    ES: 'Spain',
    IT: 'Italy',
    NL: 'Netherlands',
    BE: 'Belgium',
    IE: 'Ireland',
    US: 'United States',
    CA: 'Canada',
    AU: 'Australia',
    NZ: 'New Zealand',
    // Add more as needed
  };
  return countries[code] || code;
}

/**
 * Determine if shipment requires special customs handling
 */
export function requiresATACarnet(destination: string, value: number): boolean {
  // ATA Carnet recommended for high-value temporary exports to certain countries
  const carnetCountries = ['US', 'CA', 'AU', 'NZ', 'JP', 'CH', 'NO'];
  return carnetCountries.includes(destination) && value > 5000;
}

/**
 * Check if destination is EU for post-Brexit rules
 */
export function isEU(country: string): boolean {
  const euCountries = ['DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'IE', 'AT', 'PT', 'SE', 'DK', 'FI', 'PL', 'CZ', 'HU', 'RO', 'GR', 'BG', 'HR', 'SK', 'SI', 'LT', 'LV', 'EE', 'CY', 'LU', 'MT'];
  return euCountries.includes(country);
}
