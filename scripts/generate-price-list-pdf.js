/**
 * Generate Professional Price List PDF for Distributors
 * Organized by Type → Category with images
 */

require('dotenv').config({ path: '.env.local' });
const puppeteer = require('puppeteer');
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

// Logo path
const logoPath = path.join(__dirname, '..', 'public', 'images', 'logo', 'technifold-logo.png');

async function fetchAllProducts() {
  console.log('📦 Fetching all active products...');

  let products = [];
  let offset = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data: batch, error } = await supabase
      .from('products')
      .select('product_code, description, type, category, price, image_url')
      .eq('active', true)
      .order('type', { ascending: true })
      .order('category', { ascending: true })
      .order('product_code', { ascending: true })
      .range(offset, offset + batchSize - 1);

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

  console.log(`✓ Loaded ${products.length} active products\n`);
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
              <th width="120">Product Code</th>
              <th>Description</th>
              <th width="100">Your Price</th>
              <th width="100">RRP</th>
            </tr>
          </thead>
          <tbody>
      `;

      products.forEach(product => {
        const distributorPrice = (product.price * 0.60).toFixed(2);
        const rrp = product.price.toFixed(2);

        const imageHTML = product.image_url
          ? `<img src="${product.image_url}" class="product-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22%3E%3Crect fill=%22%23f0f0f0%22 width=%2260%22 height=%2260%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%228%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E'"/>`
          : `<div class="no-image">Image<br/>Coming<br/>Soon</div>`;

        productsHTML += `
          <tr>
            <td class="image-cell">${imageHTML}</td>
            <td class="code-cell">${product.product_code}</td>
            <td class="desc-cell">${product.description || ''}</td>
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

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.4;
      color: #333;
      background: white;
    }

    .header {
      text-align: center;
      padding: 30px 40px 20px;
      border-bottom: 3px solid #0066cc;
      margin-bottom: 30px;
    }

    .logo {
      max-width: 250px;
      height: auto;
      margin-bottom: 15px;
    }

    .header h1 {
      font-size: 24pt;
      color: #0066cc;
      margin-bottom: 5px;
      font-weight: 600;
    }

    .header .subtitle {
      font-size: 11pt;
      color: #666;
      margin-top: 5px;
    }

    .type-header {
      background: #0066cc;
      color: white;
      padding: 12px 40px;
      margin-top: 25px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }

    .type-header h2 {
      font-size: 16pt;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .category-header {
      background: #f0f4f8;
      padding: 8px 40px;
      margin-top: 15px;
      margin-bottom: 8px;
      border-left: 4px solid #0066cc;
      page-break-after: avoid;
    }

    .category-header h3 {
      font-size: 13pt;
      color: #333;
      font-weight: 600;
    }

    .products-table {
      width: calc(100% - 80px);
      margin: 0 40px 20px;
      border-collapse: collapse;
      page-break-inside: auto;
    }

    .products-table thead {
      background: #f8f9fa;
      border-bottom: 2px solid #dee2e6;
    }

    .products-table th {
      padding: 8px;
      text-align: left;
      font-weight: 600;
      font-size: 9pt;
      color: #495057;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .products-table tbody tr {
      border-bottom: 1px solid #e9ecef;
      page-break-inside: avoid;
    }

    .products-table tbody tr:hover {
      background: #f8f9fa;
    }

    .products-table td {
      padding: 10px 8px;
      vertical-align: middle;
    }

    .image-cell {
      text-align: center;
    }

    .product-image {
      width: 60px;
      height: 60px;
      object-fit: contain;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      background: white;
    }

    .no-image {
      width: 60px;
      height: 60px;
      background: #f0f0f0;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 7pt;
      color: #999;
      text-align: center;
      line-height: 1.2;
      padding: 5px;
    }

    .code-cell {
      font-family: 'Courier New', monospace;
      font-size: 9pt;
      font-weight: 500;
      color: #495057;
    }

    .desc-cell {
      font-size: 9pt;
      color: #333;
    }

    .price-cell {
      text-align: right;
      font-weight: 600;
      font-size: 10pt;
      color: #0066cc;
    }

    @media print {
      .type-header,
      .category-header {
        page-break-after: avoid;
      }

      .products-table {
        page-break-inside: auto;
      }

      .products-table tr {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="data:image/png;base64,${logoBase64}" class="logo" alt="Technifold Logo"/>
    <h1>Distributor Price List</h1>
    <div class="subtitle">Effective March 2025 • All prices in GBP (£)</div>
  </div>

  ${productsHTML}

  <div style="margin: 40px; padding: 20px; border-top: 2px solid #dee2e6; font-size: 9pt; color: #666;">
    <p><strong>Terms & Conditions:</strong></p>
    <p>• Prices are subject to change without notice</p>
    <p>• RRP prices are recommended retail prices for end customers</p>
    <p>• All prices exclude VAT and shipping</p>
  </div>
</body>
</html>
  `;

  return html;
}

async function generatePDF() {
  console.log('🎨 Generating Distributor Price List PDF...\n');

  // Fetch products
  const products = await fetchAllProducts();

  // Organize by type and category
  console.log('📂 Organizing products by type and category...');
  const organized = organizeByTypeAndCategory(products);

  // Read logo file
  console.log('🖼️  Loading company logo...');
  const logoBuffer = fs.readFileSync(logoPath);
  const logoBase64 = logoBuffer.toString('base64');

  // Generate HTML
  console.log('📄 Generating HTML...');
  const html = generateHTML(organized, logoBase64);

  // Launch browser and generate PDF
  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  console.log('📝 Rendering PDF...');
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `Distributor-Price-List-${timestamp}.pdf`;

  await page.pdf({
    path: filename,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0',
      right: '0',
      bottom: '0',
      left: '0'
    }
  });

  await browser.close();

  console.log(`\n✅ PDF generated successfully: ${filename}`);
  console.log(`📊 Total products: ${products.length}`);
  console.log(`📁 Types: ${Object.keys(organized).length}`);

  const totalCategories = Object.values(organized).reduce((sum, type) =>
    sum + Object.keys(type).length, 0
  );
  console.log(`🏷️  Categories: ${totalCategories}`);
}

generatePDF().catch(console.error);
