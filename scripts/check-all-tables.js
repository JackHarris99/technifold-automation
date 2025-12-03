const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Tables that exist and are actively used in the codebase
const confirmedTables = [
  'activity_log',
  'brand_media',
  'catalog_products',
  'companies',
  'company_machine',
  'company_tool',
  'contact_interactions',
  'contacts',
  'content_blocks',
  'engagement_events',
  'machines',
  'media',
  'order_items',
  'orders',
  'outbox',
  'products',
  'quote_requests',
  'rental_agreements',
  'rfm_scores',
  'sales',
  'shipping_addresses',
  'shipping_manifests',
  'site_branding',
  'subscription_events',
  'subscriptions',
  'tool_consumable_map',
  'users'
];

async function checkTables() {
  console.log('Checking CONFIRMED tables in Supabase...\n');

  const exists = [];

  for (const table of confirmedTables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (!error) {
        exists.push({ table, count: count || 0, exists: true });
      } else {
        exists.push({ table, count: 0, exists: false, error: error.message });
      }
    } catch (e) {
      exists.push({ table, count: 0, exists: false, error: 'exception' });
    }
  }

  console.log('TABLE STATUS:');
  console.log('==================');
  for (const t of exists) {
    if (t.exists) {
      console.log(`✓ ${t.table}: ${t.count} rows`);
    } else {
      console.log(`✗ ${t.table}: DOES NOT EXIST (${t.error})`);
    }
  }

  console.log('\n==================');
  const realTables = exists.filter(t => t.exists);
  console.log(`Total real tables: ${realTables.length}`);
}

checkTables();
