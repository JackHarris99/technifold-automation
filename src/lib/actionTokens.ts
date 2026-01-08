/**
 * Action Token System
 * Secure, expiring magic links for quick actions from emails
 * Uses HMAC-SHA256 for token generation and validation
 */

import crypto from 'crypto';
import { getSupabaseClient } from '@/lib/supabase';

const TOKEN_SECRET = process.env.TOKEN_HMAC_SECRET || process.env.CUSTOMER_TOKEN_SECRET || 'default-secret';

interface CreateTokenParams {
  user_id: string;
  action_type: string;
  quote_id?: string;
  company_id?: string;
  contact_id?: string;
  metadata?: Record<string, any>;
  expires_in_hours?: number;
  single_use?: boolean;
}

interface TokenPayload {
  token_id: string;
  user_id: string;
  action_type: string;
  quote_id?: string;
  company_id?: string;
  contact_id?: string;
  metadata?: Record<string, any>;
  expires_at: string;
  single_use: boolean;
}

/**
 * Generate a secure action token
 * Returns both the token string (to embed in URLs) and token_id (for database)
 */
export async function createActionToken(params: CreateTokenParams): Promise<{
  token: string;
  token_id: string;
  expires_at: string;
}> {
  const {
    user_id,
    action_type,
    quote_id,
    company_id,
    contact_id,
    metadata,
    expires_in_hours = 72, // 3 days default
    single_use = false,
  } = params;

  // Generate unique token ID
  const token_id = crypto.randomUUID();

  // Calculate expiration
  const expires_at = new Date();
  expires_at.setHours(expires_at.getHours() + expires_in_hours);
  const expires_at_iso = expires_at.toISOString();

  // Create token payload
  const payload: TokenPayload = {
    token_id,
    user_id,
    action_type,
    quote_id,
    company_id,
    contact_id,
    metadata,
    expires_at: expires_at_iso,
    single_use,
  };

  // Generate HMAC signature
  const payloadString = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', TOKEN_SECRET);
  hmac.update(payloadString);
  const signature = hmac.digest('hex');

  // Combine payload and signature
  const token = Buffer.from(`${payloadString}.${signature}`).toString('base64url');

  // Store token hash in database
  const token_hash = crypto.createHash('sha256').update(token).digest('hex');

  const supabase = getSupabaseClient();
  const { error } = await supabase.from('action_tokens').insert({
    token_id,
    token_hash,
    user_id,
    action_type,
    quote_id,
    company_id,
    contact_id,
    metadata: metadata || null,
    expires_at: expires_at_iso,
    single_use,
  });

  if (error) {
    console.error('[actionTokens] Failed to store token:', error);
    throw new Error('Failed to create action token');
  }

  return {
    token,
    token_id,
    expires_at: expires_at_iso,
  };
}

/**
 * Validate and decode an action token
 * Returns the payload if valid, null if invalid/expired/used
 */
export async function validateActionToken(
  token: string,
  ip_address?: string
): Promise<TokenPayload | null> {
  try {
    // Decode token
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const [payloadString, signature] = decoded.split('.');

    if (!payloadString || !signature) {
      return null;
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', TOKEN_SECRET);
    hmac.update(payloadString);
    const expectedSignature = hmac.digest('hex');

    if (signature !== expectedSignature) {
      console.error('[actionTokens] Invalid signature');
      return null;
    }

    // Parse payload
    const payload: TokenPayload = JSON.parse(payloadString);

    // Check expiration
    if (new Date(payload.expires_at) < new Date()) {
      console.error('[actionTokens] Token expired');
      return null;
    }

    // Check database record
    const token_hash = crypto.createHash('sha256').update(token).digest('hex');
    const supabase = getSupabaseClient();

    const { data: tokenRecord, error } = await supabase
      .from('action_tokens')
      .select('*')
      .eq('token_hash', token_hash)
      .single();

    if (error || !tokenRecord) {
      console.error('[actionTokens] Token not found in database');
      return null;
    }

    // Check if already used (for single-use tokens)
    if (tokenRecord.single_use && tokenRecord.used_at) {
      console.error('[actionTokens] Token already used');
      return null;
    }

    // Mark as used if single-use
    if (tokenRecord.single_use) {
      await supabase
        .from('action_tokens')
        .update({
          used_at: new Date().toISOString(),
          ip_address: ip_address || null,
        })
        .eq('token_hash', token_hash);
    } else {
      // For multi-use tokens, just update IP address
      await supabase
        .from('action_tokens')
        .update({
          ip_address: ip_address || null,
        })
        .eq('token_hash', token_hash);
    }

    return payload;
  } catch (error) {
    console.error('[actionTokens] Validation error:', error);
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

/**
 * Revoke a token (mark as used)
 */
export async function revokeActionToken(token: string): Promise<boolean> {
  try {
    const token_hash = crypto.createHash('sha256').update(token).digest('hex');
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('action_tokens')
      .update({
        used_at: new Date().toISOString(),
      })
      .eq('token_hash', token_hash);

    return !error;
  } catch (error) {
    console.error('[actionTokens] Revoke error:', error);
    return false;
  }
}
