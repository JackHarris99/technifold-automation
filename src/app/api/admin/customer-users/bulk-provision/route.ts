/**
 * POST /api/admin/customer-users/bulk-provision
 * Bulk create customer_users accounts with NULL passwords for "Login As" access
 * Admin only - Director role required
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Only directors can bulk provision
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'director') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    // Fetch all customer contacts without customer_users accounts
    const { data: contactsToProvision, error: fetchError } = await supabase
      .from('contacts')
      .select(`
        contact_id,
        email,
        first_name,
        last_name,
        company_id
      `)
      .not('email', 'is', null)
      .neq('email', '')
      .in('company_id',
        supabase
          .from('companies')
          .select('company_id')
          .eq('type', 'customer')
      );

    if (fetchError) {
      console.error('[Bulk Provision] Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch contacts' },
        { status: 500 }
      );
    }

    if (!contactsToProvision || contactsToProvision.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No contacts to provision',
        created: 0,
        skipped: 0,
      });
    }

    // Check which emails already have customer_users accounts
    const emails = contactsToProvision.map(c => c.email.toLowerCase().trim());
    const { data: existingUsers } = await supabase
      .from('customer_users')
      .select('email')
      .in('email', emails);

    const existingEmails = new Set(
      (existingUsers || []).map(u => u.email.toLowerCase().trim())
    );

    // Filter out contacts that already have accounts
    const newAccounts = contactsToProvision.filter(
      c => !existingEmails.has(c.email.toLowerCase().trim())
    );

    console.log(`[Bulk Provision] Total contacts: ${contactsToProvision.length}`);
    console.log(`[Bulk Provision] Existing accounts: ${existingEmails.size}`);
    console.log(`[Bulk Provision] New accounts to create: ${newAccounts.length}`);

    if (newAccounts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All contacts already have accounts',
        created: 0,
        skipped: contactsToProvision.length,
      });
    }

    // Prepare bulk insert data
    const accountsToInsert = newAccounts.map(contact => ({
      company_id: contact.company_id,
      email: contact.email.toLowerCase().trim(),
      first_name: contact.first_name || '',
      last_name: contact.last_name || '',
      role: 'user',
      is_active: true,
      password_hash: null, // NULL password for "Login As" access only
      // No invitation_token - these are silent provisioned accounts
    }));

    // Insert in batches of 500 to avoid timeout
    const batchSize = 500;
    let createdCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < accountsToInsert.length; i += batchSize) {
      const batch = accountsToInsert.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from('customer_users')
        .insert(batch)
        .select('user_id');

      if (error) {
        console.error(`[Bulk Provision] Batch ${i / batchSize + 1} error:`, error);
        errorCount += batch.length;
        errors.push(`Batch ${i / batchSize + 1}: ${error.message}`);
      } else {
        createdCount += data?.length || 0;
        console.log(`[Bulk Provision] Batch ${i / batchSize + 1}: Created ${data?.length} accounts`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk provisioning complete`,
      created: createdCount,
      skipped: existingEmails.size,
      errors: errorCount > 0 ? errors : undefined,
      total_contacts: contactsToProvision.length,
    });

  } catch (error: any) {
    console.error('[Bulk Provision] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
