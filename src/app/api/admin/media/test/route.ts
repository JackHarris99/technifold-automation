/**
 * Test Media Upload System
 * Diagnostic endpoint to check storage and database
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productCode = searchParams.get('product_code') || 'MATRIX-RED';

  try {
    const results: any = {
      productCode,
      timestamp: new Date().toISOString(),
    };

    // 1. Check if bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    results.buckets = buckets?.map(b => ({ name: b.name, public: b.public }));
    results.mediaBucketExists = buckets?.some(b => b.name === 'media');

    if (bucketError) {
      results.bucketError = bucketError.message;
    }

    // 2. List files in media bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('media')
      .list('products', { limit: 10 });

    results.sampleFiles = files?.map(f => f.name);
    if (filesError) {
      results.filesError = filesError.message;
    }

    // 3. Check if specific product image exists
    const testPath = `media/products/${productCode}.jpg`;
    const { data: fileExists } = await supabase.storage
      .from('media')
      .list('products', {
        search: `${productCode}.jpg`,
      });

    results.productImageExists = fileExists && fileExists.length > 0;

    // 4. Get public URL for test product
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(testPath);
    results.generatedUrl = urlData.publicUrl;

    // 5. Check database for image_url
    const { data: product, error: dbError } = await supabase
      .from('products')
      .select('product_code, description, image_url')
      .eq('product_code', productCode)
      .single();

    results.databaseProduct = product;
    results.databaseImageUrl = product?.image_url;
    results.databaseError = dbError?.message;

    // 6. Test if URL is accessible
    if (results.databaseImageUrl) {
      try {
        const testFetch = await fetch(results.databaseImageUrl, { method: 'HEAD' });
        results.imageAccessible = testFetch.ok;
        results.imageStatus = testFetch.status;
      } catch (e: any) {
        results.imageFetchError = e.message;
      }
    }

    // 7. Environment check
    results.env = {
      SUPABASE_URL: process.env.SUPABASE_URL?.substring(0, 30) + '...',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    };

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
