/**
 * Machine Detail Page
 * /machines/[slug] - Shows solutions and problems for a specific machine
 */

import { notFound } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import MachineSolutionsDisplay from '@/components/marketing/MachineSolutionsDisplay';

interface MachinePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function MachinePage({ params }: MachinePageProps) {
  const { slug } = await params;
  const supabase = getSupabaseClient();

  // Fetch machine data from v_machine_solution_problem_full
  const { data, error } = await supabase
    .from('v_machine_solution_problem_full')
    .select('*')
    .eq('machine_slug', slug)
    .order('machine_solution_rank', { ascending: true })
    .order('machine_solution_problem_rank', { ascending: true });

  if (error || !data || data.length === 0) {
    console.error('[machines/slug] Error or no data:', error);
    notFound();
  }

  // Group data by solution
  const machineData = {
    machine_id: data[0].machine_id,
    machine_brand: data[0].machine_brand,
    machine_model: data[0].machine_model,
    machine_display_name: data[0].machine_display_name,
    solutions: [] as any[]
  };

  const solutionsMap = new Map();

  data.forEach((row) => {
    if (!solutionsMap.has(row.solution_id)) {
      solutionsMap.set(row.solution_id, {
        solution_id: row.solution_id,
        solution_name: row.solution_name,
        solution_core_benefit: row.solution_core_benefit,
        solution_long_description: row.solution_long_description,
        solution_media_urls: row.solution_media_urls || [],
        problems: []
      });
    }

    const solution = solutionsMap.get(row.solution_id);
    solution.problems.push({
      problem_id: row.problem_id,
      problem_title: row.problem_title,
      problem_description: row.problem_description,
      pitch_headline: row.pitch_headline,
      pitch_detail: row.pitch_detail,
      action_cta: row.action_cta
    });
  });

  machineData.solutions = Array.from(solutionsMap.values());

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <MachineSolutionsDisplay machineData={machineData} />
      </div>
    </div>
  );
}
