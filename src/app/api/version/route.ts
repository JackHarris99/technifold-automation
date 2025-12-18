/**
 * GET /api/version
 * Returns current deployment version to verify latest code is deployed
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    version: '1.2.0-security-hardening',
    deployed_at: new Date().toISOString(),
    features: {
      token_verification_customer_apis: true,
      address_validation_admin_invoice_builder: true,
      address_validation_portal: true,
      address_validation_server_side: true,
      vat_verification_vies: true,
      shipping_calculation: true,
      dead_code_removed: true,
    },
    security: {
      customer_api_token_auth: 'HMAC-SHA256 verification required',
      admin_api_company_id_validation: 'Server-side address checking',
      portal_api_backend_validation: 'Full address verification',
    },
    status: 'All invoice creation paths secured with address validation and token verification',
  });
}
