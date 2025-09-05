import { NextRequest, NextResponse } from 'next/server';
import { getPayloadByToken } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const payload = await getPayloadByToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Portal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'private, max-age=60',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}