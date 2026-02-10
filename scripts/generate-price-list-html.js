/**
 * Generate Professional Price List HTML for Distributors
 * Open in browser and print to PDF (Ctrl+P)
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Logo path - read and convert to base64
const logoPath = path.join(__dirname, '..', 'public', 'images', 'logo', 'technifold-logo.png');

// Categories to exclude from distributor price lists
const EXCLUDED_CATEGORIES = [
  'Classic Folding Machine Blades',
  'Blade Holder',
  'Starter Packs',
  'Pharma Score Bands',
  'Pharma Score Tools',
  'Pharma-Score Band',  // Exact match for consumable category
  'Screws',
  'Allen Keys',
  'Spacers',
  'Tape'
];

// Specific product codes to exclude
const EXCLUDED_PRODUCT_CODES = [
  'M/F-TRI-WEB'
];

function shouldExcludeProduct(product) {
  // Check if product code is in exclusion list
  if (EXCLUDED_PRODUCT_CODES.includes(product.product_code)) {
    return true;
  }

  // Check if description contains Zund or Kongsberg (case-insensitive)
  if (product.description) {
    const descLower = product.description.toLowerCase();
    if (descLower.includes('zund') || descLower.includes('kongsberg')) {
      return true;
    }
  }

  // Check if product's category matches any excluded category (case-insensitive)
  if (product.category) {
    const categoryLower = product.category.toLowerCase();
    return EXCLUDED_CATEGORIES.some(excluded =>
      categoryLower.includes(excluded.toLowerCase()) ||
      excluded.toLowerCase().includes(categoryLower)
    );
  }
  return false;
}

async function fetchAllProducts(typeFilter = null) {
  const filterMsg = typeFilter ? ` (type: ${typeFilter})` : '';
  console.log(`📦 Fetching all active products${filterMsg}...`);

  let products = [];
  let offset = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    let query = supabase
      .from('products')
      .select('product_code, description, type, category, price, image_url')
      .eq('active', true);

    // Apply type filter if specified
    if (typeFilter) {
      query = query.eq('type', typeFilter);
    }

    query = query
      .order('type', { ascending: true })
      .order('category', { ascending: true })
      .order('product_code', { ascending: true })
      .range(offset, offset + batchSize - 1);

    const { data: batch, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      process.exit(1);
    }

    if (!batch || batch.length === 0) {
      hasMore = false;
    } else {
      products = products.concat(batch);
      offset += batchSize;
      if (batch.length < batchSize) {
        hasMore = false;
      }
    }
  }

  // Filter out excluded categories
  const beforeCount = products.length;
  products = products.filter(p => !shouldExcludeProduct(p));
  const excludedCount = beforeCount - products.length;

  console.log(`✓ Loaded ${products.length} active products`);
  if (excludedCount > 0) {
    console.log(`  (Excluded ${excludedCount} products from: ${EXCLUDED_CATEGORIES.join(', ')})`);
  }
  console.log('');

  return products;
}

function organizeByTypeAndCategory(products) {
  const organized = {};

  products.forEach(product => {
    const type = product.type || 'Other';
    const category = product.category || 'Uncategorized';

    if (!organized[type]) {
      organized[type] = {};
    }
    if (!organized[type][category]) {
      organized[type][category] = [];
    }

    organized[type][category].push(product);
  });

  return organized;
}

function generateHTML(organizedProducts, logoBase64) {
  const types = Object.keys(organizedProducts).sort();

  let productsHTML = '';

  types.forEach(type => {
    // Type header
    productsHTML += `
      <div class="type-header">
        <h2>${type.toUpperCase()}</h2>
      </div>
    `;

    const categories = Object.keys(organizedProducts[type]).sort();

    categories.forEach(category => {
      const products = organizedProducts[type][category];

      // Category header
      productsHTML += `
        <div class="category-header">
          <h3>${category}</h3>
        </div>
      `;

      // Products table
      productsHTML += `
        <table class="products-table">
          <thead>
            <tr>
              <th width="80">Image</th>
              <th width="140">Product Code</th>
              <th>Description</th>
              <th width="110">Your Price</th>
              <th width="110">RRP</th>
            </tr>
          </thead>
          <tbody>
      `;

      products.forEach(product => {
        const distributorPrice = (product.price * 0.60).toFixed(2);
        const rrp = product.price.toFixed(2);

        const imageHTML = product.image_url
          ? `<img src="${product.image_url}" class="product-image" onerror="this.style.display='none'; var div=document.createElement('div'); div.className='no-image'; div.innerHTML='No<br/>Image'; this.parentElement.appendChild(div);"/>`
          : `<div class="no-image">Image<br/>Coming<br/>Soon</div>`;

        productsHTML += `
          <tr>
            <td class="image-cell">${imageHTML}</td>
            <td class="code-cell">${product.product_code}</td>
            <td class="desc-cell">${(product.description || '').replace(/"/g, '&quot;')}</td>
            <td class="price-cell">£${distributorPrice}</td>
            <td class="price-cell">£${rrp}</td>
          </tr>
        `;
      });

      productsHTML += `
          </tbody>
        </table>
      `;
    });
  });

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Distributor Price List - March 2025</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #1a1a1a;
      background: #f8f9fa;
    }

    .page-wrapper {
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
    }

    .header {
      text-align: center;
      padding: 48px 48px 36px;
      background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
      color: white;
    }

    .logo {
      max-width: 280px;
      height: auto;
      margin-bottom: 24px;
      background: white;
      padding: 12px 24px;
      border-radius: 8px;
    }

    .header h1 {
      font-size: 28pt;
      margin-bottom: 8px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .header .subtitle {
      font-size: 12pt;
      opacity: 0.95;
      font-weight: 400;
    }

    .print-button {
      position: fixed;
      top: 24px;
      right: 24px;
      padding: 14px 28px;
      background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,102,204,0.3);
      z-index: 1000;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .print-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0,102,204,0.4);
    }

    .content {
      padding: 0 48px 48px;
    }

    .type-header {
      background: linear-gradient(135deg, #003d82 0%, #0066cc 100%);
      color: white;
      padding: 16px 24px;
      margin-top: 32px;
      margin-bottom: 16px;
      border-radius: 8px;
      page-break-after: avoid;
      box-shadow: 0 2px 8px rgba(0,102,204,0.15);
    }

    .type-header h2 {
      font-size: 18pt;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .category-header {
      background: #f0f4f8;
      padding: 12px 24px;
      margin-top: 20px;
      margin-bottom: 12px;
      border-left: 5px solid #0066cc;
      border-radius: 4px;
      page-break-after: avoid;
    }

    .category-header h3 {
      font-size: 14pt;
      color: #1a1a1a;
      font-weight: 600;
    }

    .products-table {
      width: 100%;
      margin: 0 0 24px;
      border-collapse: separate;
      border-spacing: 0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      page-break-inside: auto;
    }

    .products-table thead {
      background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
      border-bottom: 2px solid #0066cc;
    }

    .products-table th {
      padding: 12px 16px;
      text-align: left;
      font-weight: 700;
      font-size: 9pt;
      color: #1a1a1a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #0066cc;
    }

    .products-table tbody tr {
      border-bottom: 1px solid #e9ecef;
      page-break-inside: avoid;
      transition: background 0.15s;
    }

    .products-table tbody tr:last-child {
      border-bottom: none;
    }

    .products-table tbody tr:hover {
      background: #f8f9fa;
    }

    .products-table td {
      padding: 14px 16px;
      vertical-align: middle;
    }

    .image-cell {
      text-align: center;
      width: 80px;
    }

    .product-image {
      width: 70px;
      height: 70px;
      object-fit: contain;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      background: white;
      padding: 4px;
    }

    .no-image {
      width: 70px;
      height: 70px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border: 1px solid #dee2e6;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 7pt;
      color: #adb5bd;
      text-align: center;
      line-height: 1.3;
      padding: 8px;
      font-weight: 500;
    }

    .code-cell {
      font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
      font-size: 9.5pt;
      font-weight: 600;
      color: #495057;
      width: 140px;
    }

    .desc-cell {
      font-size: 10pt;
      color: #495057;
      line-height: 1.4;
    }

    .price-cell {
      text-align: right;
      font-weight: 700;
      font-size: 11pt;
      color: #0066cc;
      width: 110px;
      font-feature-settings: 'tnum';
    }

    .footer {
      margin: 48px 0 0;
      padding: 32px 24px;
      border-top: 3px solid #e9ecef;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .footer strong {
      color: #1a1a1a;
      font-size: 10pt;
      display: block;
      margin-bottom: 12px;
    }

    .footer p {
      font-size: 9pt;
      color: #6c757d;
      margin: 6px 0;
    }

    .footer .generated {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #dee2e6;
      color: #adb5bd;
      font-size: 8pt;
    }

    @media print {
      @page {
        size: A4;
        margin: 15mm;
      }

      body {
        background: white;
      }

      .print-button {
        display: none !important;
      }

      .page-wrapper {
        max-width: 100%;
        box-shadow: none;
        margin: 0;
      }

      .header {
        page-break-after: avoid;
      }

      .type-header {
        page-break-before: always;
        page-break-after: avoid;
        margin-top: 0;
      }

      .type-header:first-of-type {
        page-break-before: avoid;
      }

      .category-header {
        page-break-after: avoid;
        page-break-inside: avoid;
      }

      .products-table {
        page-break-inside: auto;
      }

      .products-table thead {
        display: table-header-group;
      }

      .products-table tbody tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }

      .footer {
        page-break-before: auto;
      }

      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }

    @media screen {
      .page-wrapper {
        margin: 32px auto;
        border-radius: 8px;
        overflow: hidden;
      }
    }
  </style>
</head>
<body>
  <button class="print-button" onclick="window.print()">🖨️ Print to PDF</button>

  <div class="page-wrapper">
    <div class="header">
      <img src="data:image/png;base64,${logoBase64}" class="logo" alt="Technifold Logo"/>
      <h1>Distributor Price List</h1>
      <div class="subtitle">Effective 2026 • All prices in GBP (£)</div>
    </div>

    <div class="content">

      ${productsHTML}

      <div class="footer">
        <strong>Terms & Conditions</strong>
        <p>• Prices are subject to change without notice</p>
        <p>• RRP prices are recommended retail prices for end customers</p>
        <p>• All prices exclude VAT and shipping</p>
        <p class="generated">Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>
    </div>
  </div>
</body>
</html>`;

  return html;
}

async function generateHTML_File(typeFilter = null, suffix = '') {
  const typeMsg = typeFilter ? ` (${typeFilter.toUpperCase()})` : '';
  console.log(`🎨 Generating Distributor Price List HTML${typeMsg}...\n`);

  // Fetch products
  const products = await fetchAllProducts(typeFilter);

  // Organize by type and category
  console.log('📂 Organizing products by type and category...');
  const organized = organizeByTypeAndCategory(products);

  // List all included categories
  console.log('\n📋 Categories included in this PDF:');
  Object.keys(organized).sort().forEach(type => {
    const categories = Object.keys(organized[type]).sort();
    categories.forEach(category => {
      const count = organized[type][category].length;
      console.log(`   • ${category} (${count} products)`);
    });
  });
  console.log('');

  // Read and encode logo
  console.log('🖼️  Loading company logo...');
  const logoBuffer = fs.readFileSync(logoPath);
  const logoBase64 = logoBuffer.toString('base64');

  // Generate HTML
  console.log('📄 Generating HTML...');
  const html = generateHTML(organized, logoBase64);

  const filename = `Distributor-Price-List${suffix}.html`;
  fs.writeFileSync(filename, html);

  console.log(`\n✅ HTML file generated: ${filename}`);
  console.log(`📊 Total products: ${products.length}`);
  console.log(`📁 Types: ${Object.keys(organized).length}`);

  const totalCategories = Object.values(organized).reduce((sum, type) =>
    sum + Object.keys(type).length, 0
  );
  console.log(`🏷️  Categories: ${totalCategories}\n`);
}

async function main() {
  // Generate separate price lists for tools and consumables
  await generateHTML_File('tool', '-Tools');
  await generateHTML_File('consumable', '-Consumables');

  console.log(`📝 Next steps:`);
  console.log(`   1. Open the HTML files in your browser`);
  console.log(`   2. Click "Print to PDF" button (or press Ctrl+P)`);
  console.log(`   3. Select "Save as PDF" as printer`);
  console.log(`   4. Save as appropriate filename\n`);
  console.log(`📄 Files created:`);
  console.log(`   • Distributor-Price-List-Tools.html`);
  console.log(`   • Distributor-Price-List-Consumables.html`);
}

main().catch(console.error);
