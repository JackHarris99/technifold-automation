import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.delete('admin_authorized');
  cookieStore.delete('current_user');

  return NextResponse.json({ success: true });
}
