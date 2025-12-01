// Check table column structures
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load env vars
const envFile = readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
const envVars: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1]] = match[2];
});

const supabase = createClient(envVars.SUPABASE_URL!, envVars.SUPABASE_SERVICE_ROLE_KEY!);

async function checkColumns() {
  const tables = ['companies', 'products', 'engagement_events', 'contacts'];

  for (const tableName of tables) {
    console.log(`\n=== ${tableName} columns ===`);
    const { data, error } = await supabase
      .from('information_schema.columns' as any)
      .select('column_name, data_type, is_nullable')
      .eq('table_name', tableName)
      .eq('table_schema', 'public');

    if (error) {
      console.log('Error:', error.message);
    } else if (data) {
      data.forEach((col: any) => {
        console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    }
  }
}

checkColumns().then(() => process.exit(0)).catch(console.error);
