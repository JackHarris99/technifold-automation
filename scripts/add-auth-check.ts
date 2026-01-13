/**
 * Script to add authentication checks to admin API routes
 * Usage: tsx scripts/add-auth-check.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Routes that are clearly admin-only and need auth
const ROUTES_TO_SECURE = [
  'src/app/api/admin/activity/log/route.ts',
  'src/app/api/admin/addresses/manage/route.ts',
  'src/app/api/admin/brands/route.ts',
  'src/app/api/admin/commission/current/route.ts',
  'src/app/api/admin/commission/team-activities/route.ts',
  'src/app/api/admin/companies/[company_id]/contacts/[contactId]/route.ts',
  'src/app/api/admin/companies/[company_id]/contacts/route.ts',
  'src/app/api/admin/companies/[company_id]/tools/route.ts',
  'src/app/api/admin/companies/[company_id]/update-billing/route.ts',
  'src/app/api/admin/companies/[company_id]/update-status/route.ts',
  'src/app/api/admin/companies/create/route.ts',
  'src/app/api/admin/companies/search/route.ts',
  'src/app/api/admin/contacts/create/route.ts',
  'src/app/api/admin/contacts/list/route.ts',
  'src/app/api/admin/engagement-feed/route.ts',
  'src/app/api/admin/generate-test-reorder-url/route.ts',
  'src/app/api/admin/invoices/preview/route.ts',
  'src/app/api/admin/machines/confirm/route.ts',
  'src/app/api/admin/offers/send/route.ts',
  'src/app/api/admin/orders/[orderId]/route.ts',
  'src/app/api/admin/orders/route.ts',
  'src/app/api/admin/outbox/retry/route.ts',
  'src/app/api/admin/pricing-tiers/route.ts',
  'src/app/api/admin/products/[product_code]/route.ts',
  'src/app/api/admin/products/bulk-upload-image/route.ts',
  'src/app/api/admin/products/link/route.ts',
  'src/app/api/admin/products/list/route.ts',
  'src/app/api/admin/products/search/route.ts',
  'src/app/api/admin/quote/send-email/route.ts',
  'src/app/api/admin/quotes/[quote_id]/notes/route.ts',
  'src/app/api/admin/quotes/[quote_id]/route.ts',
  'src/app/api/admin/quotes/[quote_id]/update-status/route.ts',
  'src/app/api/admin/quotes/create/route.ts',
  'src/app/api/admin/quotes/generate/route.ts',
  'src/app/api/admin/quotes/list/route.ts',
  'src/app/api/admin/reorder/send/route.ts',
  'src/app/api/admin/shipping-addresses/route.ts',
  'src/app/api/admin/shipping-manifests/route.ts',
  'src/app/api/admin/subscription-tools/add/route.ts',
  'src/app/api/admin/subscriptions/[id]/events/route.ts',
  'src/app/api/admin/subscriptions/[id]/route.ts',
  'src/app/api/admin/subscriptions/list/route.ts',
  'src/app/api/admin/subscriptions/manage/route.ts',
  'src/app/api/admin/tasks/[task_id]/complete/route.ts',
  'src/app/api/admin/tasks/[task_id]/dismiss/route.ts',
  'src/app/api/admin/tasks/my-tasks/route.ts',
  'src/app/api/admin/tool-consumables/manage/route.ts',
  'src/app/api/admin/tools/add/route.ts',
  'src/app/api/admin/tools/list/route.ts',
  'src/app/api/admin/tools/sync/route.ts',
  'src/app/api/admin/trials/list/route.ts',
];

const BASE_DIR = '/mnt/c/Users/Jack.Harris/technifold-february/technifold-automation';

function addAuthCheck(filePath: string): boolean {
  const fullPath = path.join(BASE_DIR, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  Skip: ${filePath} (not found)`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');

  // Check if already has getCurrentUser import
  if (content.includes('getCurrentUser')) {
    console.log(`✓ ${filePath} (already has auth)`);
    return false;
  }

  // Check if it's already checking auth in some way
  if (content.includes('Unauthorized') && content.includes('401')) {
    console.log(`✓ ${filePath} (has auth check)`);
    return false;
  }

  // Add getCurrentUser import if not present
  if (!content.includes("import { getCurrentUser }")) {
    // Find the imports section
    const importMatch = content.match(/import .+ from .+;/);
    if (importMatch) {
      const lastImport = importMatch[0];
      const importIndex = content.indexOf(lastImport) + lastImport.length;
      content = content.slice(0, importIndex) + "\nimport { getCurrentUser } from '@/lib/auth';" + content.slice(importIndex);
    }
  }

  // Find all export async function patterns
  const functionPattern = /export async function (GET|POST|PATCH|PUT|DELETE)\s*\(/g;
  let match;
  let modified = false;

  while ((match = functionPattern.exec(content)) !== null) {
    const functionStart = match.index;
    const functionName = match[1];

    // Find the opening brace of the function
    let braceIndex = content.indexOf('{', functionStart);
    if (braceIndex === -1) continue;

    // Find the try block start
    let tryIndex = content.indexOf('try {', braceIndex);
    if (tryIndex === -1 || tryIndex > braceIndex + 200) {
      // No try block nearby, skip
      continue;
    }

    // Check if auth check already exists near the start
    const checkSection = content.slice(tryIndex, tryIndex + 500);
    if (checkSection.includes('getCurrentUser') || checkSection.includes('Unauthorized')) {
      continue;
    }

    // Add auth check after try {
    const authCheck = `
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
`;

    const insertPoint = content.indexOf('{', tryIndex) + 1;
    content = content.slice(0, insertPoint) + authCheck + content.slice(insertPoint);
    modified = true;

    console.log(`🔒 Added auth to ${functionName} in ${filePath}`);
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    return true;
  }

  return false;
}

// Run the script
let secured = 0;
let skipped = 0;

console.log('🔐 Adding authentication checks to admin routes...\n');

for (const route of ROUTES_TO_SECURE) {
  if (addAuthCheck(route)) {
    secured++;
  } else {
    skipped++;
  }
}

console.log(`\n✅ Complete!`);
console.log(`   🔒 Secured: ${secured}`);
console.log(`   ✓ Already secure/skipped: ${skipped}`);
console.log(`   📋 Total: ${ROUTES_TO_SECURE.length}`);
