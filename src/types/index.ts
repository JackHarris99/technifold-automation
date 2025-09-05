// Company and portal types
export type Company = {
  company_id: string;
  company_name: string;
  portal_token: string;
  created_at?: string;
  updated_at?: string;
};

export type ReorderItem = {
  consumable_code: string;
  description: string;
  price: number | null;
  last_purchased: string | null; // 'YYYY-MM-DD'
};

export type ToolTab = {
  tool_code: string;
  tool_desc: string | null;
  items: ReorderItem[];
};

export type CompanyPayload = {
  company_id: string;
  company_name: string;
  reorder_items: ReorderItem[];
  by_tool_tabs: ToolTab[];
};

// Admin dashboard specific types
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