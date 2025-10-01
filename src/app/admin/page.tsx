import { getCompaniesByCategory, getAllProductsWithDatasheets } from '@/lib/supabase';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default async function AdminPage() {
  const [customers, partners, press, prospects, products] = await Promise.all([
    getCompaniesByCategory('Customers'),
    getCompaniesByCategory('Partners'),
    getCompaniesByCategory('Press'),
    getCompaniesByCategory('Prospects'),
    getAllProductsWithDatasheets()
  ]);

  console.log(`Admin Page Data:`, {
    customersCount: customers.length,
    partnersCount: partners.length,
    pressCount: press.length,
    prospectsCount: prospects.length,
    productsCount: products.length
  });

  return (
    <AdminDashboard
      customers={customers}
      partners={partners}
      press={press}
      prospects={prospects}
      products={products}
    />
  );
}

export const metadata = {
  title: 'Technifold Admin Dashboard',
  description: 'Manage company portal links, campaigns, and analytics',
};