/**
 * Commercial Invoice PDF Generator
 * For international shipments (customs clearance)
 */

import { getSupabaseClient } from './supabase';

interface CommercialInvoiceParams {
  order_id: string;
}

interface CommercialInvoiceResult {
  success: boolean;
  pdf_url?: string;
  error?: string;
}

/**
 * Generate commercial invoice PDF for international shipment
 * Called when invoice.paid webhook fires for non-GB orders
 */
export async function generateCommercialInvoice(params: CommercialInvoiceParams): Promise<CommercialInvoiceResult> {
  const { order_id } = params;

  try {
    const supabase = getSupabaseClient();

    // 1. Get order details with all related data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        order_id,
        company_id,
        contact_id,
        items,
        subtotal,
        tax_amount,
        total_amount,
        currency,
        created_at,
        stripe_invoice_id
      `)
      .eq('order_id', order_id)
      .single();

    if (orderError || !order) {
      return { success: false, error: 'Order not found' };
    }

    // 2. Get company details (exporter + consignee)
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('company_name, country, vat_number, eori_number')
      .eq('company_id', order.company_id)
      .single();

    if (companyError || !company) {
      return { success: false, error: 'Company not found' };
    }

    // 3. Get contact details
    const { data: contact } = await supabase
      .from('contacts')
      .select('full_name, email')
      .eq('contact_id', order.contact_id)
      .single();

    // 4. Get product details with HS codes, weights, country of origin
    const productCodes = order.items.map((item: any) => item.product_code);

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('product_code, description, hs_code, country_of_origin, weight_kg, customs_value_gbp')
      .in('product_code', productCodes);

    if (productsError) {
      console.error('Failed to fetch product details:', productsError);
      return { success: false, error: 'Failed to fetch product details' };
    }

    // 5. Build line items with HS codes and weights
    const lineItems = order.items.map((item: any) => {
      const product = products?.find(p => p.product_code === item.product_code);
      return {
        hs_code: product?.hs_code || '0000.00.00',
        description: item.description,
        product_code: item.product_code,
        country_of_origin: product?.country_of_origin || 'GB',
        quantity: item.quantity,
        unit_price: item.unit_price,
        unit_weight_kg: product?.weight_kg || 0,
        total_weight_kg: (product?.weight_kg || 0) * item.quantity,
        customs_value: product?.customs_value_gbp || item.unit_price,
        total_value: (product?.customs_value_gbp || item.unit_price) * item.quantity,
      };
    });

    // 6. Calculate totals
    const totalWeight = lineItems.reduce((sum, item) => sum + item.total_weight_kg, 0);
    const totalValue = order.subtotal; // Use order subtotal for accuracy

    // 7. Generate HTML for commercial invoice
    const invoiceHtml = buildCommercialInvoiceHtml({
      invoiceNumber: `CI-${order.stripe_invoice_id?.substring(3, 15) || order_id.substring(0, 12)}`,
      invoiceDate: new Date(order.created_at).toLocaleDateString('en-GB'),

      // Exporter (Technifold)
      exporterName: 'Technifold Ltd',
      exporterAddress: 'Unit 2, St John\'s Business Park',
      exporterCity: 'Lutterworth',
      exporterPostcode: 'LE17 4HB',
      exporterCountry: 'United Kingdom',
      exporterVAT: 'GB123456789', // TODO: Get from env or config
      exporterEORI: 'GB123456789000', // TODO: Get from env or config

      // Consignee (Customer)
      consigneeName: company.company_name,
      consigneeContact: contact?.full_name || '',
      consigneeCountry: company.country || '',
      consigneeVAT: company.vat_number || '',
      consigneeEORI: company.eori_number || '',

      // Shipment details
      lineItems,
      totalWeight,
      totalValue,
      currency: order.currency,
      incoterms: 'DDP', // Delivered Duty Paid (default)
      reasonForExport: 'Sale',
    });

    // 8. Convert HTML to PDF using a PDF generation service
    // For MVP, we'll return the HTML and let it be printed/saved as PDF
    // In production, you'd use: Puppeteer, PDFKit, or a service like DocRaptor

    // For now, store the HTML content and provide a URL to render it
    const pdfUrl = `/api/invoices/commercial/${order_id}/download`;

    // Update order with commercial invoice reference
    await supabase
      .from('orders')
      .update({
        commercial_invoice_pdf_url: pdfUrl,
        shipping_weight_kg: totalWeight,
        incoterms: 'DDP',
      })
      .eq('order_id', order_id);

    console.log(`[commercial-invoice] Generated for order ${order_id}, weight: ${totalWeight}kg, value: ${totalValue} ${order.currency}`);

    return {
      success: true,
      pdf_url: pdfUrl,
    };

  } catch (error) {
    console.error('Error generating commercial invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Build HTML for commercial invoice
 * This can be rendered in browser or converted to PDF
 */
function buildCommercialInvoiceHtml(data: {
  invoiceNumber: string;
  invoiceDate: string;
  exporterName: string;
  exporterAddress: string;
  exporterCity: string;
  exporterPostcode: string;
  exporterCountry: string;
  exporterVAT: string;
  exporterEORI: string;
  consigneeName: string;
  consigneeContact: string;
  consigneeCountry: string;
  consigneeVAT: string;
  consigneeEORI: string;
  lineItems: Array<{
    hs_code: string;
    description: string;
    product_code: string;
    country_of_origin: string;
    quantity: number;
    unit_price: number;
    unit_weight_kg: number;
    total_weight_kg: number;
    customs_value: number;
    total_value: number;
  }>;
  totalWeight: number;
  totalValue: number;
  currency: string;
  incoterms: string;
  reasonForExport: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Commercial Invoice - ${data.invoiceNumber}</title>
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
      ${data.consigneeContact ? `<div>Attn: ${data.consigneeContact}</div>` : ''}
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
      <div><strong>Invoice Date:</strong> ${data.invoiceDate}</div>
      <div><strong>Incoterms:</strong> ${data.incoterms}</div>
      <div><strong>Reason for Export:</strong> ${data.reasonForExport}</div>
    </div>

    <!-- Shipment Summary -->
    <div class="section">
      <div class="section-title">SHIPMENT SUMMARY</div>
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
          <th style="width: 25%;">Description</th>
          <th style="width: 12%;">Product Code</th>
          <th style="width: 8%;">Origin</th>
          <th class="right" style="width: 8%;">Qty</th>
          <th class="right" style="width: 12%;">Unit Value</th>
          <th class="right" style="width: 10%;">Weight (kg)</th>
          <th class="right" style="width: 15%;">Total Value</th>
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
            <td class="right">${data.currency} ${item.customs_value.toFixed(2)}</td>
            <td class="right">${item.total_weight_kg.toFixed(2)}</td>
            <td class="right">${data.currency} ${item.total_value.toFixed(2)}</td>
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

  <div class="no-print" style="margin-top: 30px; text-align: center; border-top: 2px dashed #999; padding-top: 20px;">
    <button onclick="window.print()" style="padding: 10px 30px; font-size: 14pt; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
      Print / Save as PDF
    </button>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Get commercial invoice HTML for rendering
 * Used by the download endpoint
 */
export async function getCommercialInvoiceHtml(order_id: string): Promise<string | null> {
  const result = await generateCommercialInvoice({ order_id });

  if (!result.success) {
    return null;
  }

  // For now, regenerate the HTML each time
  // In production, you'd cache this or store the PDF
  const supabase = getSupabaseClient();

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('order_id', order_id)
    .single();

  if (!order) {
    return null;
  }

  // TODO: Fetch all data and regenerate HTML
  // For now, return a placeholder
  return '<html><body><h1>Commercial Invoice</h1><p>PDF generation coming soon...</p></body></html>';
}
