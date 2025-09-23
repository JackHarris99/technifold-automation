import { getAllCompanies, getAllProductsWithDatasheets } from '@/lib/supabase';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default async function AdminPage() {
  const [companies, products] = await Promise.all([
    getAllCompanies(),
    getAllProductsWithDatasheets()
  ]);

  console.log(`Admin Page Data:`, {
    companiesCount: companies.length,
    productsCount: products.length,
    sampleProducts: products.slice(0, 3),
    productTypes: [...new Set(products.map(p => p.type))]
  });

  return <AdminDashboard companies={companies} products={products} />;
}

export const metadata = {
  title: 'Technifold Admin Dashboard',
  description: 'Manage company portal links, campaigns, and analytics',
};