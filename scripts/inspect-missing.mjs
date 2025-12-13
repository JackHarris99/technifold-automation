// Inspect the missing tables and view
const SUPABASE_URL = 'https://pziahtfkagyykelkxmah.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6aWFodGZrYWd5eWtlbGt4bWFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njg5ODg3OCwiZXhwIjoyMDcyNDc0ODc4fQ.32bWzm9r50lYJ9xiKaFvZHzh5b0aFUCQOIMGuDfzI3A';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'count=exact'
};

console.log('🔍 INSPECTING MISSING TABLES & VIEW');
console.log('='.repeat(80));

const itemsToCheck = [
  { name: 'activity_log', type: 'table' },
  { name: 'company_tool', type: 'table' },
  { name: 'quote_requests', type: 'table' },
  { name: 'site_branding', type: 'table' },
  { name: 'catalog_products', type: 'view' }
];

for (const item of itemsToCheck) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`${item.type.toUpperCase()}: ${item.name}`);
  console.log('-'.repeat(80));

  try {
    // Get row count
    const countResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/${item.name}?limit=0`,
      { headers }
    );

    if (!countResponse.ok) {
      console.log(`❌ NOT FOUND (${countResponse.status})`);
      continue;
    }

    const contentRange = countResponse.headers.get('content-range');
    const count = contentRange ? parseInt(contentRange.split('/')[1]) : 0;
    console.log(`✅ Row count: ${count.toLocaleString()}`);

    // Get schema
    const schemaResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/${item.name}?limit=1`,
      { headers }
    );

    if (schemaResponse.ok) {
      const data = await schemaResponse.json();
      if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        console.log(`\n📋 Columns (${columns.length}):`);

        // Categorize columns
        const ids = columns.filter(c => c.includes('_id') || c === 'id');
        const timestamps = columns.filter(c => c.includes('_at') || c.includes('date'));
        const other = columns.filter(c => !ids.includes(c) && !timestamps.includes(c));

        if (ids.length) console.log(`   IDs: ${ids.join(', ')}`);
        if (other.length) console.log(`   Fields: ${other.join(', ')}`);
        if (timestamps.length) console.log(`   Timestamps: ${timestamps.join(', ')}`);

        // Show sample data (first row)
        console.log('\n📄 Sample row (first record):');
        console.log(JSON.stringify(data[0], null, 2));
      } else {
        console.log('\n⚠️  Table/view exists but has 0 rows');
      }
    }
  } catch (e) {
    console.log(`\n❌ Error: ${e.message}`);
  }
}

console.log('\n' + '='.repeat(80));
console.log('✅ Inspection complete!');
