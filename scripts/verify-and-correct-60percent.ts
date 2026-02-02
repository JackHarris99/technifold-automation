import * as fs from 'fs';
import * as path from 'path';

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

function escapeCSVField(field: any): string {
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

async function main() {
  console.log('Reading stock_list_enriched_v11.csv...');
  const v11Path = path.join(process.cwd(), 'stock_list_enriched_v11.csv');
  const v11Content = fs.readFileSync(v11Path, 'utf-8');
  const v11Lines = v11Content.trim().split('\n');

  // Parse header
  const headers = parseCSVLine(v11Lines[0]);
  const colIndices: any = {};
  headers.forEach((header, index) => {
    colIndices[header] = index;
  });

  const output = [];
  const corrections = [];
  let correctedCount = 0;

  // Process each row
  for (let i = 1; i < v11Lines.length; i++) {
    const line = v11Lines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);

    const productCode = parts[colIndices['Product Code']] || '';
    const description = parts[colIndices['Description']] || '';
    const type = parts[colIndices['Type']] || '';
    const category = parts[colIndices['Category']] || '';
    const oldSalesPrice = parts[colIndices['Old Sales Price']] || '';
    const newSalesPrice = parseFloat(parts[colIndices['New Sales Price']]) || 0;
    const salesDiff = parts[colIndices['Difference']] || '';
    const salesPercentDiff = parts[colIndices['Percentage Difference']] || '';
    const oldDistributorPrice = parts[colIndices['Old Distributor Price']] || '';
    const currentNewDistPrice = parseFloat(parts[colIndices['New Distributor Price']]) || 0;

    // Calculate what the distributor price SHOULD be (60% of new sales price)
    const correctNewDistPrice = newSalesPrice > 0 ? newSalesPrice * 0.60 : 0;

    // Check if it needs correction (allow small floating point differences)
    let newDistributorPrice = currentNewDistPrice;
    const tolerance = 0.01; // 1 penny tolerance

    if (newSalesPrice > 0 && Math.abs(currentNewDistPrice - correctNewDistPrice) > tolerance) {
      // Needs correction
      newDistributorPrice = parseFloat(correctNewDistPrice.toFixed(2));
      correctedCount++;

      corrections.push({
        productCode,
        description,
        newSalesPrice,
        oldDistPrice: currentNewDistPrice,
        correctedDistPrice: newDistributorPrice,
        difference: (newDistributorPrice - currentNewDistPrice).toFixed(2)
      });
    }

    // Recalculate distributor price differences with corrected price
    const distDiff = newDistributorPrice > 0 && oldDistributorPrice
      ? (newDistributorPrice - parseFloat(oldDistributorPrice)).toFixed(2)
      : '';

    const distPercentDiff = newDistributorPrice > 0 && oldDistributorPrice && parseFloat(oldDistributorPrice) > 0
      ? (((newDistributorPrice - parseFloat(oldDistributorPrice)) / parseFloat(oldDistributorPrice)) * 100).toFixed(1)
      : '';

    output.push({
      'Product Code': productCode,
      'Description': description,
      'Type': type,
      'Category': category,
      '': '',
      'Old Sales Price': oldSalesPrice,
      'New Sales Price': newSalesPrice || '',
      'Difference': salesDiff,
      'Percentage Difference': salesPercentDiff,
      ' ': '',
      '  ': '',
      'Old Distributor Price': oldDistributorPrice,
      'New Distributor Price': newDistributorPrice || '',
      'Difference ': distDiff,
      'Percentage Difference ': distPercentDiff
    });
  }

  console.log(`\nProcessed ${output.length} products`);
  console.log(`Corrected ${correctedCount} distributor prices to be exactly 60%`);

  if (corrections.length > 0) {
    console.log('\nCorrected products:');
    corrections.slice(0, 10).forEach(c => {
      console.log(`  ${c.productCode}: Sales £${c.newSalesPrice} → Dist was £${c.oldDistPrice}, corrected to £${c.correctedDistPrice} (${c.difference > 0 ? '+' : ''}${c.difference})`);
    });
    if (corrections.length > 10) {
      console.log(`  ... and ${corrections.length - 10} more`);
    }
  }

  // Create CSV
  const outputHeaders = [
    'Product Code',
    'Description',
    'Type',
    'Category',
    '',
    'Old Sales Price',
    'New Sales Price',
    'Difference',
    'Percentage Difference',
    ' ',
    '  ',
    'Old Distributor Price',
    'New Distributor Price',
    'Difference ',
    'Percentage Difference '
  ];

  let csvOutput = outputHeaders.join(',') + '\n';
  for (const row of output) {
    csvOutput += outputHeaders.map(h => escapeCSVField(row[h])).join(',') + '\n';
  }

  // Write file
  const outputPath = path.join(process.cwd(), 'stock_list_enriched_v12.csv');
  fs.writeFileSync(outputPath, csvOutput);

  console.log(`\n✓ Created stock_list_enriched_v12.csv with corrected pricing`);
  console.log(`Saved to: ${outputPath}`);
}

main().catch(console.error);
