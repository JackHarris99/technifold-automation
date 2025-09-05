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
  company_id: number;
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