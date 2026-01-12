/**
 * Commercial Invoice Generator for Shipping Manifests
 * Generates print-ready HTML commercial invoices for international customs
 */

import { getSupabaseClient } from './supabase';

interface CommercialInvoiceData {
  manifest_id: string;
  company_id: string;
  destination_country: string;
  shipment_type: string;
  customs_invoice_number: string;
  total_customs_value_gbp: number;
  total_weight_kg: number;
  items: Array<{
    product_code: string;
    description: string;
    hs_code: string;
    country_of_origin: string;
    value_gbp: number;
    quantity: number;
    weight_kg: number;
  }>;
  created_at: string;
  invoice_id?: string;
  subscription_id?: string;
  courier?: string;
  tracking_number?: string;
  shipped_at?: string;
}

/**
 * Get commercial invoice HTML for a shipping manifest
 */
export async function getShippingCommercialInvoiceHtml(manifest_id: string): Promise<string | null> {
  try {
    const supabase = getSupabaseClient();

    // 1. Fetch shipping manifest with company details
    const { data: manifest, error: manifestError } = await supabase
      .from('shipping_manifests')
      .select(`
        *,
        companies:company_id (
          company_name,
          country,
          vat_number,
          eori_number
        )
      `)
      .eq('manifest_id', manifest_id)
      .single();

    if (manifestError || !manifest) {
      console.error('[shipping-invoice] Manifest not found:', manifest_id);
      return null;
    }

    // 2. Get invoice details if linked (for invoice number)
    let invoiceNumber = manifest.customs_invoice_number;
    if (manifest.invoice_id) {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('invoice_number, stripe_invoice_id')
        .eq('invoice_id', manifest.invoice_id)
        .single();

      if (invoice) {
        invoiceNumber = invoice.invoice_number || invoice.stripe_invoice_id || manifest.customs_invoice_number;
      }
    }

    // 3. Get shipping address if available
    let shippingAddress = '';
    const { data: addresses } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('company_id', manifest.company_id)
      .eq('is_default', true)
      .single();

    if (addresses) {
      shippingAddress = [
        addresses.address_line1,
        addresses.address_line2,
        addresses.city,
        addresses.state_province,
        addresses.postal_code,
      ].filter(Boolean).join(', ');
    }

    // 4. Generate HTML
    const html = buildShippingCommercialInvoiceHtml({
      invoiceNumber,
      invoiceDate: new Date(manifest.created_at).toLocaleDateString('en-GB'),
      customsInvoiceNumber: manifest.customs_invoice_number,

      // Exporter (Technifold)
      exporterName: 'Technifold Ltd',
      exporterAddress: 'Unit 2D Tungsten Park',
      exporterCity: 'Lutterworth',
      exporterPostcode: 'LE17 4JA',
      exporterCountry: 'United Kingdom',
      exporterVAT: 'GB738934000',
      exporterEORI: 'GB738934000000', // Add actual EORI if different

      // Consignee (Customer)
      consigneeName: manifest.companies?.company_name || 'Unknown',
      consigneeAddress: shippingAddress,
      consigneeCountry: manifest.destination_country,
      consigneeVAT: manifest.companies?.vat_number || '',
      consigneeEORI: manifest.companies?.eori_number || '',

      // Shipment details
      shipmentType: manifest.shipment_type,
      lineItems: manifest.items || [],
      totalWeight: manifest.total_weight_kg,
      totalValue: manifest.total_customs_value_gbp,
      currency: 'GBP',
      incoterms: 'DDP', // Delivered Duty Paid (default)
      reasonForExport: manifest.shipment_type === 'rental' ? 'Commercial Rental' : 'Sale',

      // Tracking
      courier: manifest.courier,
      trackingNumber: manifest.tracking_number,
      shippedDate: manifest.shipped_at ? new Date(manifest.shipped_at).toLocaleDateString('en-GB') : null,
    });

    return html;

  } catch (error) {
    console.error('[shipping-invoice] Error generating HTML:', error);
    return null;
  }
}

/**
 * Build HTML for commercial invoice based on shipping manifest
 */
function buildShippingCommercialInvoiceHtml(data: {
  invoiceNumber: string;
  invoiceDate: string;
  customsInvoiceNumber: string;
  exporterName: string;
  exporterAddress: string;
  exporterCity: string;
  exporterPostcode: string;
  exporterCountry: string;
  exporterVAT: string;
  exporterEORI: string;
  consigneeName: string;
  consigneeAddress: string;
  consigneeCountry: string;
  consigneeVAT: string;
  consigneeEORI: string;
  shipmentType: string;
  lineItems: Array<{
    product_code: string;
    description: string;
    hs_code: string;
    country_of_origin: string;
    value_gbp: number;
    quantity: number;
    weight_kg: number;
  }>;
  totalWeight: number;
  totalValue: number;
  currency: string;
  incoterms: string;
  reasonForExport: string;
  courier?: string;
  trackingNumber?: string;
  shippedDate?: string | null;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Commercial Invoice - ${data.customsInvoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.4;
      padding: 20px;
      max-width: 210mm; /* A4 width */
    }
    .header {
      text-align: center;
      border: 2px solid #000;
      padding: 10px;
      margin-bottom: 20px;
      font-weight: bold;
      font-size: 14pt;
    }
    .section {
      margin-bottom: 15px;
      border: 1px solid #000;
      padding: 10px;
    }
    .section-title {
      font-weight: bold;
      text-decoration: underline;
      margin-bottom: 5px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 15px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 5px;
    }
    th, td {
      border: 1px solid #000;
      padding: 5px;
      text-align: left;
      font-size: 9pt;
    }
    th {
      background-color: #f0f0f0;
      font-weight: bold;
    }
    .right { text-align: right; }
    .center { text-align: center; }
    .totals {
      margin-top: 10px;
      font-weight: bold;
    }
    .signature {
      margin-top: 30px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .signature-line {
      border-top: 1px solid #000;
      margin-top: 40px;
      padding-top: 5px;
    }
    .tracking-info {
      background-color: #e3f2fd;
      padding: 10px;
      margin-bottom: 15px;
      border: 1px solid #2196f3;
      border-radius: 4px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    COMMERCIAL INVOICE
  </div>

  ${data.shippedDate || data.courier ? `
  <div class="tracking-info">
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 9pt;">
      ${data.shippedDate ? `
        <div>
          <strong>Shipped Date:</strong> ${data.shippedDate}
        </div>
      ` : ''}
      ${data.courier ? `
        <div>
          <strong>Courier:</strong> ${data.courier}
        </div>
      ` : ''}
      ${data.trackingNumber ? `
        <div>
          <strong>Tracking:</strong> ${data.trackingNumber}
        </div>
      ` : ''}
    </div>
  </div>
  ` : ''}

  <div class="grid">
    <!-- Exporter -->
    <div class="section">
      <div class="section-title">EXPORTER (Seller)</div>
      <div><strong>${data.exporterName}</strong></div>
      <div>${data.exporterAddress}</div>
      <div>${data.exporterCity}, ${data.exporterPostcode}</div>
      <div>${data.exporterCountry}</div>
      <div style="margin-top: 10px;">
        <div><strong>VAT Number:</strong> ${data.exporterVAT}</div>
        <div><strong>EORI Number:</strong> ${data.exporterEORI}</div>
      </div>
    </div>

    <!-- Consignee -->
    <div class="section">
      <div class="section-title">CONSIGNEE (Buyer)</div>
      <div><strong>${data.consigneeName}</strong></div>
      ${data.consigneeAddress ? `<div>${data.consigneeAddress}</div>` : ''}
      <div>${data.consigneeCountry}</div>
      <div style="margin-top: 10px;">
        ${data.consigneeVAT ? `<div><strong>VAT Number:</strong> ${data.consigneeVAT}</div>` : ''}
        ${data.consigneeEORI ? `<div><strong>EORI Number:</strong> ${data.consigneeEORI}</div>` : ''}
      </div>
    </div>
  </div>

  <div class="grid">
    <!-- Invoice Details -->
    <div class="section">
      <div class="section-title">INVOICE DETAILS</div>
      <div><strong>Invoice Number:</strong> ${data.invoiceNumber}</div>
      <div><strong>Customs Invoice:</strong> ${data.customsInvoiceNumber}</div>
      <div><strong>Invoice Date:</strong> ${data.invoiceDate}</div>
      <div><strong>Incoterms:</strong> ${data.incoterms}</div>
      <div><strong>Reason for Export:</strong> ${data.reasonForExport}</div>
    </div>

    <!-- Shipment Summary -->
    <div class="section">
      <div class="section-title">SHIPMENT SUMMARY</div>
      <div><strong>Shipment Type:</strong> ${data.shipmentType.toUpperCase()}</div>
      <div><strong>Total Packages:</strong> 1</div>
      <div><strong>Total Weight:</strong> ${data.totalWeight.toFixed(2)} kg</div>
      <div><strong>Total Value:</strong> ${data.currency} ${data.totalValue.toFixed(2)}</div>
      <div><strong>Currency:</strong> ${data.currency}</div>
    </div>
  </div>

  <!-- Line Items -->
  <div class="section">
    <div class="section-title">DETAILED DESCRIPTION OF GOODS</div>
    <table>
      <thead>
        <tr>
          <th style="width: 10%;">HS Code</th>
          <th style="width: 30%;">Description</th>
          <th style="width: 12%;">Product Code</th>
          <th style="width: 8%;">Origin</th>
          <th class="right" style="width: 8%;">Qty</th>
          <th class="right" style="width: 12%;">Unit Value</th>
          <th class="right" style="width: 10%;">Weight (kg)</th>
          <th class="right" style="width: 10%;">Total Value</th>
        </tr>
      </thead>
      <tbody>
        ${data.lineItems.map(item => `
          <tr>
            <td>${item.hs_code}</td>
            <td>${item.description}</td>
            <td>${item.product_code}</td>
            <td class="center">${item.country_of_origin}</td>
            <td class="right">${item.quantity}</td>
            <td class="right">${data.currency} ${item.value_gbp.toFixed(2)}</td>
            <td class="right">${(item.weight_kg * item.quantity).toFixed(2)}</td>
            <td class="right">${data.currency} ${(item.value_gbp * item.quantity).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div style="text-align: right; padding: 10px; border-top: 2px solid #000;">
        <div>TOTAL WEIGHT: ${data.totalWeight.toFixed(2)} kg</div>
        <div style="font-size: 12pt; margin-top: 5px;">
          TOTAL VALUE: ${data.currency} ${data.totalValue.toFixed(2)}
        </div>
      </div>
    </div>
  </div>

  ${data.shipmentType === 'rental' ? `
  <div class="section" style="background-color: #fff9e6;">
    <div class="section-title">TEMPORARY EXPORT - RENTAL EQUIPMENT</div>
    <p style="margin-bottom: 5px;">
      <strong>IMPORTANT:</strong> This equipment remains the property of the exporter.
    </p>
    <ul style="margin-left: 20px; margin-top: 5px;">
      <li>Equipment is being rented under a subscription agreement</li>
      <li>No sale or transfer of ownership is taking place</li>
      <li>Equipment will be returned to exporter when rental period ends</li>
      <li>Purpose: Commercial Rental / Subscription Service</li>
    </ul>
  </div>
  ` : ''}

  <!-- Declaration -->
  <div class="section">
    <div class="section-title">DECLARATION</div>
    <p>
      I/We hereby certify that the information on this invoice is true and correct,
      and that the contents and value of this shipment are as stated above.
    </p>

    <div class="signature">
      <div>
        <div class="signature-line">
          Signature of Exporter
        </div>
      </div>
      <div>
        <div class="signature-line">
          Date
        </div>
      </div>
    </div>
  </div>

  <div style="margin-top: 20px; text-align: center; font-size: 9pt; color: #666;">
    Technifold Ltd - World-Leading Print Finishing Solutions
  </div>

  <div class="no-print" style="margin-top: 30px; text-align: center; border-top: 2px dashed #999; padding-top: 20px;">
    <button onclick="window.print()" style="padding: 10px 30px; font-size: 14pt; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
      Print / Save as PDF
    </button>
  </div>
</body>
</html>
  `.trim();
}
