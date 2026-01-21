/**
 * POST /api/admin/companies/link-stripe-customers
 * Save confirmed company-to-Stripe-customer links
 * Directors only
 */

export const maxDuration = 300; // 5 minutes for this endpoint
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { isDirector, getCurrentUser } from '@/lib/auth';

interface LinkRequest {
  company_id: string;
  stripe_customer_id: string;
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Only directors can link customers
    const director = await isDirector();
    if (!director) {
      return NextResponse.json(
        { error: 'Unauthorized - Directors only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { links } = body as { links: LinkRequest[] };

    if (!links || !Array.isArray(links) || links.length === 0) {
      return NextResponse.json(
        { error: 'No links provided' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const currentUser = await getCurrentUser();

    console.log(`[link-stripe-customers] Linking ${links.length} companies to Stripe customers`);

    let updated = 0;
    let errors = 0;
    const results: any[] = [];

    for (const link of links) {
      try {
        const { error: updateError } = await supabase
          .from('companies')
          .update({
            stripe_customer_id: link.stripe_customer_id,
          })
          .eq('company_id', link.company_id);

        if (updateError) {
          console.error(`[link-stripe-customers] Failed to update company ${link.company_id}:`, updateError);
          errors++;
          results.push({
            company_id: link.company_id,
            success: false,
            error: updateError.message,
          });
        } else {
          updated++;
          results.push({
            company_id: link.company_id,
            stripe_customer_id: link.stripe_customer_id,
            success: true,
          });

          // Log the action
          if (currentUser) {
            await supabase.from('activity_log').insert({
              user_id: currentUser.user_id,
              user_email: currentUser.email,
              user_name: currentUser.full_name,
              action_type: 'company_linked_stripe',
              entity_type: 'company',
              entity_id: link.company_id,
              description: `Linked company to Stripe customer ${link.stripe_customer_id}`,
              metadata: {
                stripe_customer_id: link.stripe_customer_id,
              },
            });
          }
        }
      } catch (err: any) {
        console.error(`[link-stripe-customers] Error processing link for company ${link.company_id}:`, err);
        errors++;
        results.push({
          company_id: link.company_id,
          success: false,
          error: err.message,
        });
      }
    }

    console.log(`[link-stripe-customers] ===== LINK SUMMARY =====`);
    console.log(`[link-stripe-customers] Total requested: ${links.length}`);
    console.log(`[link-stripe-customers] Successfully linked: ${updated}`);
    console.log(`[link-stripe-customers] Errors: ${errors}`);
    console.log(`[link-stripe-customers] ===========================`);

    return NextResponse.json({
      success: true,
      message: `Linked ${updated} of ${links.length} companies. ${errors} errors.`,
      total: links.length,
      updated,
      errors,
      results,
      summary: {
        message: errors > 0
          ? `${errors} companies could not be linked. Check server logs for details.`
          : 'All companies linked successfully.',
      },
    });

  } catch (err: any) {
    console.error('[link-stripe-customers] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
