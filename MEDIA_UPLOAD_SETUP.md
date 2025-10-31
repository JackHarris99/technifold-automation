# Media Upload System - Setup Guide

## Overview
The media upload system allows you to upload images and videos from the admin panel to Supabase Storage, with automatic database updates and placeholder fallbacks.

## Prerequisites

### 1. Supabase Storage Bucket Setup

You need to create a public storage bucket named `media` in your Supabase project:

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Name it `media`
5. Set it to **Public bucket** (important!)
6. Click **Create bucket**

### 2. Storage Policies

Add the following policies to allow public read access:

```sql
-- Allow public read access to media bucket
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- Allow authenticated users to upload (for admin panel)
CREATE POLICY "Authenticated Upload Access"
ON storage.objects FOR INSERT
TO authenticated
USING (bucket_id = 'media');

-- Allow authenticated users to update
CREATE POLICY "Authenticated Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');
```

**Note:** If you're using the service role key (recommended for admin operations), these policies are automatically bypassed.

### 3. Environment Variables

Ensure these environment variables are set in your `.env.local`:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co  # For client-side media URLs
```

## Features Implemented

### ✅ Core Infrastructure
- **Media Utility Library** (`src/lib/media.ts`): Handles storage paths, URL resolution, and fallback logic
- **MediaImage Component** (`src/components/shared/MediaImage.tsx`): Smart image component with automatic placeholders
- **MediaUpload Component** (`src/components/admin/MediaUpload.tsx`): Reusable upload widget
- **Upload API** (`src/app/api/admin/media/upload/route.ts`): Handles file uploads and database updates
- **Missing Media API** (`src/app/api/admin/media/missing/route.ts`): Queries for records with NULL media

### ✅ Admin Pages
- **Missing Media Upload Page** (`/admin/media-missing`): Tabbed interface showing all missing media
  - Products tab
  - Solutions tab
  - Problems tab
  - Solution × Problem tab
  - Machine × Solution × Problem tab
  - Brands tab

### ✅ Storage Path Structure
All files are uploaded to deterministic paths:

| Media Type | Path Pattern | Example |
|------------|--------------|---------|
| Product | `media/products/{product_code}.jpg` | `media/products/MATRIX-RED.jpg` |
| Solution | `media/solutions/{solution_id}.jpg` | `media/solutions/abc123.jpg` |
| Problem | `media/problems/{problem_id}.jpg` | `media/problems/def456.jpg` |
| Solution × Problem | `media/ps/{solution_id}__{problem_id}.jpg` | `media/ps/abc123__def456.jpg` |
| Machine × Solution × Problem | `media/msp/{machine_solution_id}__{problem_id}.jpg` | `media/msp/xyz789__def456.jpg` |
| Brand Logo | `media/brands/{brand_slug}.png` | `media/brands/heidelberg-stahlfolder.png` |
| Machine Hero | `media/machines/{machine_slug}.jpg` | `media/machines/horizon-bq-300.jpg` |

### ✅ Image Hierarchy (Fallback Logic)
For machine × solution × problem cards, images follow this priority:
1. Machine-specific override (`machine_solution_problem.override_image_url`)
2. Solution × Problem pair (`solution_problem.default_image_url`)
3. Individual Solution OR Problem (`solutions.default_image_url` or `problems.default_image_url`)
4. Global placeholder (`/placeholder.png`)

## How to Use

### 1. Access the Missing Media Page
1. Log into the admin panel
2. Click **Missing Media** in the top navigation
3. Select a tab to view missing media for that type
4. Upload images/videos directly from the list
5. Items disappear from the list once media is uploaded

### 2. Upload Workflow
1. Click **Upload image** or **Upload video** button
2. Select a file from your computer (max 10MB)
3. File is automatically uploaded to Supabase Storage
4. Database is updated with the public URL
5. Preview updates immediately

### 3. Supported File Types
- **Images**: JPG, JPEG, PNG, WebP, GIF
- **Videos**: MP4, WebM, QuickTime

## Next Steps

### Pending Integrations
The following admin pages still need upload functionality added:
- [ ] SKU Explorer product cards
- [ ] Problem management cards
- [ ] Solution management cards
- [ ] Solution × Problem editor
- [ ] Machine × Solution × Problem editor
- [ ] Brand media management page

### All Existing Card Components
The following components need to be updated to use the `MediaImage` component for automatic placeholder support:
- Product cards
- Solution cards
- Problem cards
- Brand cards
- Machine cards

## Testing

### 1. Test Upload
1. Go to `/admin/media-missing`
2. Select the **Products** tab
3. Find a product with missing media
4. Upload a test image
5. Verify it appears in the preview
6. Check Supabase Storage to confirm the file exists at the correct path

### 2. Test Placeholder
1. Find a record with no image uploaded
2. Verify it shows the placeholder image with "No Image Available" text
3. Verify placeholder has reduced opacity (30%)

### 3. Test Deletion
1. Upload an image
2. Click **Delete** button
3. Verify file is removed from Supabase Storage
4. Verify database column is set to NULL
5. Verify placeholder appears again

## Troubleshooting

### Upload fails with "Upload failed: new row violates row-level security policy"
- Make sure the `media` bucket exists and is set to **public**
- Verify you're using the `SUPABASE_SERVICE_ROLE_KEY` (not the anon key)

### Images don't display after upload
- Check the browser console for CORS errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` is set correctly
- Ensure the bucket is set to **public**

### "File too large" error
- Maximum file size is 10MB
- Compress images before uploading
- Use appropriate formats (WebP for best compression)

## Database Schema Reference

All schema changes are already applied. Here's what was added:

```sql
-- Products
ALTER TABLE products ADD COLUMN image_url TEXT;
ALTER TABLE products ADD COLUMN video_url TEXT;

-- Solutions
ALTER TABLE solutions ADD COLUMN default_image_url TEXT;
ALTER TABLE solutions ADD COLUMN default_video_url TEXT;

-- Problems
ALTER TABLE problems ADD COLUMN default_image_url TEXT;
ALTER TABLE problems ADD COLUMN default_video_url TEXT;

-- Solution × Problem
ALTER TABLE solution_problem ADD COLUMN default_image_url TEXT;
ALTER TABLE solution_problem ADD COLUMN default_video_url TEXT;

-- Machine × Solution × Problem
ALTER TABLE machine_solution_problem ADD COLUMN override_image_url TEXT;
ALTER TABLE machine_solution_problem ADD COLUMN override_video_url TEXT;

-- Brands
CREATE TABLE brand_media (
  brand_slug TEXT PRIMARY KEY,
  brand_name TEXT NOT NULL,
  logo_url TEXT,
  hero_url TEXT
);
```

## Architecture Notes

### Why Supabase Storage?
- **Public URLs**: Automatic public URL generation
- **CDN**: Built-in CDN for fast global delivery
- **RLS**: Row-level security integration
- **Scalability**: Unlimited storage (pay-as-you-go)

### Why Deterministic Paths?
- **No Metadata**: Don't need to store filename in database
- **Predictable**: Easy to debug and find files
- **Atomic Updates**: Upsert mode overwrites old files automatically

### Why Server-Side Upload?
- **Security**: File validation and size limits enforced server-side
- **Database Atomicity**: Upload + database update in single transaction
- **Error Handling**: Proper error messages and rollback on failure
