import { redirect } from 'next/navigation';

export default function AdminHomePage() {
  // Redirect to companies list as main dashboard
  redirect('/admin/companies');
}
