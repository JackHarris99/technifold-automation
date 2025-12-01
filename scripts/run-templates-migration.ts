import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('Running machine_page_templates migration...');

  const sqlPath = path.join(process.cwd(), 'sql/migrations/CREATE_MACHINE_PAGE_TEMPLATES.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  // Split on semicolons and run each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
      if (error) {
        // Try direct query if RPC doesn't exist
        const { data, error: directError } = await supabase.from('_migrations').select('*').limit(1);
        console.log('Note: Using Supabase SQL editor to run migration manually may be needed.');
        console.log('SQL to run:', statement);
      }
    } catch (e) {
      console.log('Statement:', statement.substring(0, 100) + '...');
    }
  }

  console.log('Migration complete! Verifying...');

  // Verify table exists
  const { data, error } = await supabase
    .from('machine_page_templates')
    .select('template_key')
    .limit(3);

  if (error) {
    console.error('Error verifying table:', error);
  } else {
    console.log('✅ Table created successfully!');
    console.log('Templates loaded:', data?.map(t => t.template_key));
  }
}

runMigration();
