import { notFound } from 'next/navigation';
import {
  getCustomerProfile,
  getCustomerOrderHistory,
  getCompanyToolsWithConsumables,
  getCompanyContacts
} from '@/lib/supabase';
import { CustomerProfilePage } from '@/components/admin/CustomerProfilePageEnhanced';

interface PageProps {
  params: Promise<{ company_id: string }>;
}

export default async function CustomerPage({ params }: PageProps) {
  const { company_id } = await params;

  const [profile, orderHistory, toolsWithConsumables, contacts] = await Promise.all([
    getCustomerProfile(company_id),
    getCustomerOrderHistory(company_id),
    getCompanyToolsWithConsumables(company_id),
    getCompanyContacts(company_id),
  ]);

  if (!profile) {
    notFound();
  }

  return (
    <CustomerProfilePage
      profile={profile}
      orderHistory={orderHistory}
      toolsWithConsumables={toolsWithConsumables}
      contacts={contacts}
    />
  );
}

