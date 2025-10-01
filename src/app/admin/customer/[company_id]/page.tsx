import { notFound } from 'next/navigation';
import { getCustomerProfile, getCustomerOrderHistory, getCompanyOwnedTools, getCompanyOrderedConsumables } from '@/lib/supabase';
import { CustomerProfilePage } from '@/components/admin/CustomerProfilePageEnhanced';

interface PageProps {
  params: Promise<{ company_id: string }>;
}

export default async function CustomerPage({ params }: PageProps) {
  const { company_id } = await params;

  const [profile, orderHistory, ownedTools, orderedConsumables] = await Promise.all([
    getCustomerProfile(company_id),
    getCustomerOrderHistory(company_id),
    getCompanyOwnedTools(company_id),
    getCompanyOrderedConsumables(company_id),
  ]);

  if (!profile) {
    notFound();
  }

  return (
    <CustomerProfilePage
      profile={profile}
      orderHistory={orderHistory}
      ownedTools={ownedTools}
      orderedConsumables={orderedConsumables}
    />
  );
}

