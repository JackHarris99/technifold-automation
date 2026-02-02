import * as fs from 'fs';
import * as path from 'path';
import ExcelJS from 'exceljs';

// Helper function to parse CSV lines with quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function main() {
  console.log('Reading stock_list_enriched_v8.csv...');
  const csvPath = path.join(process.cwd(), 'stock_list_enriched_v8.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const csvLines = csvContent.trim().split('\n');

  // Parse header
  const headerParts = parseCSVLine(csvLines[0]);

  // Find column indices
  const colIndices: any = {};
  headerParts.forEach((header, index) => {
    colIndices[header] = index;
  });

  // Create workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Stock List');

  // Define columns with headers
  worksheet.columns = [
    { header: 'Product Code', key: 'productCode', width: 20 },
    { header: 'Description', key: 'description', width: 50 },
    { header: 'New Sales Price', key: 'newSalesPrice', width: 15 },
    { header: 'Cost Price', key: 'costPrice', width: 12 },
    { header: 'Full Price Margin %', key: 'fullPriceMargin', width: 18 },
    { header: '', key: 'gap1', width: 3 },
    { header: '', key: 'gap2', width: 3 },
    { header: 'New Distributor Price', key: 'newDistPrice', width: 20 },
    { header: 'Cost Price', key: 'costPrice2', width: 12 },
    { header: 'Distributor Margin %', key: 'distMargin', width: 18 },
    { header: '', key: 'gap3', width: 3 },
    { header: '', key: 'gap4', width: 3 },
    { header: 'Type', key: 'type', width: 15 },
    { header: 'Category', key: 'category', width: 20 },
    { header: '', key: 'gap5', width: 3 },
    { header: 'Distributor %', key: 'distributorPercent', width: 15 }
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD3D3D3' }
  };

  // Process each data row
  for (let i = 1; i < csvLines.length; i++) {
    const line = csvLines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);

    const productCode = parts[colIndices['Product Code']] || '';
    const description = parts[colIndices['Description']] || '';
    const newSalesPrice = parseFloat(parts[colIndices['New Sales Price']]) || 0;
    const costPrice = parseFloat(parts[colIndices['Cost Price']]) || 0;
    const type = parts[colIndices['Type']] || '';
    const category = parts[colIndices['Category']] || '';
    const newDistributorPrice = parseFloat(parts[colIndices['New Distributor Price']]) || 0;
    const newDistributorPercent = parts[colIndices['New Distributor Price %']] || '';

    // Calculate Full Price Margin % = (Sales - Cost) / Sales × 100
    let fullPriceMargin = '';
    if (newSalesPrice > 0 && costPrice > 0) {
      fullPriceMargin = (((newSalesPrice - costPrice) / newSalesPrice) * 100).toFixed(1);
    }

    // Calculate Distributor Margin % = (Dist Price - Cost) / Dist Price × 100
    let distributorMargin = '';
    if (newDistributorPrice > 0 && costPrice > 0) {
      distributorMargin = (((newDistributorPrice - costPrice) / newDistributorPrice) * 100).toFixed(1);
    }

    const row = worksheet.addRow({
      productCode,
      description,
      newSalesPrice: newSalesPrice || '',
      costPrice: costPrice || '',
      fullPriceMargin,
      gap1: '',
      gap2: '',
      newDistPrice: newDistributorPrice || '',
      costPrice2: costPrice || '',
      distMargin: distributorMargin,
      gap3: '',
      gap4: '',
      type,
      category,
      gap5: '',
      distributorPercent: newDistributorPercent
    });

    // Highlight row in red if no distributor price
    if (!newDistributorPrice || newDistributorPrice === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF0000' }
        };
        cell.font = { color: { argb: 'FFFFFFFF' } }; // White text
      });
    }
  }

  // Write file
  const outputPath = path.join(process.cwd(), 'stock_list_enriched_v9.xlsx');
  await workbook.xlsx.writeFile(outputPath);

  const totalRows = worksheet.rowCount - 1; // Exclude header
  const highlightedRows = worksheet.rowCount - 1 - csvLines.filter((line, idx) => {
    if (idx === 0) return false; // Skip header
    const parts = parseCSVLine(line);
    const distPrice = parseFloat(parts[colIndices['New Distributor Price']]) || 0;
    return distPrice > 0;
  }).length;

  console.log(`\n✓ Created stock_list_enriched_v9.xlsx with ${totalRows} products`);
  console.log(`- Products with distributor pricing: ${totalRows - highlightedRows}`);
  console.log(`- Products WITHOUT distributor pricing (highlighted in red): ${highlightedRows}`);
  console.log(`Saved to: ${outputPath}`);
}

main().catch(console.error);
