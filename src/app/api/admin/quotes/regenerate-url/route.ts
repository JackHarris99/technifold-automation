/**
 * POST /api/admin/quotes/regenerate-url
 * Regenerates a quote URL from stored quote data
 * Used to display/copy quote links after they've been sent
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/tokens';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { quote_id, company_id, contact_id } = body;

    if (!quote_id || !company_id || !contact_id) {
      return NextResponse.json(
        { error: 'quote_id, company_id, and contact_id are required' },
        { status: 400 }
      );
    }

    // Generate token same way as when quote was created
    const token = generateToken({
      quote_id,
      company_id,
      contact_id,
      object_type: 'quote',
      is_test: false,
    }, 720); // 30 days

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.technifold.com';
    const url = `${baseUrl}/q/${token}`;

    return NextResponse.json({
      success: true,
      url,
    });
  } catch (error) {
    console.error('[regenerate-url] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate URL' },
      { status: 500 }
    );
  }
}
