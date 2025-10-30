/**
 * Admin Copy Editor
 * Edit problem_solution_copy at two levels + curate SKUs
 */

import { getSupabaseClient } from '@/lib/supabase';
import CopyEditor from '@/components/admin/CopyEditor';

export default async function CopyEditorPage() {
  const supabase = getSupabaseClient();

  // Fetch all machines for brand dropdown
  const { data: machines } = await supabase
    .from('machines')
    .select('machine_id, brand, model, display_name, slug')
    .order('brand, model');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Copy Editor
          </h1>
          <p className="text-gray-600">
            Edit problem solution copy (base + override) and curate SKUs per machine/solution/problem
          </p>
        </div>

        <CopyEditor machines={machines || []} />
      </div>
    </div>
  );
}
