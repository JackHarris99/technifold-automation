/**
 * Distributor Authentication Helpers
 */

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this'
);

interface DistributorPayload {
  company_id: string;
  company_name: string;
  type: string;
  account_owner: string;
}

export async function getCurrentDistributor(): Promise<DistributorPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('distributor_token');

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token.value, JWT_SECRET);

    return payload as unknown as DistributorPayload;
  } catch (error) {
    return null;
  }
}

export async function requireDistributor(): Promise<DistributorPayload> {
  const distributor = await getCurrentDistributor();

  if (!distributor) {
    throw new Error('Unauthorized');
  }

  return distributor;
}
