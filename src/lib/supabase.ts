import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CompanyPayload, Company, CustomerProfile, OrderHistory } from '@/types';

let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required Supabase environment variables');
    }
    supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabaseClient;
}

export async function getPayloadByToken(token: string): Promise<CompanyPayload | null> {
  try {
    // Validate token format (basic UUID check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      return null;
    }

    const supabase = getSupabaseClient();

    // First, get the company_id from the portal token
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('company_id, company_name')
      .eq('portal_token', token)
      .single();

    if (companyError || !companyData) {
      return null;
    }

    // Then get the payload from the view
    const { data, error } = await supabase
      .from('vw_company_consumable_payload')
      .select('*')
      .eq('company_id', companyData.company_id)
      .single();

    if (error || !data) {
      return null;
    }

    // Log data completeness to check for potential 1000-row limits
    const payload = data as CompanyPayload;
    console.log(`Company ${payload.company_name}:`);
    console.log(`- Reorder items: ${payload.reorder_items?.length || 0}`);
    console.log(`- Tool tabs: ${payload.by_tool_tabs?.length || 0}`);
    payload.by_tool_tabs?.forEach((tab, idx) => {
      console.log(`  - Tab ${idx + 1} (${tab.tool_code}): ${tab.items?.length || 0} items`);
    });
    
    // Warning if we hit suspicious round numbers (possible truncation)
    const totalItems = (payload.reorder_items?.length || 0) + 
      (payload.by_tool_tabs?.reduce((sum, tab) => sum + (tab.items?.length || 0), 0) || 0);
    
    if (totalItems >= 1000 || payload.reorder_items?.length === 1000) {
      console.warn(`⚠️  POTENTIAL DATA TRUNCATION: Company ${payload.company_name} has exactly ${totalItems} total items. This might indicate a 1000-row limit in the view.`);
    }

    return payload;
  } catch (error) {
    console.error('Error fetching payload by token:', error);
    return null;
  }
}

// Admin dashboard functions
export async function getAllCompanies(): Promise<Company[]> {
  try {
    const supabase = getSupabaseClient();

    let allCompanies: Company[] = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('companies')
        .select('company_id, company_name, portal_token, created_at, updated_at, category')
        .order('company_name')
        .range(from, from + batchSize - 1);

      if (error) {
        console.error('Error fetching companies:', error);
        break;
      }

      if (data && data.length > 0) {
        allCompanies = [...allCompanies, ...data];
        from += batchSize;
        hasMore = data.length === batchSize;
      } else {
        hasMore = false;
      }
    }

    console.log(`Loaded ${allCompanies.length} companies from database`);
    return allCompanies;
  } catch (error) {
    console.error('Error in getAllCompanies:', error);
    return [];
  }
}

// Get all unique categories from companies table
export async function getCompanyCategories(): Promise<string[]> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('companies')
      .select('category')
      .not('category', 'is', null);

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    const uniqueCategories = [...new Set(data?.map(d => d.category) || [])];
    console.log('Available categories in database:', uniqueCategories);
    return uniqueCategories;
  } catch (error) {
    console.error('Error in getCompanyCategories:', error);
    return [];
  }
}

// Fetch companies by specific category
export async function getCompaniesByCategory(category: string): Promise<Company[]> {
  try {
    const supabase = getSupabaseClient();

    let allCompanies: Company[] = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const query = supabase
        .from('companies')
        .select('company_id, company_name, portal_token, created_at, updated_at, category')
        .order('company_name')
        .range(from, from + batchSize - 1);

      // Only filter by category if it's specified
      if (category && category !== 'All') {
        query.eq('category', category);
      } else if (category === 'Uncategorized') {
        // Handle companies with null or empty categories
        query.or('category.is.null,category.eq.')
      }

      const { data, error } = await query;

      if (error) {
        console.error(`Error fetching ${category} companies:`, error);
        break;
      }

      if (data && data.length > 0) {
        allCompanies = [...allCompanies, ...data];
        from += batchSize;
        hasMore = data.length === batchSize;
      } else {
        hasMore = false;
      }
    }

    console.log(`Loaded ${allCompanies.length} ${category} companies from database`);
    return allCompanies;
  } catch (error) {
    console.error(`Error in getCompaniesByCategory(${category}):`, error);
    return [];
  }
}

// Generate portal URL for a company
export function generatePortalUrl(portalToken: string): string {
  // In development, always use localhost. In production, use the configured base URL.
  const isDevelopment = process.env.NODE_ENV === 'development';
  const baseUrl = isDevelopment
    ? 'http://localhost:3000'
    : (process.env.NEXT_PUBLIC_BASE_URL || 'https://technifold.com');
  return `${baseUrl}/portal/${portalToken}`;
}

// Customer intelligence functions
export async function getCustomerProfile(companyId: string): Promise<CustomerProfile | null> {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (error || !data) {
      return null;
    }

    // Get sales statistics for this company
    const { data: salesStats, error: salesError } = await supabase
      .from('sales')
      .select('txn_date, sale_total, total')
      .eq('company_id', companyId);

    let totalOrders = 0;
    let totalSpent = 0;
    let lastOrderDate = undefined;

    if (!salesError && salesStats) {
      totalOrders = salesStats.length;
      totalSpent = salesStats.reduce((sum, sale) => sum + (sale.sale_total || sale.total || 0), 0);
      
      // Get most recent order date
      const sortedSales = salesStats
        .filter(sale => sale.txn_date)
        .sort((a, b) => new Date(b.txn_date).getTime() - new Date(a.txn_date).getTime());
      
      if (sortedSales.length > 0) {
        lastOrderDate = sortedSales[0].txn_date;
      }
    }

    return {
      ...data,
      total_orders: totalOrders,
      total_spent: totalSpent,
      last_order_date: lastOrderDate,
      portal_last_accessed: undefined, // Would come from analytics table
    } as CustomerProfile;
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    return null;
  }
}

export async function getCustomerOrderHistory(companyId: string): Promise<OrderHistory[]> {
  try {
    const supabase = getSupabaseClient();
    
    console.log('Fetching sales for company:', companyId);
    
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('company_id', companyId)
      .order('txn_date', { ascending: false });

    console.log('Sales query result:', { count: data?.length, companyId });

    if (error) {
      console.error('Error fetching sales history:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Group sales by invoice_number
    const groupedByInvoice = data.reduce((acc, sale) => {
      const invoiceNum = sale.invoice_number || `ORDER-${sale.txn_date}`;

      if (!acc[invoiceNum]) {
        acc[invoiceNum] = {
          order_id: invoiceNum,
          order_date: sale.txn_date,
          total_amount: 0,
          status: 'completed',
          items: []
        };
      }

      acc[invoiceNum].items.push({
        consumable_code: sale.product_code || sale.consumable_code || '',
        description: sale.description || '',
        quantity: sale.quantity || 1,
        unit_price: sale.unit_price || 0,
        total_price: sale.line_total || sale.total || 0
      });

      acc[invoiceNum].total_amount += (sale.line_total || sale.total || 0);

      return acc;
    }, {} as Record<string, OrderHistory>);

    // Sort by order_date descending (latest first)
    const orders = Object.values(groupedByInvoice) as OrderHistory[];
    return orders.sort((a, b) =>
      new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
    );
  } catch (error) {
    console.error('Error fetching order history:', error);
    return [];
  }
}

// Get all tools owned by a company based on their purchase history
export async function getCompanyOwnedTools(companyId: string): Promise<Array<{
  product_code: string;
  description: string;
  category: string;
  type: string;
  price?: number;
  [key: string]: unknown;
}>> {
  try {
    const supabase = getSupabaseClient();

    // Get distinct product codes from sales for this company
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('product_code')
      .eq('company_id', companyId)
      .not('product_code', 'is', null);

    if (salesError || !salesData) {
      console.error('Error fetching sales for tools:', salesError);
      return [];
    }

    // Get unique product codes
    const uniqueProductCodes = [...new Set(salesData.map(s => s.product_code))];

    if (uniqueProductCodes.length === 0) {
      return [];
    }

    // Fetch tool details for these product codes
    const { data: tools, error: toolsError } = await supabase
      .from('products')
      .select('*')
      .in('product_code', uniqueProductCodes)
      .eq('type', 'tool');

    if (toolsError) {
      console.error('Error fetching tool details:', toolsError);
      return [];
    }

    return tools || [];
  } catch (error) {
    console.error('Error in getCompanyOwnedTools:', error);
    return [];
  }
}

// Product catalog functions
export async function getProductCategories(): Promise<string[]> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('type', 'tool')
      .range(0, 9999); // Handle up to 10,000 products

    console.log('Product categories query:', { data, error });

    if (error || !data) {
      return [];
    }

    // Get unique categories
    const uniqueCategories = [...new Set(data.map(item => item.category).filter(Boolean))];
    console.log('Unique tool categories:', uniqueCategories);
    
    return uniqueCategories;
  } catch (error) {
    console.error('Error fetching product categories:', error);
    return [];
  }
}

export async function getToolsByCategory(category: string) {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('type', 'tool')
      .eq('category', category)
      .range(0, 9999); // Handle up to 10,000 products per category

    console.log(`Tools in category "${category}":`, { data, error });

    if (error) {
      console.error('Error fetching tools by category:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getToolsByCategory:', error);
    return [];
  }
}

// Get all products for admin datasheet listing
export async function getAllProductsWithDatasheets() {
  try {
    const supabase = getSupabaseClient();

    // Fetch products with correct column names
    const { data, error, count } = await supabase
      .from('products')
      .select('product_code, description, category, type, price, currency, active', { count: 'exact' })
      .eq('type', 'tool')
      .order('category', { ascending: true })
      .order('description', { ascending: true })
      .range(0, 9999); // Explicitly request up to 10,000 records

    if (error) {
      console.error('Error fetching products with datasheets:', error);
      return [];
    }

    console.log(`Found ${data?.length || 0} tool products out of ${count} total matching records`);

    return data || [];
  } catch (error) {
    console.error('Error in getAllProductsWithDatasheets:', error);
    return [];
  }
}

// Technical product data sheet functions
export async function getToolByProductCode(productCode: string) {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('product_code', productCode)
      .eq('type', 'tool')
      .single();

    console.log(`Tool details for "${productCode}":`, { data, error });

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching tool by product code:', error);
    return null;
  }
}

export async function getCompatibleConsumables(productCode: string) {
  try {
    console.log(`Looking for consumables compatible with "${productCode}" using tool_consumable_map`);
    const supabase = getSupabaseClient();
    
    // Query the tool_consumable_map table to find consumables for this tool
    const { data, error } = await supabase
      .from('tool_consumable_map')
      .select('consumable_code')
      .eq('tool_code', productCode);
      
    console.log(`Found ${data?.length || 0} compatible consumables for "${productCode}"`);
    
    if (error || !data || data.length === 0) {
      console.error('Error or no data in tool_consumable_map:', error);
      return [];
    }

    // Get the consumable codes
    const consumableCodes = data.map(item => item.consumable_code);

    // Fetch the actual product details for these consumables
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('product_code, description, price, currency, type, category')
      .in('product_code', consumableCodes);

    if (productsError) {
      console.error('Error fetching consumable products:', productsError);
      return [];
    }

    console.log(`Returning ${products?.length || 0} consumables`);
    return products || [];
  } catch (error) {
    console.error('Error in getCompatibleConsumables:', error);
    return [];
  }
}

// Get all consumables ordered by a company
export async function getCompanyOrderedConsumables(companyId: string): Promise<Array<{
  product_code: string;
  description: string;
  category?: string;
  type?: string;
  total_ordered: number;
  last_ordered?: string;
  [key: string]: unknown;
}>> {
  try {
    console.log(`[getCompanyOrderedConsumables] Fetching for company: ${companyId}`);
    const supabase = getSupabaseClient();

    // Get all unique consumables from sales for this company
    // Try both product_code and consumable_code columns
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('product_code, consumable_code, description, quantity, txn_date')
      .eq('company_id', companyId);

    console.log(`[getCompanyOrderedConsumables] Sales query result:`, {
      companyId,
      salesCount: salesData?.length || 0,
      error: salesError,
      firstFewSales: salesData?.slice(0, 3).map(s => ({
        product_code: s.product_code,
        consumable_code: s.consumable_code,
        desc: s.description?.substring(0, 20)
      }))
    });

    if (salesError || !salesData) {
      console.error('Error fetching sales for consumables:', salesError);
      return [];
    }

    if (salesData.length === 0) {
      console.log(`[getCompanyOrderedConsumables] No sales found for company ${companyId}`);
      return [];
    }

    // Group by product_code (or consumable_code if product_code is null) and aggregate quantities
    const consumableMap = salesData.reduce((acc, sale) => {
      const code = sale.product_code || sale.consumable_code;
      if (!code) return acc; // Skip if both are null

      if (!acc[code]) {
        acc[code] = {
          product_code: code,
          description: sale.description || '',
          total_ordered: 0,
          last_ordered: sale.txn_date
        };
      }
      acc[code].total_ordered += (sale.quantity || 1);
      // Update last_ordered if this sale is more recent
      if (sale.txn_date && new Date(sale.txn_date) > new Date(acc[code].last_ordered)) {
        acc[code].last_ordered = sale.txn_date;
      }
      return acc;
    }, {} as Record<string, {
      product_code: string;
      description: string;
      total_ordered: number;
      last_ordered: string;
    }>);

    const uniqueConsumableCodes = Object.keys(consumableMap);

    if (uniqueConsumableCodes.length === 0) {
      return [];
    }

    // Just return the sales data directly, no need to join with products table
    const enrichedConsumables = Object.values(consumableMap);

    console.log(`[getCompanyOrderedConsumables] Returning ${enrichedConsumables.length} unique products for company ${companyId}`);

    // Sort by last_ordered date (most recent first)
    const sorted = enrichedConsumables.sort((a, b) =>
      new Date(b.last_ordered || 0).getTime() - new Date(a.last_ordered || 0).getTime()
    );

    return sorted;
  } catch (error) {
    console.error('Error in getCompanyOrderedConsumables:', error);
    return [];
  }
}

// URL encoding/decoding utilities for product codes with forward slashes
export function encodeProductCodeForUrl(productCode: string): string {
  return productCode.replace(/\//g, '--');
}

export function decodeProductCodeFromUrl(encodedCode: string): string {
  return encodedCode.replace(/--/g, '/');
}

export { getSupabaseClient as supabase };