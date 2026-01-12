/**
 * Commercial Invoice / Packing Slip Page
 * /admin/shipping-manifests/[manifest_id]/packing-slip
 * Displays print-ready commercial invoice for customs
 */

import { notFound } from 'next/navigation';
import { getShippingCommercialInvoiceHtml } from '@/lib/shipping-invoice';

interface PackingSlipPageProps {
  params: Promise<{
    manifest_id: string;
  }>;
}

export default async function PackingSlipPage({ params }: PackingSlipPageProps) {
  const { manifest_id } = await params;

  // Generate commercial invoice HTML
  const html = await getShippingCommercialInvoiceHtml(manifest_id);

  if (!html) {
    notFound();
  }

  // Return raw HTML with print styles already included
  // This allows users to use browser's Print to PDF feature
  return (
    <div
      className="commercial-invoice-container"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export async function generateMetadata({ params }: PackingSlipPageProps) {
  const { manifest_id } = await params;

  return {
    title: `Commercial Invoice - ${manifest_id.substring(0, 12)}`,
    description: 'Commercial invoice and packing slip for international shipment',
  };
}
