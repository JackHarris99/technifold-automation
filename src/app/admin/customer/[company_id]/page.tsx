import { notFound } from 'next/navigation';
import { getCustomerProfile, getCustomerOrderHistory, getPayloadByToken, getCompanyOwnedTools } from '@/lib/supabase';
import { CustomerProfilePage } from '@/components/admin/CustomerProfilePageEnhanced';

interface PageProps {
  params: Promise<{ company_id: string }>;
}

export default async function CustomerPage({ params }: PageProps) {
  const { company_id } = await params;

  const [profile, orderHistory, ownedTools] = await Promise.all([
    getCustomerProfile(company_id),
    getCustomerOrderHistory(company_id),
    getCompanyOwnedTools(company_id),
  ]);

  if (!profile) {
    notFound();
  }

  // Also get their current portal data to show what they can order
  let portalData = null;
  try {
    portalData = await getPayloadByToken(profile.portal_token);
  } catch (error) {
    console.error('Error fetching portal data:', error);
  }

  return (
    <CustomerProfilePage
      profile={profile}
      orderHistory={orderHistory}
      portalData={portalData}
      ownedTools={ownedTools}
    />
  );
}

