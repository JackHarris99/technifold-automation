/**
 * POST /api/admin/generate-test-reorder-url
 * Generate a real tokenized reorder URL for testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateReorderUrl } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  try {
    const { company_id, contact_id } = await request.json();

    if (!company_id || !contact_id) {
      return NextResponse.json(
        { error: 'company_id and contact_id are required' },
        { status: 400 }
      );
    }

    // Use the production URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.technifold.com';

    // Generate the tokenized URL (30 days TTL) with test flag to bypass address collection
    const url = generateReorderUrl(baseUrl, company_id, contact_id, { isTest: true });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('[generate-test-reorder-url] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate URL' },
      { status: 500 }
    );
  }
}
