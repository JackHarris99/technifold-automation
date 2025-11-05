/**
 * Media Upload API Route
 * Handles file uploads to Supabase Storage and database updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getStoragePath, MediaType, getFileExtension } from '@/lib/media';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const runtime = 'nodejs';

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

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // Get file extension and storage path
    const extension = getFileExtension(file.name);
    const storagePath = getStoragePath(mediaType, identifier, extension);

    console.log('[UPLOAD] Starting upload:', {
      mediaType,
      identifier,
      table,
      column,
      storagePath,
      fileSize: file.size,
      fileType: file.type,
    });

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
    const { searchParams } = new URL(request.url);
    const storagePath = searchParams.get('path');
    const table = searchParams.get('table');
    const column = searchParams.get('column');
    const recordId = searchParams.get('recordId');
    const idColumn = searchParams.get('idColumn') || 'id';

    if (!storagePath || !table || !column || !recordId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

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
