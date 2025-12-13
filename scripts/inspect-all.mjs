// Complete Supabase Schema Inspector - Gets ALL tables
const SUPABASE_URL = 'https://pziahtfkagyykelkxmah.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6aWFodGZrYWd5eWtlbGt4bWFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njg5ODg3OCwiZXhwIjoyMDcyNDc0ODc4fQ.32bWzm9r50lYJ9xiKaFvZHzh5b0aFUCQOIMGuDfzI3A';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'count=exact'
};

console.log('🔍 COMPLETE SUPABASE SCHEMA INSPECTION');
console.log('='.repeat(80));
console.log('URL:', SUPABASE_URL);
console.log('Time:', new Date().toISOString());
console.log('\n');

// First, get ALL tables from information_schema
console.log('📋 DISCOVERING ALL TABLES...');
console.log('-'.repeat(80));

// Query PostgreSQL system catalog via PostgREST
// We'll use a raw SQL query via RPC if available, or try to list tables by trial and error

// Common table names to try (expanded list)
const commonTables = [
  // Core business
  'companies', 'contacts', 'products', 'machines',

  // Orders & Commerce
  'orders', 'order_items', 'orders_legacy', 'order_items_legacy',
  'quotes', 'quote_items',

  // Subscriptions
  'subscriptions', 'subscription_events', 'rental_agreements',
  'subscription_anomalies', 'trial_intents',

  // Tracking & Events
  'engagement_events', 'contact_interactions', 'outbox',

  // Sales & CRM
  'users', 'campaigns', 'campaign_sends',

  // Content & Marketing
  'machine_page_templates', 'content_blocks', 'brand_media',
  'problems', 'solutions', 'solution_problem', 'machine_solution_problem',
  'problem_solution_blocks',

  // Product relationships
  'tool_consumable_map', 'tool_brand_compatibility',

  // Company data
  'company_machine', 'shipping_addresses', 'shipping_manifests',

  // Legacy/other
  'sales', 'invoices', 'payments',

  // System
  'migrations', 'schema_migrations'
];

const results = [];

console.log('Checking tables...\n');

for (const table of commonTables) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?limit=0`,
      { headers }
    );

    if (response.ok) {
      const contentRange = response.headers.get('content-range');
      const count = contentRange ? parseInt(contentRange.split('/')[1]) : 0;
      const countStr = count.toLocaleString().padStart(10);
      console.log(`✅ ${table.padEnd(35)} - ${countStr} rows`);
      results.push({ table, exists: true, count });
    }
  } catch (e) {
    // Silently skip - table doesn't exist
  }
}

// Get detailed schema for all found tables
console.log('\n\n🔧 DETAILED TABLE SCHEMAS:');
console.log('-'.repeat(80));

for (const result of results.filter(r => r.exists)) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${result.table}?limit=1`,
      { headers }
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        console.log(`\n📋 ${result.table} (${result.count.toLocaleString()} rows, ${columns.length} columns):`);

        // Group columns by type for readability
        const ids = columns.filter(c => c.includes('_id') || c === 'id');
        const timestamps = columns.filter(c => c.includes('_at') || c.includes('date'));
        const stripe = columns.filter(c => c.includes('stripe'));
        const zoho = columns.filter(c => c.includes('zoho') || c.includes('books'));
        const other = columns.filter(c =>
          !ids.includes(c) &&
          !timestamps.includes(c) &&
          !stripe.includes(c) &&
          !zoho.includes(c)
        );

        if (ids.length) console.log(`   IDs: ${ids.join(', ')}`);
        if (other.length) console.log(`   Fields: ${other.join(', ')}`);
        if (timestamps.length) console.log(`   Timestamps: ${timestamps.join(', ')}`);
        if (stripe.length) console.log(`   Stripe: ${stripe.join(', ')}`);
        if (zoho.length) console.log(`   Zoho: ${zoho.join(', ')}`);
      } else {
        console.log(`\n⚠️  ${result.table} (0 rows)`);
      }
    }
  } catch (e) {
    console.log(`\n❌ ${result.table}: Error getting schema - ${e.message}`);
  }
}

// Check views
console.log('\n\n👁️  CHECKING VIEWS:');
console.log('-'.repeat(80));

const possibleViews = [
  'v_active_subscriptions',
  'v_subscription_anomalies',
  'vw_company_consumable_payload',
  'vw_company_consumable_payload_v2',
  'v_companies_with_metrics',
  'v_compatibility',
  'v_machine_solution_problem',
  'v_machine_solution_problem_full',
  'v_problem_solution_machine'
];

for (const view of possibleViews) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${view}?limit=1`,
      { headers }
    );

    if (response.ok) {
      const data = await response.json();
      const colCount = data && data.length > 0 ? Object.keys(data[0]).length : 0;
      console.log(`✅ ${view.padEnd(45)} - ${colCount} columns`);
    }
  } catch (e) {
    // Skip
  }
}

// Summary
console.log('\n\n📈 COMPLETE SUMMARY:');
console.log('-'.repeat(80));
const totalTables = results.filter(r => r.exists).length;
const totalRows = results.reduce((sum, r) => sum + (r.count || 0), 0);

console.log(`✅ Total tables found: ${totalTables}`);
console.log(`📊 Total rows across all tables: ${totalRows.toLocaleString()}`);

console.log('\n📋 Tables by category:');
const byCategory = {
  'Core Business': results.filter(r => r.exists && ['companies', 'contacts', 'products', 'machines'].includes(r.table)),
  'Orders & Commerce': results.filter(r => r.exists && r.table.includes('order') || r.table.includes('quote')),
  'Subscriptions': results.filter(r => r.exists && (r.table.includes('subscription') || r.table.includes('rental') || r.table.includes('trial'))),
  'Tracking & Events': results.filter(r => r.exists && (r.table.includes('engagement') || r.table.includes('interaction') || r.table === 'outbox')),
  'Sales & Marketing': results.filter(r => r.exists && (r.table.includes('campaign') || r.table === 'users')),
  'Content & Media': results.filter(r => r.exists && (r.table.includes('content') || r.table.includes('template') || r.table.includes('media') || r.table.includes('problem') || r.table.includes('solution'))),
  'Product Relationships': results.filter(r => r.exists && r.table.includes('map') || r.table.includes('compatibility')),
  'Other': results.filter(r => r.exists && !Object.values(byCategory).flat().includes(r))
};

for (const [category, tables] of Object.entries(byCategory)) {
  if (tables.length > 0) {
    console.log(`\n${category} (${tables.length}):`);
    tables.forEach(t => {
      console.log(`  - ${t.table} (${t.count.toLocaleString()} rows)`);
    });
  }
}

console.log('\n✅ Complete schema inspection finished!');
console.log('='.repeat(80));
