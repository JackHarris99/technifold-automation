/**
 * POST /api/companies/update-details
 * Save company address and VAT number, sync to Stripe customer
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { stripe } from '@/lib/stripe-client';

interface UpdateDetailsRequest {
  company_id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
  vat_number?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as UpdateDetailsRequest;
    const { company_id, address_line1, address_line2, city, county, postcode, country, vat_number } = body;

    if (!company_id) {
      return NextResponse.json(
        { error: 'company_id is required' },
        { status: 400 }
      );
    }

    // Validate required address fields
    if (!address_line1 || !city || !postcode || !country) {
      return NextResponse.json(
        { error: 'Address line 1, city, postcode, and country are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // 1. Update VAT number on company if provided
    if (vat_number) {
      const cleanedVAT = vat_number.trim().toUpperCase();
      if (cleanedVAT.length >= 4) {
        const { error: vatError } = await supabase
          .from('companies')
          .update({ vat_number: cleanedVAT })
          .eq('company_id', company_id);

        if (vatError) {
          console.error('[update-details] Failed to update VAT number:', vatError);
          return NextResponse.json(
            { error: 'Failed to save VAT number' },
            { status: 500 }
          );
        }
      }
    }

    // 2. Save shipping address to shipping_addresses table
    // Check if default address exists
    const { data: existingDefault, error: checkError } = await supabase
      .from('shipping_addresses')
      .select('address_id')
      .eq('company_id', company_id)
      .eq('is_default', true)
      .single();

    const addressData = {
      company_id,
      address_line_1: address_line1.trim(),
      address_line_2: address_line2?.trim() || null,
      city: city.trim(),
      state_province: county?.trim() || null,
      postal_code: postcode.trim().toUpperCase(),
      country: country.trim().toUpperCase(),
      is_default: true,
      label: 'Primary Shipping Address',
    };

    if (existingDefault) {
      // Update existing default address
      const { error: updateError } = await supabase
        .from('shipping_addresses')
        .update(addressData)
        .eq('address_id', existingDefault.address_id);

      if (updateError) {
        console.error('[update-details] Failed to update shipping address:', updateError);
        return NextResponse.json(
          { error: 'Failed to save shipping address' },
          { status: 500 }
        );
      }
    } else {
      // Create new default address
      const { error: insertError } = await supabase
        .from('shipping_addresses')
        .insert(addressData);

      if (insertError) {
        console.error('[update-details] Failed to create shipping address:', insertError);
        return NextResponse.json(
          { error: 'Failed to save shipping address' },
          { status: 500 }
        );
      }
    }

    // Sync to Stripe customer if they have a stripe_customer_id
    const { data: company } = await supabase
      .from('companies')
      .select('stripe_customer_id, company_name')
      .eq('company_id', company_id)
      .single();

    if (company?.stripe_customer_id) {
      try {
        const stripeUpdateData: {
          address: {
            line1: string;
            line2?: string;
            city: string;
            state?: string;
            postal_code: string;
            country: string;
          };
          shipping?: {
            name: string;
            address: {
              line1: string;
              line2?: string;
              city: string;
              state?: string;
              postal_code: string;
              country: string;
            };
          };
          tax_id_data?: Array<{ type: string; value: string }>;
        } = {
          address: {
            line1: address_line1.trim(),
            line2: address_line2?.trim() || undefined,
            city: city.trim(),
            state: county?.trim() || undefined,
            postal_code: postcode.trim().toUpperCase(),
            country: country.trim().toUpperCase(),
          },
          shipping: {
            name: company.company_name,
            address: {
              line1: address_line1.trim(),
              line2: address_line2?.trim() || undefined,
              city: city.trim(),
              state: county?.trim() || undefined,
              postal_code: postcode.trim().toUpperCase(),
              country: country.trim().toUpperCase(),
            },
          },
        };

        await stripe.customers.update(company.stripe_customer_id, stripeUpdateData);

        // Add VAT tax ID if provided and not already set
        if (vat_number) {
          const cleanedVAT = vat_number.trim().toUpperCase();
          try {
            // Check existing tax IDs
            const taxIds = await stripe.customers.listTaxIds(company.stripe_customer_id);
            const hasVATId = taxIds.data.some(t => t.value === cleanedVAT);

            if (!hasVATId) {
              await stripe.customers.createTaxId(company.stripe_customer_id, {
                type: 'eu_vat',
                value: cleanedVAT,
              });
              console.log(`[update-details] Added VAT ID to Stripe customer: ${cleanedVAT}`);
            }
          } catch (taxError) {
            // Non-fatal - log and continue
            console.warn('[update-details] Failed to add VAT ID to Stripe:', taxError);
          }
        }

        console.log(`[update-details] Synced to Stripe customer ${company.stripe_customer_id}`);
      } catch (stripeError) {
        // Non-fatal - data is saved in Supabase
        console.error('[update-details] Stripe sync failed:', stripeError);
      }
    }

    console.log(`[update-details] Saved details for company ${company_id}`);

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error('[update-details] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
