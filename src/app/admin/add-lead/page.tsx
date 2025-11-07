/**
 * Quick Add Lead Page
 * /admin/add-lead
 * Add company, contact, machine, tools, interests all at once
 */

import QuickAddLeadForm from '@/components/admin/QuickAddLeadForm';

export default function AddLeadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Lead</h1>
          <p className="text-gray-600 mt-2">
            Phone call, trade show, or walk-in - capture everything you know
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Auto-assigned fairly to sales team
          </p>
        </div>

        <QuickAddLeadForm />
      </div>
    </div>
  );
}
