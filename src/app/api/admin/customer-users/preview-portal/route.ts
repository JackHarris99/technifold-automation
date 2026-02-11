/**
 * GET /api/admin/customer-users/preview-portal?company_id=xxx
 * Admin-only: Check what products a customer will see in their portal
 */

import { NextRequest, NextResponse } from 'next/router';
import { getCurrentUser } from '@/lib/auth';
import { generatePortalPayload } from '@/lib/portal-payload';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');

    if (!company_id) {
      return NextResponse.json({ error: 'company_id required' }, { status: 400 });
    }

    // Generate portal payload to see what customer will see
    const payload = await generatePortalPayload(company_id);

    if (!payload) {
      return NextResponse.json({
        has_content: false,
        message: 'No previous orders found - portal will be empty',
      });
    }

    const totalProducts = payload.reorder_items.length +
      (payload.by_tool_tabs?.reduce((sum, tab) => sum + tab.items.length, 0) || 0);

    return NextResponse.json({
      has_content: true,
      message: `Portal has ${totalProducts} products from previous orders`,
      summary: {
        total_products: totalProducts,
        reorder_items: payload.reorder_items.length,
        tool_tabs: payload.by_tool_tabs?.length || 0,
        company_name: payload.company_name,
      },
    });
  } catch (error: any) {
    console.error('[Preview Portal] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
