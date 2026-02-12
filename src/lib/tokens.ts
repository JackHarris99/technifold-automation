/**
 * Secure token generation and validation using HMAC
 * Used for tokenized offer links with TTL and tamper protection
 */

import crypto from 'node:crypto';

const TOKEN_TTL_HOURS = 72; // 3 days default

// Lazy-load secret to avoid build-time errors
function getTokenSecret(): string {
  const secret = process.env.TOKEN_HMAC_SECRET;
  if (!secret) {
    throw new Error('TOKEN_HMAC_SECRET environment variable is required');
  }
  return secret;
}

export interface TokenPayload {
  company_id: string;
  contact_id?: string;
  quote_id?: string; // For quote links - links to specific quote object
  object_type?: 'quote' | 'reorder' | 'offer' | 'trial' | 'unsubscribe'; // Distinguishes link types
  offer_key?: string;
  campaign_key?: string;
  products?: string[]; // Product codes to include in quote
  machine_slug?: string; // For trial links
  offer_price?: number; // For trial links
  email?: string; // For trial links
  company_name?: string; // For trial links
  contact_name?: string; // For trial links
  isTest?: boolean; // For test tokens that bypass address collection
  is_test?: boolean; // Legacy field for backward compatibility
  expires_at: number; // Unix timestamp
}

/**
 * Generate a secure HMAC-signed token
 */
export function generateToken(payload: Omit<TokenPayload, 'expires_at'>, ttlHours: number = TOKEN_TTL_HOURS): string {
  const expiresAt = Date.now() + (ttlHours * 60 * 60 * 1000);

  const fullPayload: TokenPayload = {
    ...payload,
    expires_at: expiresAt,
  };

  // Encode payload as base64
  const payloadStr = JSON.stringify(fullPayload);
  const payloadB64 = Buffer.from(payloadStr).toString('base64url');

  // Generate HMAC signature
  const hmac = crypto.createHmac('sha256', getTokenSecret());
  hmac.update(payloadB64);
  const signature = hmac.digest('base64url');

  // Return token as: payload.signature
  return `${payloadB64}.${signature}`;
}

/**
 * Verify and decode a token
 * Returns payload if valid, null if invalid or expired
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    if (!token) {
      console.error('[tokens] Token is null/undefined');
      return null;
    }

    if (typeof token !== 'string') {
      console.error('[tokens] Token is not a string, type:', typeof token);
      return null;
    }

    const [payloadB64, signature] = token.split('.');

    if (!payloadB64 || !signature) {
      console.error('[tokens] Token missing payload or signature. Has dot:', token.includes('.'), 'parts:', token.split('.').length);
      return null;
    }

    // Verify HMAC signature
    const hmac = crypto.createHmac('sha256', getTokenSecret());
    hmac.update(payloadB64);
    const expectedSignature = hmac.digest('base64url');

    // Constant-time comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      console.error('[tokens] Invalid signature - HMAC mismatch');
      console.error('[tokens] Signature length - received:', signature.length, 'expected:', expectedSignature.length);
      console.error('[tokens] First 20 chars - received:', signature.substring(0, 20), 'expected:', expectedSignature.substring(0, 20));
      return null;
    }

    // Decode payload
    const payloadStr = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadStr) as TokenPayload;

    // Check expiration
    if (Date.now() > payload.expires_at) {
      const expiryDate = new Date(payload.expires_at);
      const now = new Date();
      console.error('[tokens] Token expired');
      console.error('[tokens] Expiry:', expiryDate.toISOString(), 'Now:', now.toISOString());
      console.error('[tokens] Expired by (hours):', ((Date.now() - payload.expires_at) / (1000 * 60 * 60)).toFixed(2));
      return null;
    }

    return payload;
  } catch (error) {
    console.error('[tokens] Error verifying token:', error);
    console.error('[tokens] Token value (first 100 chars):', token?.substring(0, 100));
    return null;
  }
}

/**
 * Generate a tokenized URL for an offer
 */
export function generateOfferUrl(
  baseUrl: string,
  companyId: string,
  offerKey: string,
  options: {
    contactId?: string;
    campaignKey?: string;
    ttlHours?: number;
  } = {}
): string {
  const token = generateToken({
    company_id: companyId,
    contact_id: options.contactId,
    offer_key: offerKey,
    campaign_key: options.campaignKey,
  }, options.ttlHours);

  return `${baseUrl}/x/${token}`;
}

/**
 * Generate a tokenized URL for reorder portal
 */
export function generateReorderUrl(
  baseUrl: string,
  companyId: string,
  contactId: string,
  options: {
    ttlHours?: number;
    isTest?: boolean;
  } = {}
): string {
  const token = generateToken({
    company_id: companyId,
    contact_id: contactId,
    object_type: 'reorder', // Marks this as a reorder portal link (not quote)
    isTest: options.isTest,
  }, options.ttlHours || 720); // 30 days default for reorder links

  return `${baseUrl}/r/${token}`;
}

/**
 * Generate a token for trial signup
 * Returns just the token (URL built separately)
 */
export function generateTrialToken(data: {
  company_id: string;
  contact_id: string;
  machine_slug: string;
  offer_price: number;
  email: string;
  company_name: string;
  contact_name: string;
}): string {
  return generateToken({
    company_id: data.company_id,
    contact_id: data.contact_id,
    machine_slug: data.machine_slug,
    offer_price: data.offer_price,
    email: data.email,
    company_name: data.company_name,
    contact_name: data.contact_name,
  }, 168); // 7 days TTL for trial links
}

/**
 * Generate unsubscribe URL for marketing emails
 * Long TTL (365 days) since unsubscribe links should remain valid
 */
export function generateUnsubscribeUrl(
  baseUrl: string,
  contactId: string,
  email: string,
  companyId?: string
): string {
  const token = generateToken({
    company_id: companyId || '',
    contact_id: contactId,
    email: email,
  }, 8760); // 365 days TTL for unsubscribe links

  return `${baseUrl}/u/${token}`;
}

/**
 * Backward compatibility helper for UUID migration
 * Detects if company_id is old TEXT format (Sage code) or new UUID format
 * Returns correct column name and value for querying
 *
 * @param companyId - Company ID from token (could be TEXT or UUID)
 * @returns Object with column name and value for .eq() query
 */
export function getCompanyQueryField(companyId: string): { column: string; value: string } {
  // UUID regex pattern: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (uuidPattern.test(companyId)) {
    // New UUID format - query by company_id
    return { column: 'company_id', value: companyId };
  } else {
    // Old TEXT format (Sage customer code) - query by sage_customer_code
    return { column: 'sage_customer_code', value: companyId };
  }
}
