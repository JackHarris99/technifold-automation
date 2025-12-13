/**
 * Live Supabase Schema Inspector
 * Connects to production database and reports actual current state
 */

import { getSupabaseClient } from '../src/lib/supabase';

const supabase = getSupabaseClient();

async function inspectSchema() {
  console.log('🔍 INSPECTING LIVE SUPABASE DATABASE');
  console.log('=' .repeat(80));
  console.log('URL:', process.env.SUPABASE_URL);
  console.log('Time:', new Date().toISOString());
  console.log('\n');

  // Table list to check
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

  const results: any[] = [];

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table.padEnd(30)} - NOT FOUND or ERROR: ${error.message}`);
        results.push({ table, exists: false, count: null, error: error.message });
      } else {
        const countStr = count?.toLocaleString() || '0';
        console.log(`✅ ${table.padEnd(30)} - ${countStr.padStart(10)} rows`);
        results.push({ table, exists: true, count, error: null });
      }
    } catch (e: any) {
      console.log(`❌ ${table.padEnd(30)} - EXCEPTION: ${e.message}`);
      results.push({ table, exists: false, count: null, error: e.message });
    }
  }

  // Check key table schemas by fetching one row
  console.log('\n\n🔧 TABLE SCHEMAS (first row column inspection):');
  console.log('-'.repeat(80));

  const schemasToInspect = ['companies', 'orders', 'subscriptions', 'products', 'contacts'];

  for (const table of schemasToInspect) {
    const tableResult = results.find(r => r.table === table);
    if (!tableResult?.exists) {
      console.log(`\n❌ ${table}: Table not found`);
      continue;
    }

    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`\n❌ ${table}: Error fetching - ${error.message}`);
      } else if (!data || data.length === 0) {
        console.log(`\n⚠️  ${table}: Table exists but has 0 rows`);
      } else {
        const columns = Object.keys(data[0]);
        console.log(`\n✅ ${table} (${columns.length} columns):`);
        console.log(`   ${columns.join(', ')}`);
      }
    } catch (e: any) {
      console.log(`\n❌ ${table}: Exception - ${e.message}`);
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
      const { data, error } = await supabase
        .from(view)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ ${view.padEnd(40)} - NOT FOUND`);
      } else {
        const colCount = data && data.length > 0 ? Object.keys(data[0]).length : 0;
        console.log(`✅ ${view.padEnd(40)} - ${colCount} columns`);
      }
    } catch (e: any) {
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
  console.log('=' .repeat(80));
}

inspectSchema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
