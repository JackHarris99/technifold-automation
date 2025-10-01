import { getCompaniesByCategory, getAllProductsWithDatasheets, getCompanyCategories } from '@/lib/supabase';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default async function AdminPage() {
  // First, check what categories are available
  const categories = await getCompanyCategories();
  console.log('Available categories in database:', categories);

  const [customers, partners, press, prospects, products] = await Promise.all([
    getCompaniesByCategory('Customer'),  // Try singular form
    getCompaniesByCategory('Partner'),   // Try singular form
    getCompaniesByCategory('Press'),
    getCompaniesByCategory('Prospect'),  // Try singular form
    getAllProductsWithDatasheets()
  ]);

  console.log(`Admin Page Data:`, {
    availableCategories: categories,
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