/**
 * Portal Authentication Helper
 * Supports both token-based (reorder links) and session-based (logged-in) portals
 */

import { verifyToken } from '@/lib/tokens';
import { getCustomerSession } from '@/lib/customerAuth';

interface PortalAuth {
  company_id: string;
  contact_id?: string;
  user_id?: string; // Customer user_id (for customer portal orders)
}

/**
 * Get portal authentication from either token or session
 * Checks token parameter first, then falls back to customer session cookie
 */
export async function getPortalAuth(token?: string): Promise<PortalAuth | null> {
  // Method 1: Token-based (reorder links)
  if (token && !token.startsWith('session:')) {
    const payload = verifyToken(token);
    if (payload && payload.company_id) {
      return {
        company_id: payload.company_id,
        contact_id: payload.contact_id,
      };
    }
  }

  // Method 2: Session-based (logged-in customers)
  const session = await getCustomerSession();
  if (session) {
    return {
      company_id: session.company_id,
      contact_id: undefined, // Session doesn't have contact_id
      user_id: session.user_id, // Customer user_id from customer_users table
    };
  }

  return null;
}
