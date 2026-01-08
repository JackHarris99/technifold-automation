/**
 * Action Token System
 * Stateless HMAC-signed tokens for quick actions from emails
 * Works exactly like customer tokens (/r/[token], /q/[token])
 */

import crypto from 'crypto';

function getTokenSecret(): string {
  const secret = process.env.TOKEN_HMAC_SECRET;
  if (!secret) {
    throw new Error('TOKEN_HMAC_SECRET environment variable is required');
  }
  return secret;
}

interface CreateTokenParams {
  user_id: string;
  action_type: string;
  quote_id?: string;
  company_id?: string;
  contact_id?: string;
  metadata?: Record<string, any>;
  expires_in_hours?: number;
}

interface TokenPayload {
  user_id: string;
  action_type: string;
  quote_id?: string;
  company_id?: string;
  contact_id?: string;
  metadata?: Record<string, any>;
  expires_at: number;
}

/**
 * Generate a secure action token
 * Returns just the token string (stateless, no database storage)
 */
export function createActionToken(params: CreateTokenParams): {
  token: string;
  expires_at: string;
} {
  const {
    user_id,
    action_type,
    quote_id,
    company_id,
    contact_id,
    metadata,
    expires_in_hours = 72, // 3 days default
  } = params;

  // Calculate expiration timestamp
  const expiresAt = Date.now() + (expires_in_hours * 60 * 60 * 1000);

  // Create token payload
  const payload: TokenPayload = {
    user_id,
    action_type,
    quote_id,
    company_id,
    contact_id,
    metadata,
    expires_at: expiresAt,
  };

  // Encode payload as base64
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadStr).toString('base64url');

  // Generate HMAC signature
  const hmac = crypto.createHmac('sha256', getTokenSecret());
  hmac.update(payloadB64);
  const signature = hmac.digest('base64url');

  // Return token as: payload.signature (same format as customer tokens)
  return {
    token: `${payloadB64}.${signature}`,
    expires_at: new Date(expiresAt).toISOString(),
  };
}

/**
 * Validate and decode an action token
 * Returns the payload if valid, null if invalid/expired
 */
export function validateActionToken(token: string): TokenPayload | null {
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
      console.warn('[actionTokens] Invalid signature');
      return null;
    }

    // Decode payload
    const payloadStr = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadStr) as TokenPayload;

    // Check expiration
    if (Date.now() > payload.expires_at) {
      console.warn('[actionTokens] Token expired');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('[actionTokens] Error verifying token:', error);
    return null;
  }
}

/**
 * Generate action URL for email links
 */
export function getActionUrl(token: string, action_type: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Map action types to URL paths
  const actionPaths: Record<string, string> = {
    log_call: '/a/call',
    add_note: '/a/note',
    send_followup: '/a/followup',
    view_quote: '/a/quote',
    view_company: '/a/company',
    view_task: '/a/task',
  };

  const path = actionPaths[action_type] || '/a/action';
  return `${baseUrl}${path}/${token}`;
}

