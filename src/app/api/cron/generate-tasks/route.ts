/**
 * POST /api/cron/generate-tasks
 * Cron job endpoint to auto-generate follow-up tasks
 * Should be called daily (e.g., via Vercel Cron or external scheduler)
 */

import { NextRequest, NextResponse } from 'next/server';
import { runAllTaskGenerators } from '@/lib/taskGenerator';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET || 'default-secret'}`;

    if (authHeader !== expectedAuth) {
      console.error('[cron/generate-tasks] Unauthorized request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[cron/generate-tasks] Starting task generation...');

    const results = await runAllTaskGenerators();

    console.log('[cron/generate-tasks] Task generation complete:', results);

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error('[cron/generate-tasks] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also support GET for manual testing
export async function GET(request: NextRequest) {
  // Check if running in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'GET method only available in development' },
      { status: 403 }
    );
  }

  console.log('[cron/generate-tasks] Manual trigger (dev mode)');

  try {
    const results = await runAllTaskGenerators();

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error('[cron/generate-tasks] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
