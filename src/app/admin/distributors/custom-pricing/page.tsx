/**
 * Custom Distributor Pricing
 * Set company-specific pricing that overrides standard distributor pricing
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import CustomDistributorPricingClient from '@/components/admin/distributors/CustomDistributorPricingClient';

export default async function CustomDistributorPricingPage({
  searchParams,
}: {
  searchParams: { company_id?: string };
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'director') {
    redirect('/login');
  }

  const supabase = getSupabaseClient();

  // Fetch all distributor companies
  const { data: distributors } = await supabase
    .from('companies')
    .select('company_id, company_name, sage_customer_code')
    .eq('type', 'distributor')
    .order('company_name');

  // If a company is selected, fetch products and custom pricing
  let products = null;
  let customPricing = null;
  let selectedCompany = null;

  if (searchParams.company_id) {
    // Fetch selected company details
    const { data: company } = await supabase
      .from('companies')
      .select('company_id, company_name, sage_customer_code')
      .eq('company_id', searchParams.company_id)
      .single();

    selectedCompany = company;

    // Fetch all products
    const { data: productsData } = await supabase
      .from('products')
      .select('product_code, description, price, type, category, active')
      .order('type')
      .order('category')
      .order('description');

    products = productsData;

    // Fetch custom pricing for this company
    const { data: customPricingData } = await supabase
      .from('company_distributor_pricing')
      .select('*')
      .eq('company_id', searchParams.company_id);

    customPricing = customPricingData;

    // Fetch standard distributor pricing for reference
    const { data: standardPricing } = await supabase
      .from('distributor_pricing')
      .select('*');

    // Merge standard pricing into products for reference
    if (products && standardPricing) {
      const standardPricingMap = new Map(
        standardPricing.map(p => [p.product_code, p.price])
      );

      products = products.map(product => ({
        ...product,
        standard_distributor_price: standardPricingMap.get(product.product_code),
      }));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Custom Distributor Pricing</h1>
              <p className="text-sm text-gray-800 mt-1">
                Set company-specific pricing that overrides standard distributor pricing
              </p>
            </div>
            <Link
              href="/admin/distributors/dashboard"
              className="text-teal-600 hover:text-teal-800 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Info Box */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-teal-900 mb-2">How Custom Pricing Works</h3>
          <ul className="text-sm text-teal-800 space-y-1 list-disc list-inside">
            <li>Select a distributor below to view and manage their custom pricing</li>
            <li>Custom pricing overrides the standard distributor pricing for that company</li>
            <li>If no custom price is set, the standard distributor price (or base price) is used</li>
            <li>You can set custom pricing for individual products or in bulk</li>
          </ul>
        </div>

        {/* Distributor Selector */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Distributor</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {distributors && distributors.length > 0 ? (
              distributors.map((dist) => (
                <Link
                  key={dist.company_id}
                  href={`/admin/distributors/custom-pricing?company_id=${dist.company_id}`}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    searchParams.company_id === dist.company_id
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-900">{dist.company_name}</div>
                  {dist.sage_customer_code && (
                    <div className="text-sm text-gray-600 mt-1">{dist.sage_customer_code}</div>
                  )}
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-gray-700">
                No distributors found
              </div>
            )}
          </div>
        </div>

        {/* Pricing Management */}
        {selectedCompany && products ? (
          <CustomDistributorPricingClient
            company={selectedCompany}
            products={products}
            customPricing={customPricing || []}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-500 text-lg">Select a distributor above to manage their custom pricing</div>
          </div>
        )}

        {/* Additional Actions */}
        <div className="mt-8 flex gap-4">
          <Link
            href="/admin/distributors/pricing"
            className="text-teal-600 hover:text-teal-800 font-medium"
          >
            ← Manage Standard Distributor Pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
