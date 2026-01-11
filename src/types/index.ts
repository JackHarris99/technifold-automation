export type ReorderItem = {
  consumable_code: string;
  description: string;
  price: number | null;
  last_purchased: string | null; // 'YYYY-MM-DD'
  category?: string;
  image_url?: string | null;
  pricing_tier?: string | null; // 'standard' or 'premium'
};

export type ToolTab = {
  tool_code: string;
  tool_desc: string | null;
  quantity?: number;
  items: ReorderItem[];
};

export type CompanyPayload = {
  company_id: string;
  company_name: string;
  reorder_items: ReorderItem[];
  by_tool_tabs: ToolTab[];
};

export type CartItem = {
  consumable_code: string;
  description: string;
  price: number | null;
  quantity: number;
};

// Admin dashboard types
export type Company = {
  company_id: string;
  company_name: string;
  portal_token: string;
  created_at?: string;
  updated_at?: string;
};

export type CompanyStats = {
  company_id: string;
  company_name: string;
  portal_token: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string | null;
  portal_last_accessed: string | null;
};

export type EmailCampaign = {
  id: string;
  name: string;
  subject: string;
  template: string;
  scheduled_date: string | null;
  sent_date: string | null;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  recipient_count: number;
};

// Customer profile types
export type CustomerProfile = {
  company_id: string;
  company_name: string;
  portal_token: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  billing_address?: string;
  shipping_address?: string;
  created_at: string;
  updated_at: string;
  last_order_date?: string;
  total_orders: number;
  total_spent: number;
  portal_last_accessed?: string;
};

export type OrderHistory = {
  order_id: string;
  order_date: string;
  total_amount: number;
  status: string;
  items: OrderItem[];
};

export type OrderItem = {
  consumable_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type CustomerAnalytics = {
  avg_order_value: number;
  order_frequency_days: number;
  most_ordered_items: Array<{
    consumable_code: string;
    description: string;
    total_quantity: number;
    total_spent: number;
  }>;
  purchase_trends: Array<{
    month: string;
    orders: number;
    revenue: number;
  }>;
};