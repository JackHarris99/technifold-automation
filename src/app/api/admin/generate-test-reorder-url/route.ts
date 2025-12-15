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

    // Use the deployed URL or localhost
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                    'http://localhost:3000';

    // Generate the tokenized URL (30 days TTL)
    const url = generateReorderUrl(baseUrl, company_id, contact_id);

    return NextResponse.json({ url });
  } catch (error) {
    console.error('[generate-test-reorder-url] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate URL' },
      { status: 500 }
    );
  }
}
