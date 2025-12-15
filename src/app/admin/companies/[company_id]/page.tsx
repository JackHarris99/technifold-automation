/**
 * REDIRECT to /admin/company/[company_id]
 * This URL is deprecated - redirects to the main company detail page
 */

import { redirect } from 'next/navigation';

interface CompanyDetailPageProps {
  params: Promise<{
    company_id: string;
  }>;
}

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const { company_id } = await params;

  // Redirect to the main company detail page
  redirect(`/admin/company/${company_id}`);
}
