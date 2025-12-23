/**
 * Verify Fact Table Trigger Exists in Supabase
 * Run with: npx ts-node scripts/verify-trigger.ts
 */

import { getSupabaseClient } from '../src/lib/supabase';

async function verifyTrigger() {
  const supabase = getSupabaseClient();

  console.log('🔍 Checking if trigger exists in database...\n');

  // Query to check if trigger exists
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT
        trigger_name,
        event_object_table,
        action_statement,
        action_timing,
        event_manipulation
      FROM information_schema.triggers
      WHERE trigger_name = 'trigger_update_facts_on_invoice_paid';
    `
  });

  if (error) {
    // Fallback: Try direct query (requires proper permissions)
    console.log('⚠️  RPC method not available, trying direct query...\n');

    const { data: triggerData, error: triggerError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_object_table, action_statement')
      .eq('trigger_name', 'trigger_update_facts_on_invoice_paid');

    if (triggerError) {
      console.error('❌ Could not verify trigger:', triggerError.message);
      console.log('\n💡 Manual verification needed. Run this SQL in Supabase SQL Editor:');
      console.log(`
SELECT
  trigger_name,
  event_object_table,
  action_statement,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_facts_on_invoice_paid';
      `);
      process.exit(1);
    }

    if (!triggerData || triggerData.length === 0) {
      console.error('❌ TRIGGER NOT FOUND!');
      console.log('\n📋 The trigger needs to be deployed. Run this migration:');
      console.log('   sql/migrations/CREATE_FACT_TABLE_TRIGGER.sql');
      process.exit(1);
    }

    console.log('✅ TRIGGER EXISTS!\n');
    console.log('Trigger Details:');
    console.log(JSON.stringify(triggerData[0], null, 2));
    process.exit(0);
  }

  if (!data || data.length === 0) {
    console.error('❌ TRIGGER NOT FOUND!');
    console.log('\n📋 The trigger needs to be deployed. Run this migration:');
    console.log('   sql/migrations/CREATE_FACT_TABLE_TRIGGER.sql');
    process.exit(1);
  }

  console.log('✅ TRIGGER EXISTS!\n');
  console.log('Trigger Details:');
  console.log('  Name:', data[0].trigger_name);
  console.log('  Table:', data[0].event_object_table);
  console.log('  Timing:', data[0].action_timing);
  console.log('  Event:', data[0].event_manipulation);
  console.log('  Function:', data[0].action_statement);
  console.log('\n✅ Fact table trigger is properly deployed!');

  // Also verify the function exists
  console.log('\n🔍 Checking if trigger function exists...\n');

  const { data: funcData, error: funcError } = await supabase.rpc('exec_sql', {
    query: `
      SELECT
        routine_name,
        routine_type
      FROM information_schema.routines
      WHERE routine_name = 'update_facts_on_invoice_paid';
    `
  });

  if (!funcError && funcData && funcData.length > 0) {
    console.log('✅ TRIGGER FUNCTION EXISTS!');
    console.log('  Name:', funcData[0].routine_name);
    console.log('  Type:', funcData[0].routine_type);
  }

  process.exit(0);
}

verifyTrigger().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
