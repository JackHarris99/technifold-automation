/**
 * Generate slugs for all machines in the database
 * Converts display names to URL-friendly slugs
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Convert string to URL-friendly slug
function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '')      // Trim hyphens from start/end
    .substring(0, 100);            // Limit length
}

async function generateSlugs() {
  console.log('🔍 Fetching all machines...\n');

  const { data: machines, error } = await supabase
    .from('machines')
    .select('machine_id, brand, model, display_name, slug');

  if (error) {
    console.error('❌ Error fetching machines:', error);
    process.exit(1);
  }

  console.log(`Found ${machines.length} machines\n`);

  let updated = 0;
  let skipped = 0;
  const slugs = new Set();

  for (const machine of machines) {
    // Skip if slug already exists
    if (machine.slug && machine.slug !== 'null') {
      skipped++;
      continue;
    }

    // Generate slug from display_name, or fall back to brand + model
    let baseSlug = machine.display_name
      ? generateSlug(machine.display_name)
      : generateSlug(`${machine.brand} ${machine.model}`);

    // Ensure uniqueness by appending number if needed
    let slug = baseSlug;
    let counter = 1;
    while (slugs.has(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    slugs.add(slug);

    // Update the machine
    const { error: updateError } = await supabase
      .from('machines')
      .update({ slug })
      .eq('machine_id', machine.machine_id);

    if (updateError) {
      console.error(`❌ Failed to update ${machine.display_name}:`, updateError);
    } else {
      console.log(`✅ ${machine.display_name}`);
      console.log(`   → /machines/${slug}\n`);
      updated++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${machines.length}`);
}

generateSlugs().catch(console.error);
