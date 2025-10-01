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
    const cat = (company as any).category || 'No Category';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });

  // For now, put all companies in customers until we fix category filtering
  const customers = allCompanies;
  const partners = [] as typeof allCompanies;
  const press = [] as typeof allCompanies;
  const prospects = [] as typeof allCompanies;

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