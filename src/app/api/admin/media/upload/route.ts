/**
 * Media Upload API Route
 * Handles file uploads to Supabase Storage and database updates
 * SECURITY: Validates table/column combinations against whitelist
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getStoragePath, MediaType, getFileExtension } from '@/lib/media';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';

// Whitelist of allowed table/column combinations
// SECURITY: Prevents SQL injection by validating user input
const ALLOWED_MEDIA_TARGETS = {
  'products': ['product_image_url', 'image_url'],
  'brand_media': ['logo_url', 'hero_url', 'banner_url', 'before_image_url', 'after_image_url', 'product_image_url'],
  'companies': ['logo_url'],
  'case_studies': ['before_image_url', 'after_image_url', 'product_image_url'],
} as const;

// Allowed ID column names (for WHERE clause)
const ALLOWED_ID_COLUMNS = ['id', 'product_id', 'product_code', 'brand_slug', 'company_id', 'case_study_id'] as const;

interface UploadRequest {
  mediaType: MediaType;
  identifier: string;
  table: string;
  column: string;
  recordId: string;
  idColumn?: string; // Column name for WHERE clause (defaults to 'id')
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mediaType = formData.get('mediaType') as MediaType;
    const identifier = formData.get('identifier') as string;
    const table = formData.get('table') as string;
    const column = formData.get('column') as string;
    const recordId = formData.get('recordId') as string;
    const idColumn = (formData.get('idColumn') as string) || 'id';

    // No longer need composite keys - new schema uses simple UUIDs

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!mediaType || !identifier || !table || !column || !recordId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // SECURITY: Validate table/column combination against whitelist
    const allowedColumns = ALLOWED_MEDIA_TARGETS[table as keyof typeof ALLOWED_MEDIA_TARGETS];
    if (!allowedColumns) {
      console.error('[UPLOAD] Invalid table:', table);
      return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    if (!allowedColumns.includes(column as any)) {
      console.error('[UPLOAD] Invalid column for table:', { table, column });
      return NextResponse.json({ error: 'Invalid column name for this table' }, { status: 400 });
    }

    // SECURITY: Validate idColumn against whitelist
    if (!ALLOWED_ID_COLUMNS.includes(idColumn as any)) {
      console.error('[UPLOAD] Invalid idColumn:', idColumn);
      return NextResponse.json({ error: 'Invalid ID column name' }, { status: 400 });
    }

    // SECURITY: Validate recordId format to prevent SQL injection
    // Allow: UUIDs, product codes (uppercase, with slashes), slugs
    // Block: SQL injection characters like quotes, semicolons, etc.
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(recordId);
    const isValidCode = /^[A-Za-z0-9_\-\/]+$/.test(recordId); // Product codes (with /), slugs, etc.

    if (!isValidUUID && !isValidCode) {
      console.error('[UPLOAD] Invalid recordId format:', recordId);
      return NextResponse.json({ error: 'Invalid record ID format' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // Get file extension and storage path
    const extension = getFileExtension(file.name);

    // Generate unique path based on column to avoid overwrites
    // For multiple image types (before/after/product), include column in filename
    let pathIdentifier = identifier;
    if (column === 'before_image_url') {
      pathIdentifier = `${identifier}_before`;
    } else if (column === 'after_image_url') {
      pathIdentifier = `${identifier}_after`;
    } else if (column === 'product_image_url') {
      pathIdentifier = `${identifier}_product`;
    }

    const storagePath = getStoragePath(mediaType, pathIdentifier, extension);

    console.log('[UPLOAD] Starting upload:', {
      mediaType,
      identifier,
      table,
      column,
      storagePath,
      fileSize: file.size,
      fileType: file.type,
    });

    const supabase = getSupabaseClient();

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true, // Overwrite if exists
      });

    if (uploadError) {
      console.error('[UPLOAD] Upload error:', uploadError);
      return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 });
    }

    console.log('[UPLOAD] Upload successful:', uploadData);

    // Get public URL
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;

    console.log('[UPLOAD] Generated public URL:', publicUrl);

    // Update database with public URL
    // Special handling for brand_media (might not exist yet - use upsert)
    if (table === 'brand_media') {
      // recordId is the brand_slug, we need to get the brand name
      // Try to find existing brand_media record first
      const { data: existingBrand } = await supabase
        .from('brand_media')
        .select('brand_name')
        .eq('brand_slug', recordId)
        .single();

      let brandName = existingBrand?.brand_name;

      // If not found, try to derive from brand_slug
      if (!brandName) {
        // Convert slug back to title case (e.g., "heidelberg-stahlfolder" -> "Heidelberg Stahlfolder")
        brandName = recordId
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }

      const { error: upsertError } = await supabase
        .from('brand_media')
        .upsert(
          {
            brand_slug: recordId,
            brand_name: brandName,
            [column]: publicUrl,
          },
          { onConflict: 'brand_slug' }
        );

      if (upsertError) {
        console.error('Database upsert error:', upsertError);
        return NextResponse.json({ error: 'Database upsert failed: ' + upsertError.message }, { status: 500 });
      }
    } else {
      // Standard update for all other tables (now all use simple UUIDs)
      const { error: updateError, data: updateData } = await supabase
        .from(table)
        .update({ [column]: publicUrl })
        .eq(idColumn, recordId)
        .select();

      if (updateError) {
        console.error('[UPLOAD] Database update error:', updateError);
        return NextResponse.json({ error: 'Database update failed: ' + updateError.message }, { status: 500 });
      }

      console.log('[UPLOAD] Database updated successfully:', updateData);
    }

    console.log('[UPLOAD] Complete! Returning URL:', publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: storagePath,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}

/**
 * Delete media file
 */
export async function DELETE(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const storagePath = searchParams.get('path');
    const table = searchParams.get('table');
    const column = searchParams.get('column');
    const recordId = searchParams.get('recordId');
    const idColumn = searchParams.get('idColumn') || 'id';

    if (!storagePath || !table || !column || !recordId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // SECURITY: Validate table/column combination against whitelist
    const allowedColumns = ALLOWED_MEDIA_TARGETS[table as keyof typeof ALLOWED_MEDIA_TARGETS];
    if (!allowedColumns) {
      console.error('[DELETE] Invalid table:', table);
      return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    if (!allowedColumns.includes(column as any)) {
      console.error('[DELETE] Invalid column for table:', { table, column });
      return NextResponse.json({ error: 'Invalid column name for this table' }, { status: 400 });
    }

    // SECURITY: Validate idColumn against whitelist
    if (!ALLOWED_ID_COLUMNS.includes(idColumn as any)) {
      console.error('[DELETE] Invalid idColumn:', idColumn);
      return NextResponse.json({ error: 'Invalid ID column name' }, { status: 400 });
    }

    // SECURITY: Validate recordId format to prevent SQL injection
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(recordId);
    const isValidCode = /^[A-Za-z0-9_\-\/]+$/.test(recordId); // Product codes (with /), slugs, etc.

    if (!isValidUUID && !isValidCode) {
      console.error('[DELETE] Invalid recordId format:', recordId);
      return NextResponse.json({ error: 'Invalid record ID format' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Delete from storage
    const { error: deleteError } = await supabase.storage.from('media').remove([storagePath]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      // Continue even if delete fails (file might not exist)
    }

    // Update database to NULL
    const { error: updateError } = await supabase
      .from(table)
      .update({ [column]: null })
      .eq(idColumn, recordId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json({ error: 'Database update failed: ' + updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: error.message || 'Delete failed' }, { status: 500 });
  }
}
