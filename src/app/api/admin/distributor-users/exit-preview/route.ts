/**
 * POST /api/admin/distributor-users/exit-preview
 * Exit distributor preview mode and return to admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify admin is still logged in
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete distributor preview session
    const cookieStore = await cookies();
    cookieStore.delete('distributor_token');

    return NextResponse.json({
      success: true,
      message: 'Exited preview mode',
      redirect: '/admin/distributors',
    });
  } catch (error: any) {
    console.error('[Exit Preview] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
