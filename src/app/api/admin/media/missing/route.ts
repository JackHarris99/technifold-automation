/**
 * Missing Media API Route
 * Fetches records with NULL image/video URLs
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'Prefer': 'return=representation',
      },
    },
  }
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let result: any = {};

    // Products (missing image_url or video_url)
    // Supabase has 1000-row hard limit, fetch multiple pages
    if (!type || type === 'products') {
      let allProducts: any[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data: products, error } = await supabase
          .from('products')
          .select('product_code, description, category, type, image_url, video_url')
          .eq('active', true)
          .or('image_url.is.null,video_url.is.null')
          .order('product_code')
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) throw error;

        if (!products || products.length === 0) {
          hasMore = false;
        } else {
          allProducts = allProducts.concat(products);
          hasMore = products.length === pageSize; // Continue if we got a full page
          page++;
        }

        // Safety: max 10 pages (10,000 products)
        if (page >= 10) break;
      }

      result.products = allProducts.map((p) => ({
        id: p.product_code,
        name: `${p.product_code} - ${p.description}`,
        category: p.category,
        type: p.type,
        missing_image: !p.image_url,
        missing_video: !p.video_url,
        image_url: p.image_url,
        video_url: p.video_url,
      }));
    }

    // Problem/Solutions (missing image_url or video_url)
    if (!type || type === 'problem_solution') {
      const { data: ps, error } = await supabase
        .from('problem_solution')
        .select('id, title, solution_name, image_url, video_url')
        .or('image_url.is.null,video_url.is.null')
        .eq('active', true)
        .order('title')
        .range(0, 1999); // 0-1999 = 2000 rows

      if (error) throw error;

      result.problem_solution = ps?.map((item: any) => ({
        id: item.id,
        name: `${item.solution_name} - ${item.title}`,
        missing_image: !item.image_url,
        missing_video: !item.video_url,
        image_url: item.image_url,
        video_url: item.video_url,
      }));
    }

    // Problem/Solution × Machine (missing override image_url or video_url)
    // Supabase has 1000-row hard limit, fetch multiple pages
    if (!type || type === 'problem_solution_machine') {
      let allPSM: any[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data: psm, error } = await supabase
          .from('problem_solution_machine')
          .select(`
            id,
            problem_solution_id,
            machine_id,
            image_url,
            video_url,
            problem_solution:problem_solution_id(title, solution_name),
            machines:machine_id(display_name)
          `)
          .or('image_url.is.null,video_url.is.null')
          .order('machine_id')
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) throw error;

        if (!psm || psm.length === 0) {
          hasMore = false;
        } else {
          allPSM = allPSM.concat(psm);
          hasMore = psm.length === pageSize;
          page++;
        }

        // Safety: max 10 pages (10,000 records)
        if (page >= 10) break;
      }

      result.problem_solution_machine = allPSM.map((item: any) => {
        const ps = item.problem_solution;
        const machineName = item.machines?.display_name || item.machine_id || 'Unknown';
        const solutionName = ps?.solution_name || 'Unknown';
        const problemTitle = ps?.title || 'Unknown';

        return {
          id: item.id,
          problem_solution_id: item.problem_solution_id,
          machine_id: item.machine_id,
          name: `${machineName} → ${solutionName} - ${problemTitle}`,
          missing_image: !item.image_url,
          missing_video: !item.video_url,
          image_url: item.image_url,
          video_url: item.video_url,
        };
      });
    }

    // Brands (missing logo_url or hero_url)
    if (!type || type === 'brands') {
      const { data: brands, error } = await supabase
        .from('brand_media')
        .select('brand_slug, brand_name, logo_url, hero_url')
        .or('logo_url.is.null,hero_url.is.null')
        .order('brand_name')
        .limit(500);

      if (error) throw error;

      result.brands = brands?.map((b) => ({
        id: b.brand_slug,
        name: b.brand_name,
        missing_logo: !b.logo_url,
        missing_hero: !b.hero_url,
        logo_url: b.logo_url,
        hero_url: b.hero_url,
      }));
    }

    // Site Logos (company branding - Technifold, Technicrease, CreaseStream)
    if (!type || type === 'site_logos') {
      const { data: siteLogos, error } = await supabase
        .from('site_branding')
        .select('brand_key, brand_name, logo_url')
        .or('logo_url.is.null')
        .order('brand_key')
        .limit(10);

      if (error) {
        console.warn('[missing-media] site_branding table not found, skipping:', error.message);
        result.site_logos = [];
      } else {
        result.site_logos = siteLogos?.map((s) => ({
          id: s.brand_key,
          name: s.brand_name,
          missing_logo: !s.logo_url,
          logo_url: s.logo_url,
        })) || [];
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Fetch missing media error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch missing media' }, { status: 500 });
  }
}
