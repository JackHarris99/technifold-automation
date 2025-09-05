# Technifold Consumables Portal (MVP)

A Next.js application for companies to browse and order consumables through personalized portal tokens.

## Features

- **Dynamic Portal Access**: Access via `/r/[token]` URLs with UUID tokens
- **Tabbed Interface**: Reorder tab and tool-specific consumable tabs  
- **Shopping Cart**: Add items with quantity pickers, view cart summary
- **Mobile Responsive**: Optimized for both desktop and mobile devices
- **404 Handling**: Custom error page for invalid tokens
- **API Endpoint**: JSON API at `/api/r/[token]` with 60-second cache

## Tech Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase for database queries
- **Deployment**: Designed for Vercel

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_BASE_URL=https://yourdomain.com  
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Data Contract

The application reads from `vw_company_consumable_payload` view using company portal tokens:

```typescript
type CompanyPayload = {
  company_id: number;
  company_name: string; 
  reorder_items: ReorderItem[];
  by_tool_tabs: ToolTab[];
};

type ReorderItem = {
  consumable_code: string;
  description: string;
  price: number | null;
  last_purchased: string | null; // 'YYYY-MM-DD'
};

type ToolTab = {
  tool_code: string;
  tool_desc: string | null;
  consumables: ReorderItem[];
};
```

## Testing

Test with a valid UUID token:
- Page: `/r/your-test-token-here`
- API: `/api/r/your-test-token-here`

## Project Structure

```
src/
├── app/
│   ├── r/[token]/
│   │   └── page.tsx        # Dynamic portal page
│   ├── api/r/[token]/
│   │   └── route.ts        # API endpoint
│   └── not-found.tsx       # 404 page
├── components/
│   ├── PortalPage.tsx      # Main portal interface
│   ├── ReorderTab.tsx      # Recent orders tab
│   ├── ToolTab.tsx         # Tool-specific consumables
│   ├── CartBar.tsx         # Floating cart summary
│   └── QuantityPicker.tsx  # Item quantity selector
├── lib/
│   └── supabase.ts         # Database client & queries
└── types/
    └── index.ts            # TypeScript definitions
```

## Key Features Implementation

- **Token Validation**: UUID format validation before database queries
- **Cart Management**: Client-side cart state with quantity updates  
- **Preview Line**: First 3 reorder item descriptions in header
- **Cache Headers**: 60-second private cache on API responses
- **Error Handling**: Graceful fallbacks for missing data
- **Mobile Layout**: Responsive grid and navigation
