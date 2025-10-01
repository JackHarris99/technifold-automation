import { getAllCompanies, getAllProductsWithDatasheets, getCompanyCategories } from '@/lib/supabase';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default async function AdminPage() {
  // Get all companies first to ensure we have data
  const [allCompanies, products] = await Promise.all([
    getAllCompanies(),
    getAllProductsWithDatasheets()
  ]);

  // Check categories after we know we have companies
  const categories = await getCompanyCategories();
  console.log('Available categories:', categories);
  console.log(`Fetched ${allCompanies.length} total companies`);

  // Count companies by category for debugging
  const categoryCount: Record<string, number> = {};
  allCompanies.forEach(company => {
    const cat = (company as { category?: string }).category || 'No Category';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });

  // Split companies by category (using lowercase as in database)
  let customers = allCompanies.filter(c => (c as { category?: string }).category === 'customers');
  const partners = allCompanies.filter(c => (c as { category?: string }).category === 'partners');
  const press = allCompanies.filter(c => (c as { category?: string }).category === 'press');
  const prospects = allCompanies.filter(c => (c as { category?: string }).category === 'prospects');

  // If no categorized companies, show all in customers tab as fallback
  const uncategorized = allCompanies.filter(c => !(c as { category?: string }).category);
  if (customers.length === 0 && partners.length === 0 && press.length === 0 && prospects.length === 0) {
    // All companies are uncategorized, show them in customers tab
    customers = uncategorized;
  }

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
      categoryInfo={categoryCount}
    />
  );
}

export const metadata = {
  title: 'Technifold Admin Dashboard',
  description: 'Manage company portal links, campaigns, and analytics',
};