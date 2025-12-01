/**
 * Knowledge Confirmation Queue
 * Read from v_knowledge_confirmation_queue and allow admins to confirm/reject machine knowledge
 */

import { getSupabaseClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export const metadata = {
  title: 'Confirm Machine Knowledge | Technifold Admin',
  description: 'Review and confirm customer machine selections',
};

async function confirmBelief(formData: FormData) {
  'use server';

  const beliefId = formData.get('belief_id') as string;
  const companyId = formData.get('company_id') as string;
  const modelId = formData.get('model_id') as string;
  const action = formData.get('action') as 'confirm' | 'reject';

  const supabase = getSupabaseClient();

  // Fetch existing belief to get current evidence
  const { data: existingBelief } = await supabase
    .from('company_beliefs')
    .select('evidence, confidence')
    .eq('belief_id', beliefId)
    .single();

  if (!existingBelief) {
    throw new Error('Belief not found');
  }

  const now = new Date().toISOString();

  if (action === 'confirm') {
    // Update to confidence=3, source='admin_confirm', append to evidence
    const updatedEvidence = {
      ...(existingBelief.evidence || {}),
      admin_confirmations: [
        ...((existingBelief.evidence as any)?.admin_confirmations || []),
        {
          confirmed_at: now,
          previous_confidence: existingBelief.confidence,
        },
      ],
    };

    const { error: updateError } = await supabase
      .from('company_beliefs')
      .update({
        confidence: 3,
        source: 'admin_confirm',
        evidence: updatedEvidence,
        updated_at: now,
      })
      .eq('belief_id', beliefId);

    if (updateError) {
      console.error('[confirm-queue] Error confirming belief:', updateError);
      throw new Error('Failed to confirm belief');
    }

    // Insert engagement event
    await supabase.from('engagement_events').insert({
      company_id: companyId,
      contact_id: null,
      source: 'admin',
      event_name: 'admin_confirm',
      url: '/admin/campaigns/confirm',
      meta: {
        belief_id: beliefId,
        model_id: modelId,
        previous_confidence: existingBelief.confidence,
        new_confidence: 3,
      },
    });

  } else if (action === 'reject') {
    // Lower confidence to 1 or delete if already at 1
    if (existingBelief.confidence <= 1) {
      // Delete the belief
      const { error: deleteError } = await supabase
        .from('company_beliefs')
        .delete()
        .eq('belief_id', beliefId);

      if (deleteError) {
        console.error('[confirm-queue] Error deleting belief:', deleteError);
        throw new Error('Failed to delete belief');
      }
    } else {
      // Lower confidence and append to evidence
      const updatedEvidence = {
        ...(existingBelief.evidence || {}),
        admin_rejections: [
          ...((existingBelief.evidence as any)?.admin_rejections || []),
          {
            rejected_at: now,
            previous_confidence: existingBelief.confidence,
          },
        ],
      };

      const { error: updateError } = await supabase
        .from('company_beliefs')
        .update({
          confidence: 1,
          evidence: updatedEvidence,
          updated_at: now,
        })
        .eq('belief_id', beliefId);

      if (updateError) {
        console.error('[confirm-queue] Error rejecting belief:', updateError);
        throw new Error('Failed to reject belief');
      }
    }

    // Insert engagement event
    await supabase.from('engagement_events').insert({
      company_id: companyId,
      contact_id: null,
      source: 'admin',
      event_name: 'admin_reject',
      url: '/admin/campaigns/confirm',
      meta: {
        belief_id: beliefId,
        model_id: modelId,
        previous_confidence: existingBelief.confidence,
        action: existingBelief.confidence <= 1 ? 'deleted' : 'lowered_to_1',
      },
    });
  }

  revalidatePath('/admin/campaigns/confirm');
}

export default async function ConfirmationQueuePage() {
  const supabase = getSupabaseClient();

  // Fetch pending confirmations from the view
  const { data: queue, error } = await supabase
    .from('v_knowledge_confirmation_queue')
    .select('*')
    .in('confidence', [1, 2])
    .order('confidence', { ascending: false })
    .order('updated_at', { ascending: true })
    .limit(500);

  if (error) {
    console.error('Error fetching confirmation queue:', error);
  }

  const pendingBeliefs = queue || [];

  return (
    <div className="min-h-screen bg-gray-50">
      

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Machine Knowledge Confirmation</h1>
          <p className="mt-2 text-gray-600">
            Review and confirm customer machine selections before they become trusted knowledge
          </p>
        </div>

        {pendingBeliefs.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
            <p className="mt-2 text-gray-500">
              There are no pending machine knowledge confirmations at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingBeliefs.map((belief: any) => (
              <div key={belief.belief_id} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Company and Machine */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {belief.company_name}
                      </h3>
                      <p className="text-sm text-gray-500">Company ID: {belief.company_id}</p>
                    </div>

                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-blue-900">Machine Selection:</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          belief.confidence === 2 ? 'bg-yellow-100 text-yellow-800' :
                          belief.confidence === 1 ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          Confidence: {belief.confidence}
                        </span>
                      </div>
                      <p className="text-lg font-medium text-blue-900">{belief.model_display_name}</p>
                      <p className="text-sm text-blue-700">Level {belief.model_level}</p>
                    </div>

                    {/* Source and Evidence */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Source:</span>
                        <span className="ml-2 text-gray-600">{belief.source}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Last Updated:</span>
                        <span className="ml-2 text-gray-600">
                          {new Date(belief.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Evidence Details */}
                    {belief.evidence && (
                      <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                        <span className="text-xs font-medium text-gray-700 uppercase">Evidence:</span>
                        <pre className="mt-2 text-xs text-gray-600 overflow-x-auto">
                          {JSON.stringify(belief.evidence, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Contact Info if available */}
                    {belief.contact_id && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Selected by contact:</span> {belief.contact_id}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="ml-6 flex flex-col gap-2">
                    <form action={confirmBelief}>
                      <input type="hidden" name="belief_id" value={belief.belief_id} />
                      <input type="hidden" name="company_id" value={belief.company_id} />
                      <input type="hidden" name="model_id" value={belief.model_id} />
                      <input type="hidden" name="action" value="confirm" />
                      <button
                        type="submit"
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium text-sm whitespace-nowrap"
                      >
                        ✓ Confirm
                      </button>
                    </form>
                    <form action={confirmBelief}>
                      <input type="hidden" name="belief_id" value={belief.belief_id} />
                      <input type="hidden" name="company_id" value={belief.company_id} />
                      <input type="hidden" name="model_id" value={belief.model_id} />
                      <input type="hidden" name="action" value="reject" />
                      <button
                        type="submit"
                        className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium text-sm whitespace-nowrap"
                        onClick={(e) => {
                          if (!confirm('Are you sure you want to reject this machine selection?')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        ✗ Reject
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Queue Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500 uppercase">Total Pending</div>
              <div className="text-2xl font-bold text-gray-900">{pendingBeliefs.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 uppercase">Confidence 2 (Clicked)</div>
              <div className="text-2xl font-bold text-yellow-600">
                {pendingBeliefs.filter((b: any) => b.confidence === 2).length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 uppercase">Confidence 1 (Inferred)</div>
              <div className="text-2xl font-bold text-gray-600">
                {pendingBeliefs.filter((b: any) => b.confidence === 1).length}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
