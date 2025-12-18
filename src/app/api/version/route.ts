/**
 * GET /api/version
 * Returns current deployment version to verify latest code is deployed
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    version: '1.1.0-address-fix',
    deployed_at: '2025-12-18T17:00:00Z',
    git_commit: '92173fb',
    features: {
      address_validation_frontend: true,
      address_validation_server: true,
      vat_verification_vies: true,
      shipping_calculation: true,
      modal_z_index_fix: true,
    },
    status: 'Address modal should appear before invoice creation',
  });
}
