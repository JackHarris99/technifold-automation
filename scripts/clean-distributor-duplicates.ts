import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// OEM companies with multiple legitimate entities - DO NOT merge these
const OEM_PATTERNS = ['heidelberg', 'xerox', 'muller martini', 'komori', 'konica minolta', 'canon', 'ricoh', 'hp inc'];

function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
}

function isOEM(companyName: string): boolean {
  const normalized = normalizeCompanyName(companyName);
  return OEM_PATTERNS.some(oem => normalized.includes(oem));
}

function areNamesSimilar(name1: string, name2: string): boolean {
  const norm1 = normalizeCompanyName(name1);
  const norm2 = normalizeCompanyName(name2);

  // Exact match
  if (norm1 === norm2) return true;

  // One contains the other (and not just common words)
  if (norm1.length > 5 && norm2.length > 5) {
    if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
  }

  return false;
}

async function main() {
  console.log('=== STEP 1: Find Duplicates ===\n');

  // Get all distributors with their info
  const { data: distributors, error: distError } = await supabase
    .from('companies')
    .select(`
      company_id,
      sage_customer_code,
      company_name,
      source
    `)
    .eq('type', 'distributor')
    .order('company_name');

  if (distError || !distributors) {
    console.error('Error fetching distributors:', distError);
    return;
  }

  console.log(`Total distributors: ${distributors.length}`);

  // Get order history
  const { data: orderHistory } = await supabase
    .from('company_product_history')
    .select('company_id, product_code');

  const companiesWithOrders = new Set(orderHistory?.map(o => o.company_id) || []);

  // Get contact counts
  const { data: contacts } = await supabase
    .from('contacts')
    .select('company_id');

  const contactCounts = new Map<string, number>();
  contacts?.forEach(c => {
    contactCounts.set(c.company_id, (contactCounts.get(c.company_id) || 0) + 1);
  });

  // Categorize distributors
  const sageWithOrders: any[] = [];
  const sageNoOrders: any[] = [];
  const pipedriveNoOrders: any[] = [];

  distributors.forEach(d => {
    const hasOrders = companiesWithOrders.has(d.company_id);
    const hasSage = !!d.sage_customer_code;
    const contactCount = contactCounts.get(d.company_id) || 0;

    const enriched = { ...d, hasOrders, contactCount };

    if (hasSage && hasOrders) {
      sageWithOrders.push(enriched);
    } else if (hasSage && !hasOrders) {
      sageNoOrders.push(enriched);
    } else if (!hasSage && !hasOrders) {
      pipedriveNoOrders.push(enriched);
    }
  });

  console.log(`\nCategories:`);
  console.log(`  Sage + Orders: ${sageWithOrders.length} (KEEP)`);
  console.log(`  Sage, No Orders: ${sageNoOrders.length} (KEEP)`);
  console.log(`  No Sage, No Orders: ${pipedriveNoOrders.length} (CHECK FOR DUPLICATES)`);

  // Find duplicates
  const duplicatesFound: Array<{ original: any; duplicate: any; reason: string }> = [];
  const allSageCompanies = [...sageWithOrders, ...sageNoOrders];

  for (const pipedrive of pipedriveNoOrders) {
    // Skip if OEM
    if (isOEM(pipedrive.company_name)) {
      console.log(`\n⚠️  Skipping OEM: ${pipedrive.company_name}`);
      continue;
    }

    // Find matching Sage company
    for (const sage of allSageCompanies) {
      // Skip if comparing two OEMs
      if (isOEM(sage.company_name)) continue;

      if (areNamesSimilar(sage.company_name, pipedrive.company_name)) {
        duplicatesFound.push({
          original: sage,
          duplicate: pipedrive,
          reason: 'Similar name match'
        });
        break;
      }
    }
  }

  console.log(`\n\n=== DUPLICATES FOUND: ${duplicatesFound.length} ===\n`);

  if (duplicatesFound.length > 0) {
    console.log('Sample duplicates (first 10):');
    duplicatesFound.slice(0, 10).forEach(({ original, duplicate }) => {
      console.log(`  ✓ "${original.company_name}" (${original.sage_customer_code}) <- "${duplicate.company_name}" (${duplicate.contactCount} contacts)`);
    });
  }

  console.log(`\n\n=== STEP 2: Process Duplicates ===\n`);

  let transferredContacts = 0;
  let deletedDuplicates = 0;

  for (const { original, duplicate } of duplicatesFound) {
    // Transfer contacts
    if (duplicate.contactCount > 0) {
      const { error: contactError } = await supabase
        .from('contacts')
        .update({ company_id: original.company_id })
        .eq('company_id', duplicate.company_id);

      if (contactError) {
        console.error(`  ✗ Error transferring contacts from ${duplicate.company_name}:`, contactError.message);
        continue;
      }

      transferredContacts += duplicate.contactCount;
      console.log(`  ✓ Transferred ${duplicate.contactCount} contacts: "${duplicate.company_name}" → "${original.company_name}"`);
    }

    // Delete duplicate company
    const { error: deleteError } = await supabase
      .from('companies')
      .delete()
      .eq('company_id', duplicate.company_id);

    if (deleteError) {
      console.error(`  ✗ Error deleting ${duplicate.company_name}:`, deleteError.message);
    } else {
      deletedDuplicates++;
    }
  }

  console.log(`\n✓ Transferred ${transferredContacts} contacts`);
  console.log(`✓ Deleted ${deletedDuplicates} duplicate companies`);

  console.log(`\n\n=== STEP 3: Convert Non-Duplicates to Prospects ===\n`);

  // Find remaining pipedrive companies (not duplicates)
  const duplicateIds = new Set(duplicatesFound.map(d => d.duplicate.company_id));
  const remainingPipedrive = pipedriveNoOrders.filter(p => !duplicateIds.has(p.company_id));

  console.log(`Remaining no-sage, no-order distributors: ${remainingPipedrive.length}`);
  console.log(`Converting to prospects...`);

  let convertedToProspect = 0;

  for (const company of remainingPipedrive) {
    const { error } = await supabase
      .from('companies')
      .update({ type: 'prospect', updated_at: new Date().toISOString() })
      .eq('company_id', company.company_id);

    if (error) {
      console.error(`  ✗ Error converting ${company.company_name}:`, error.message);
    } else {
      convertedToProspect++;
      if (convertedToProspect % 50 === 0) {
        console.log(`  Converted ${convertedToProspect}/${remainingPipedrive.length}...`);
      }
    }
  }

  console.log(`\n✓ Converted ${convertedToProspect} companies to prospects`);

  console.log(`\n\n=== SUMMARY ===`);
  console.log(`✓ Duplicates merged: ${deletedDuplicates}`);
  console.log(`✓ Contacts transferred: ${transferredContacts}`);
  console.log(`✓ Converted to prospects: ${convertedToProspect}`);
  console.log(`✓ Remaining distributors: ${sageWithOrders.length + sageNoOrders.length}`);
}

main().catch(console.error);
