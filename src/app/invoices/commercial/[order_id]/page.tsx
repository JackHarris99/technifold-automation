/**
 * Commercial Invoice Rendering Page
 * /invoices/commercial/[order_id]
 * Displays print-ready commercial invoice HTML for international shipments
 */

import { notFound } from 'next/navigation';
import { getCommercialInvoiceHtml } from '@/lib/commercial-invoice';

interface CommercialInvoicePageProps {
  params: Promise<{
    order_id: string;
  }>;
}

export default async function CommercialInvoicePage({ params }: CommercialInvoicePageProps) {
  const { order_id } = await params;

  // Generate commercial invoice HTML
  const html = await getCommercialInvoiceHtml(order_id);

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

export async function generateMetadata({ params }: CommercialInvoicePageProps) {
  const { order_id } = await params;

  return {
    title: `Commercial Invoice - ${order_id.substring(0, 12)}`,
    description: 'Commercial invoice for international shipment',
  };
}
