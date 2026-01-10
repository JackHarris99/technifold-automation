/**
 * Test Script: Generate Multiple Tokens for Same Quote
 * Run this to test idempotency with multiple tokens
 *
 * Usage: node test-multiple-tokens.js <quote_id>
 */

const crypto = require('crypto');

const TOKEN_HMAC_SECRET = process.env.TOKEN_HMAC_SECRET || 'your-secret-here';

function generateToken(payload, ttlHours = 720) {
  const expiresAt = Date.now() + (ttlHours * 60 * 60 * 1000);
  const fullPayload = { ...payload, expires_at: expiresAt };

  const payloadStr = JSON.stringify(fullPayload);
  const payloadB64 = Buffer.from(payloadStr).toString('base64url');

  const hmac = require('crypto').createHmac('sha256', TOKEN_HMAC_SECRET);
  hmac.update(payloadB64);
  const signature = hmac.digest('base64url');

  return `${payloadB64}.${signature}`;
}

// Example: Generate 3 tokens for same quote
const quote_id = 'YOUR_QUOTE_ID_HERE';
const company_id = 'YOUR_COMPANY_ID_HERE';

const tokenA = generateToken({
  quote_id,
  company_id,
  contact_id: 'CONTACT_A_UUID',
  object_type: 'quote',
});

const tokenB = generateToken({
  quote_id,
  company_id,
  contact_id: 'CONTACT_B_UUID',
  object_type: 'quote',
});

const tokenC = generateToken({
  quote_id,
  company_id,
  contact_id: 'CONTACT_C_UUID',
  object_type: 'quote',
});

console.log('Token A:', `https://www.technifold.com/q/${tokenA}`);
console.log('Token B:', `https://www.technifold.com/q/${tokenB}`);
console.log('Token C:', `https://www.technifold.com/q/${tokenC}`);
