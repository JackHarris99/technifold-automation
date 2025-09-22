import { getAllCompanies, getAllProductsWithDatasheets } from '@/lib/supabase';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default async function AdminPage() {
  const [companies, products] = await Promise.all([
    getAllCompanies(),
    getAllProductsWithDatasheets()
  ]);

  console.log(`Loaded ${companies.length} companies and ${products.length} products from database`);

  return <AdminDashboard companies={companies} products={products} />;
}

export const metadata = {
  title: 'Technifold Admin Dashboard',
  description: 'Manage company portal links, campaigns, and analytics',
};