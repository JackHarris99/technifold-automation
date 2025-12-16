/**
 * Redirect: /admin/company/[id] → /admin/company/[id]
 * Consolidated to use CompanyDetailUnified everywhere
 */

import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ company_id: string }>;
}

export default async function SalesCompanyRedirect({ params }: PageProps) {
  const { company_id } = await params;
  redirect(`/admin/company/${company_id}`);
}
