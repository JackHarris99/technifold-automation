import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const envFile = readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
const envVars: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match && !line.startsWith('#')) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabase = createClient(envVars.SUPABASE_URL!, envVars.SUPABASE_SERVICE_ROLE_KEY!);

async function getAllSchema() {
  const knownTables = [
    'companies', 'contacts', 'products', 'machines',
    'orders', 'order_items', 'orders_legacy', 'order_items_legacy',
    'subscriptions', 'subscription_events', 'shipping_manifests',
    'engagement_events', 'outbox', 'brand_media', 'content_blocks',
    'tool_consumable_map', 'tool_brand_compatibility',
    'company_machine', 'users', 'rental_agreements', 'shipping_addresses',
    'campaigns', 'campaign_sends'
  ];

  console.log('=== DATABASE TABLES & ROW COUNTS ===\n');
  for (const table of knownTables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    const status = error ? 'NOT FOUND' : `${count} rows`;
    console.log(`${table.padEnd(40)} ${status}`);
  }

  const knownViews = [
    'v_active_subscriptions',
    'vw_company_consumable_payload'
  ];

  console.log('\n=== DATABASE VIEWS ===\n');
  for (const view of knownViews) {
    const { count, error } = await supabase
      .from(view)
      .select('*', { count: 'exact', head: true });

    const status = error ? 'NOT FOUND' : `${count} rows`;
    console.log(`${view.padEnd(40)} ${status}`);
  }

  // Get subscriptions table structure
  console.log('\n=== SUBSCRIPTIONS TABLE STRUCTURE ===\n');
  const { data: subs } = await supabase
    .from('subscriptions')
    .select('*')
    .limit(1);
  if (subs && subs.length > 0) {
    console.log(JSON.stringify(subs[0], null, 2));
  } else {
    console.log('No subscriptions found');
  }

  // Get subscription events
  console.log('\n=== SUBSCRIPTION EVENTS TABLE STRUCTURE ===\n');
  const { data: events } = await supabase
    .from('subscription_events')
    .select('*')
    .limit(1);
  if (events && events.length > 0) {
    console.log(JSON.stringify(events[0], null, 2));
  } else {
    console.log('No subscription events found');
  }

  // Get users table
  console.log('\n=== USERS TABLE ===\n');
  const { data: users } = await supabase
    .from('users')
    .select('user_id, username, role, territories');
  console.log(JSON.stringify(users, null, 2));

  // Check company structure more thoroughly
  console.log('\n=== COMPANY FIELDS ===\n');
  const { data: oneCompany } = await supabase
    .from('companies')
    .select('*')
    .limit(1);
  if (oneCompany && oneCompany.length > 0) {
    console.log('Fields:', Object.keys(oneCompany[0]).join(', '));
  }
}

getAllSchema().catch(console.error).finally(() => process.exit(0));
