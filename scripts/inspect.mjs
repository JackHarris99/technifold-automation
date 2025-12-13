// Live Supabase Schema Inspector - uses fetch directly
const SUPABASE_URL = 'https://pziahtfkagyykelkxmah.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6aWFodGZrYWd5eWtlbGt4bWFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njg5ODg3OCwiZXhwIjoyMDcyNDc0ODc4fQ.32bWzm9r50lYJ9xiKaFvZHzh5b0aFUCQOIMGuDfzI3A';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'count=exact'
};

console.log('🔍 INSPECTING LIVE SUPABASE DATABASE');
console.log('='.repeat(80));
console.log('URL:', SUPABASE_URL);
console.log('Time:', new Date().toISOString());
console.log('\n');

const tables = [
  'companies', 'contacts', 'products', 'machines',
  'orders', 'order_items',
  'subscriptions', 'subscription_events',
  'engagement_events', 'outbox',
  'users', 'campaigns',
  'machine_page_templates', 'content_blocks', 'brand_media',
  'tool_consumable_map', 'tool_brand_compatibility',
  'company_machine', 'contact_interactions'
];

console.log('📊 TABLE ROW COUNTS:');
console.log('-'.repeat(80));

const results = [];

for (const table of tables) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?limit=0`,
      { headers }
    );

    if (response.ok) {
      const contentRange = response.headers.get('content-range');
      const count = contentRange ? parseInt(contentRange.split('/')[1]) : 0;
      const countStr = count.toLocaleString().padStart(10);
      console.log(`✅ ${table.padEnd(30)} - ${countStr} rows`);
      results.push({ table, exists: true, count });
    } else {
      console.log(`❌ ${table.padEnd(30)} - NOT FOUND (${response.status})`);
      results.push({ table, exists: false, count: null });
    }
  } catch (e) {
    console.log(`❌ ${table.padEnd(30)} - ERROR: ${e.message}`);
    results.push({ table, exists: false, count: null });
  }
}

// Inspect schemas
console.log('\n\n🔧 TABLE SCHEMAS (column inspection):');
console.log('-'.repeat(80));

const schemasToInspect = ['companies', 'orders', 'subscriptions', 'products', 'contacts', 'engagement_events'];

for (const table of schemasToInspect) {
  const tableResult = results.find(r => r.table === table);
  if (!tableResult?.exists) {
    console.log(`\n❌ ${table}: Table not found`);
    continue;
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?limit=1`,
      { headers }
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        console.log(`\n✅ ${table} (${columns.length} columns):`);
        console.log(`   ${columns.join(', ')}`);
      } else {
        console.log(`\n⚠️  ${table}: Table exists but has 0 rows`);
      }
    } else {
      console.log(`\n❌ ${table}: HTTP ${response.status}`);
    }
  } catch (e) {
    console.log(`\n❌ ${table}: ${e.message}`);
  }
}

// Check views
console.log('\n\n👁️  VIEWS:');
console.log('-'.repeat(80));

const views = [
  'v_active_subscriptions',
  'vw_company_consumable_payload',
  'vw_company_consumable_payload_v2',
  'v_companies_with_metrics'
];

for (const view of views) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${view}?limit=1`,
      { headers }
    );

    if (response.ok) {
      const data = await response.json();
      const colCount = data && data.length > 0 ? Object.keys(data[0]).length : 0;
      console.log(`✅ ${view.padEnd(40)} - Exists (${colCount} columns)`);
    } else {
      console.log(`❌ ${view.padEnd(40)} - NOT FOUND`);
    }
  } catch (e) {
    console.log(`❌ ${view.padEnd(40)} - ERROR: ${e.message}`);
  }
}

// Summary
console.log('\n\n📈 SUMMARY:');
console.log('-'.repeat(80));
const existingTables = results.filter(r => r.exists);
const missingTables = results.filter(r => !r.exists);
const totalRows = existingTables.reduce((sum, r) => sum + (r.count || 0), 0);

console.log(`✅ Tables found: ${existingTables.length}/${tables.length}`);
console.log(`❌ Tables missing: ${missingTables.length}`);
console.log(`📊 Total rows: ${totalRows.toLocaleString()}`);

if (missingTables.length > 0) {
  console.log(`\n⚠️  Missing tables: ${missingTables.map(t => t.table).join(', ')}`);
}

console.log('\n✅ Schema inspection complete!');
console.log('='.repeat(80));
