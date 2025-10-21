/**
 * Campaign Landing Page
 * Progressive machine selection based on knowledge level
 * URL: /c/{token}
 */

import { notFound } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { verifyToken } from '@/lib/tokens';
import MachineSelectorPage from '@/components/campaigns/MachineSelectorPage';

async function getCampaignData(token: string) {
  try {
    // Verify and decode token
    const payload = verifyToken(token);
    if (!payload || !payload.company_id) {
      return null;
    }

    const { company_id, contact_id, campaign_key } = payload;

    const supabase = getSupabaseClient();

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('campaign_key', campaign_key)
      .single();

    if (campaignError || !campaign) {
      console.error('Campaign not found:', campaignError);
      return null;
    }

    // Get company details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('company_id, company_name')
      .eq('company_id', company_id)
      .single();

    if (companyError) {
      console.error('Company not found:', companyError);
    }

    // Get contact details if contact_id provided
    let contact = null;
    if (contact_id) {
      const { data: contactData, error: contactError } = await supabase
        .from('contacts')
        .select('*')
        .eq('contact_id', contact_id)
        .single();

      if (!contactError && contactData) {
        contact = contactData;
      }
    }

    // Get current machine knowledge for this company
    const { data: knowledgeData, error: knowledgeError } = await supabase
      .from('company_machine_knowledge')
      .select(`
        *,
        machine_taxonomy:machine_taxonomy_id (*)
      `)
      .eq('company_id', company_id)
      .eq('confirmed', true)
      .order('confidence_level', { ascending: false })
      .limit(1);

    const currentKnowledge = knowledgeData && knowledgeData.length > 0 ? knowledgeData[0] : null;

    // Get machine taxonomy for selection options
    const { data: machineTaxonomy, error: taxonomyError } = await supabase
      .from('machine_taxonomy')
      .select('*')
      .eq('is_active', true)
      .order('level')
      .order('display_name');

    if (taxonomyError) {
      console.error('Error fetching machine taxonomy:', taxonomyError);
    }

    // Determine knowledge level and what to show
    let knowledgeLevel = 1; // Default: no knowledge
    let parentMachineId = campaign.target_machine_category_id; // Start with campaign's target

    if (currentKnowledge && currentKnowledge.machine_taxonomy) {
      const taxonomy = currentKnowledge.machine_taxonomy as any;
      knowledgeLevel = taxonomy.level + 1; // Show next level down
      parentMachineId = currentKnowledge.machine_taxonomy_id; // Show children of what we know
    }

    return {
      token,
      campaign,
      company,
      contact,
      currentKnowledge,
      knowledgeLevel,
      machineTaxonomy: machineTaxonomy || [],
      parentMachineId,
    };
  } catch (error) {
    console.error('Error getting campaign data:', error);
    return null;
  }
}

export default async function CampaignPage({ params }: { params: { token: string } }) {
  const data = await getCampaignData(params.token);

  if (!data) {
    notFound();
  }

  return (
    <MachineSelectorPage
      token={data.token}
      campaign={data.campaign}
      company={data.company}
      contact={data.contact}
      currentKnowledge={data.currentKnowledge}
      knowledgeLevel={data.knowledgeLevel}
      machineTaxonomy={data.machineTaxonomy}
      parentMachineId={data.parentMachineId}
    />
  );
}

export const metadata = {
  title: 'Select Your Machine | Technifold',
  description: 'Help us recommend the perfect solution for your equipment',
};
