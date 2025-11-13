/**
 * Secure token generation and validation using HMAC
 * Used for tokenized offer links with TTL and tamper protection
 */

import crypto from 'crypto';

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
  offer_key?: string;
  campaign_key?: string;
  products?: string[]; // Product codes to include in quote
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
    const [payloadB64, signature] = token.split('.');

    if (!payloadB64 || !signature) {
      return null;
    }

    // Verify HMAC signature
    const hmac = crypto.createHmac('sha256', getTokenSecret());
    hmac.update(payloadB64);
    const expectedSignature = hmac.digest('base64url');

    // Constant-time comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      console.warn('[tokens] Invalid signature');
      return null;
    }

    // Decode payload
    const payloadStr = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadStr) as TokenPayload;

    // Check expiration
    if (Date.now() > payload.expires_at) {
      console.warn('[tokens] Token expired');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('[tokens] Error verifying token:', error);
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
  } = {}
): string {
  const token = generateToken({
    company_id: companyId,
    contact_id: contactId,
  }, options.ttlHours || 720); // 30 days default for reorder links

  return `${baseUrl}/r/${token}`;
}
