/**
 * Track Campaign Interaction API
 * Records contact-level clicks and learns machine details
 * POST /api/campaigns/track-interaction
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { verifyToken } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, interaction_type, machine_taxonomy_id, clicked_option } = body;

    // Validate required fields
    if (!token || !interaction_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify and decode token
    const payload = verifyToken(token);
    if (!payload || !payload.company_id) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { company_id, contact_id, campaign_key } = payload as any;

    const supabase = getSupabaseClient();

    // Get contact role if contact_id provided
    let contactRole = null;
    if (contact_id) {
      const { data: contactData } = await supabase
        .from('contacts')
        .select('role')
        .eq('contact_id', contact_id)
        .single();

      contactRole = contactData?.role;
    }

    // Get current knowledge level for this company
    const { data: currentKnowledge } = await supabase
      .from('company_machine_knowledge')
      .select('machine_taxonomy_id, confidence_level')
      .eq('company_id', company_id)
      .order('confidence_level', { ascending: false })
      .limit(1)
      .single();

    const currentKnowledgeLevel = currentKnowledge?.confidence_level || 0;

    // Record the interaction
    const { data: interaction, error: interactionError } = await supabase
      .from('campaign_interactions')
      .insert({
        company_id,
        contact_id,
        contact_role: contactRole,
        campaign_key,
        token,
        interaction_type,
        machine_taxonomy_id,
        clicked_option,
        current_knowledge_level: currentKnowledgeLevel,
        learned_new_info: false, // Will update below if we learned something
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
      })
      .select()
      .single();

    if (interactionError) {
      console.error('Error recording interaction:', interactionError);
      return NextResponse.json(
        { error: 'Failed to record interaction' },
        { status: 500 }
      );
    }

    // If they selected a machine, record the learning
    if (machine_taxonomy_id && interaction_type === 'machine_selection') {
      // Check if this is new information
      const isNewInfo = !currentKnowledge || currentKnowledge.machine_taxonomy_id !== machine_taxonomy_id;

      if (isNewInfo) {
        // Update interaction to mark as learned new info
        await supabase
          .from('campaign_interactions')
          .update({ learned_new_info: true })
          .eq('id', interaction.id);

        // Add to knowledge confirmation queue (needs sales team confirmation)
        await supabase
          .from('knowledge_confirmation_queue')
          .insert({
            company_id,
            contact_id,
            machine_taxonomy_id,
            learned_from_campaign: campaign_key,
            interaction_id: interaction.id,
            evidence_type: 'campaign_click',
            evidence_details: {
              clicked_option,
              contact_role: contactRole,
              timestamp: new Date().toISOString(),
            },
            confidence_score: 70, // Algorithm score - adjust based on your needs
            priority: contactRole && ['production manager', 'owner', 'operations'].includes(contactRole.toLowerCase()) ? 10 : 5,
            status: 'pending',
          });

        // Also record in company_machine_knowledge with low confidence
        // (sales team will confirm and upgrade confidence later)
        const { error: knowledgeError } = await supabase
          .from('company_machine_knowledge')
          .upsert({
            company_id,
            machine_taxonomy_id,
            confidence_level: 2, // Clicked link (needs confirmation)
            learned_from: 'campaign_click',
            learned_by: contact_id,
            source_campaign_key: campaign_key,
            source_token: token,
            confirmed: false,
          }, {
            onConflict: 'company_id,machine_taxonomy_id',
            ignoreDuplicates: false,
          });

        if (knowledgeError) {
          console.error('Error recording machine knowledge:', knowledgeError);
          // Don't fail the request, just log
        }
      }
    }

    return NextResponse.json({
      success: true,
      interaction_id: interaction.id,
      learned_new_info: isNewInfo,
    });
  } catch (error) {
    console.error('Error in track-interaction API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
