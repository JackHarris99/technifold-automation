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
  console.log('Reading stock_list_enriched_v5.csv...');
  const csvPath = path.join(process.cwd(), 'stock_list_enriched_v5.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const csvLines = csvContent.trim().split('\n');

  // Parse header
  const headers = parseCSVLine(csvLines[0]);
  console.log(`Found ${csvLines.length - 1} total products in V5`);

  // Find Gina Pricing column index
  const ginaPricingIndex = headers.indexOf('Gina Pricing');

  const filteredLines = [csvLines[0]]; // Keep header

  // Filter for rows with Gina pricing
  for (let i = 1; i < csvLines.length; i++) {
    const line = csvLines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);
    const ginaPrice = parts[ginaPricingIndex];

    // Include only if Gina pricing exists and is not empty
    if (ginaPrice && ginaPrice !== '') {
      filteredLines.push(line);
    }
  }

  console.log(`Filtered to ${filteredLines.length - 1} products with Gina pricing`);

  // Write file
  const outputPath = path.join(process.cwd(), 'stock_list_enriched_v6.csv');
  fs.writeFileSync(outputPath, filteredLines.join('\n'));

  console.log(`\n✓ Created stock_list_enriched_v6.csv with ${filteredLines.length - 1} products`);
  console.log(`Saved to: ${outputPath}`);
}

main().catch(console.error);
