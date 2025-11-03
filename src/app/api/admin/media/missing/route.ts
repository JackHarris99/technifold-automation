/**
 * Missing Media API Route
 * Fetches records with NULL image/video URLs
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let result: any = {};

    // Products (missing image_url or video_url)
    if (!type || type === 'products') {
      const { data: products, error } = await supabase
        .from('products')
        .select('product_code, description, category, type, image_url, video_url')
        .eq('active', true)
        .or('image_url.is.null,video_url.is.null')
        .order('product_code')
        .limit(5000);

      if (error) throw error;

      result.products = products?.map((p) => ({
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

    // Solutions (missing default_image_url or default_video_url)
    if (!type || type === 'solutions') {
      const { data: solutions, error } = await supabase
        .from('solutions')
        .select('solution_id, name, default_image_url, default_video_url')
        .or('default_image_url.is.null,default_video_url.is.null')
        .order('name')
        .limit(500);

      if (error) throw error;

      result.solutions = solutions?.map((s) => ({
        id: s.solution_id,
        name: s.name,
        missing_image: !s.default_image_url,
        missing_video: !s.default_video_url,
        image_url: s.default_image_url,
        video_url: s.default_video_url,
      }));
    }

    // Problems (missing default_image_url or default_video_url)
    if (!type || type === 'problems') {
      const { data: problems, error } = await supabase
        .from('problems')
        .select('problem_id, title, default_image_url, default_video_url')
        .or('default_image_url.is.null,default_video_url.is.null')
        .order('title')
        .limit(500);

      if (error) throw error;

      result.problems = problems?.map((p) => ({
        id: p.problem_id,
        name: p.title,
        missing_image: !p.default_image_url,
        missing_video: !p.default_video_url,
        image_url: p.default_image_url,
        video_url: p.default_video_url,
      }));
    }

    // Solution × Problem (missing default_image_url or default_video_url)
    if (!type || type === 'solution_problem') {
      const { data: sp, error } = await supabase
        .from('solution_problem')
        .select(`
          solution_id,
          problem_id,
          default_image_url,
          default_video_url,
          solutions:solution_id(name),
          problems:problem_id(title)
        `)
        .or('default_image_url.is.null,default_video_url.is.null')
        .order('solution_id')
        .limit(2000);

      if (error) throw error;

      result.solution_problem = sp?.map((item: any) => ({
        id: `${item.solution_id}__${item.problem_id}`,
        solution_id: item.solution_id,
        problem_id: item.problem_id,
        name: `${item.solutions?.name || item.solution_id} × ${item.problems?.title || item.problem_id}`,
        missing_image: !item.default_image_url,
        missing_video: !item.default_video_url,
        image_url: item.default_image_url,
        video_url: item.default_video_url,
      }));
    }

    // Machine × Solution × Problem (missing override_image_url or override_video_url)
    if (!type || type === 'machine_solution_problem') {
      const { data: msp, error } = await supabase
        .from('machine_solution_problem')
        .select(`
          machine_solution_id,
          problem_id,
          override_image_url,
          override_video_url,
          machine_solutions:machine_solution_id(
            machine_id,
            solution_id,
            machines:machine_id(display_name),
            solutions:solution_id(name)
          ),
          problems:problem_id(title)
        `)
        .or('override_image_url.is.null,override_video_url.is.null')
        .order('machine_solution_id')
        .limit(5000);

      if (error) throw error;

      result.machine_solution_problem = msp?.map((item: any) => {
        const ms = item.machine_solutions;
        const machineName = ms?.machines?.display_name || ms?.machine_id || 'Unknown';
        const solutionName = ms?.solutions?.name || ms?.solution_id || 'Unknown';
        const problemName = item.problems?.title || item.problem_id || 'Unknown';

        return {
          id: `${item.machine_solution_id}__${item.problem_id}`,
          machine_solution_id: item.machine_solution_id,
          problem_id: item.problem_id,
          name: `${machineName} → ${solutionName} × ${problemName}`,
          missing_image: !item.override_image_url,
          missing_video: !item.override_video_url,
          image_url: item.override_image_url,
          video_url: item.override_video_url,
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

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Fetch missing media error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch missing media' }, { status: 500 });
  }
}
