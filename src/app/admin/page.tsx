import { redirect } from 'next/navigation';

export default async function AdminPage() {
  // Redirect to Company Console
  redirect('/admin/company');
}

export const metadata = {
  title: 'Technifold Admin',
  description: 'Company management console',
};
