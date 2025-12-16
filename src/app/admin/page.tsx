import { redirect } from 'next/navigation';

export default function AdminHomePage() {
  // Redirect to Sales Center as main dashboard
  redirect('/admin/sales');
}
