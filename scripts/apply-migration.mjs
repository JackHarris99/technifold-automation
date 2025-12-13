// Apply migration to Supabase using direct SQL execution
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://pziahtfkagyykelkxmah.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6aWFodGZrYWd5eWtlbGt4bWFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njg5ODg3OCwiZXhwIjoyMDcyNDc0ODc4fQ.32bWzm9r50lYJ9xiKaFvZHzh5b0aFUCQOIMGuDfzI3A';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

console.log('🔄 Applying migration: 20250128_01_add_invoice_fields.sql');
console.log('━'.repeat(80));

// Read migration file
const migrationSQL = readFileSync('supabase/migrations/20250128_01_add_invoice_fields.sql', 'utf-8');

// Split into individual statements
const statements = migrationSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`Found ${statements.length} SQL statements to execute\n`);

// Execute each statement
for (let i = 0; i < statements.length; i++) {
  const statement = statements[i];

  // Skip comment blocks
  if (statement.startsWith('/*') || statement === '') continue;

  const preview = statement.replace(/\s+/g, ' ').substring(0, 70);
  console.log(`[${i + 1}/${statements.length}] ${preview}...`);

  try {
    // Use PostgREST to execute raw SQL (if available)
    // Note: This requires a custom function or direct database access
    // For now, we'll use ALTER TABLE via REST API patterns

    // Most migrations are ALTER TABLE or CREATE INDEX which we can't do via REST API
    // We need to apply this via Supabase Dashboard or psql
    console.log('   ⚠️  Skipping (requires direct database access)');

  } catch (err) {
    console.error(`   ❌ Error:`, err.message);
  }
}

console.log('\n━'.repeat(80));
console.log('⚠️  MIGRATION REQUIRES MANUAL APPLICATION');
console.log('\nPlease apply this migration via one of these methods:');
console.log('1. Supabase Dashboard → SQL Editor → Paste migration SQL');
console.log('2. Use supabase CLI: supabase db push');
console.log('3. Connect via psql and run the migration file');
console.log('\nMigration file: supabase/migrations/20250128_01_add_invoice_fields.sql');
