/**
 * Customer Authentication Library
 * Session-based auth for customer portal (not token-based)
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export interface CustomerSession {
  user_id: string;
  company_id: string;
  contact_id: string | null;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'user';
  internal_preview?: boolean; // True when admin uses "Login As" to preview customer portal
}

/**
 * Get current customer session from cookie
 */
export async function getCustomerSession(): Promise<CustomerSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('customer_session')?.value;

    if (!token) {
      return null;
    }

    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as CustomerSession;
  } catch (error) {
    return null;
  }
}

/**
 * Create session token and set cookie
 */
export async function createCustomerSession(user: CustomerSession): Promise<void> {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d') // 30 day session
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set('customer_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
}

/**
 * Clear customer session
 */
export async function clearCustomerSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('customer_session');
}

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verify password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
