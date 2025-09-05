import { notFound } from 'next/navigation';
import { getPayloadByToken } from '@/lib/supabase';
import { PortalPage } from '@/components/PortalPage';
import type { CompanyPayload } from '@/types';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function TokenPage({ params }: PageProps) {
  const { token } = await params;
  
  let payload: CompanyPayload | null = null;
  
  try {
    payload = await getPayloadByToken(token);
  } catch (error) {
    console.error('Error fetching payload:', error);
    notFound();
  }

  if (!payload) {
    notFound();
  }

  return <PortalPage payload={payload} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { token } = await params;
  const payload = await getPayloadByToken(token);
  
  if (!payload) {
    return {
      title: 'Portal Not Found',
    };
  }

  return {
    title: `${payload.company_name} - Consumables Portal`,
    description: `Consumables portal for ${payload.company_name}`,
  };
}