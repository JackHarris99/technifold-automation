import { redirect } from 'next/navigation';

export default async function AdminPage() {
  // Redirect to Sales Center (new homepage)
  redirect('/admin/sales');
}

export const metadata = {
  title: 'Technifold Sales Engine',
  description: 'Action-driven sales and marketing platform',
};
