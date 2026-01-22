/**
 * Campaign Create Client Component
 * Form to create and send campaigns
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CampaignCreateClientProps {
  prospectCounts: {
    total: number;
    cold: number;
    warm: number;
    hot: number;
    qualified: number;
  };
}

export default function CampaignCreateClient({ prospectCounts }: CampaignCreateClientProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    campaign_name: '',
    campaign_code: '',
    sending_domain: 'technifold.com',
    target_status: [] as string[],
    email_subject: '',
    email_preview_text: '',
    email_body_html: '',
    value_proposition: '',
  });

  const handleSubmit = async (e: React.FormEvent, sendNow: boolean = false) => {
    e.preventDefault();

    if (!formData.campaign_name || !formData.email_subject || !formData.email_body_html) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/admin/marketing/campaigns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: sendNow ? 'active' : 'draft',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create campaign');
      }

      if (sendNow) {
        alert(`Campaign created and queued! Sending to ${data.recipient_count} prospects.`);
      } else {
        alert('Campaign saved as draft');
      }

      router.push('/admin/marketing/campaigns/list');
    } catch (error: any) {
      alert(error.message || 'Failed to create campaign');
      setSaving(false);
    }
  };

  const toggleStatus = (status: string) => {
    setFormData(prev => ({
      ...prev,
      target_status: prev.target_status.includes(status)
        ? prev.target_status.filter(s => s !== status)
        : [...prev.target_status, status]
    }));
  };

  const estimatedRecipients = () => {
    if (formData.target_status.length === 0) return prospectCounts.total;
    return formData.target_status.reduce((sum, status) => {
      return sum + (prospectCounts[status as keyof typeof prospectCounts] || 0);
    }, 0);
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
        <h3 className="text-[16px] font-[600] text-[#0a0a0a] mb-4">Campaign Details</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-[600] text-[#0a0a0a] mb-2">
              Campaign Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.campaign_name}
              onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
              placeholder="e.g., Folding Machine Generic Awareness - Feb 2024"
              className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-[600] text-[#0a0a0a] mb-2">
              Campaign Code
            </label>
            <input
              type="text"
              value={formData.campaign_code}
              onChange={(e) => setFormData({ ...formData, campaign_code: e.target.value })}
              placeholder="e.g., FOLD_GEN_001"
              className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[13px] font-[600] text-[#0a0a0a] mb-2">
              Sending Domain
            </label>
            <select
              value={formData.sending_domain}
              onChange={(e) => setFormData({ ...formData, sending_domain: e.target.value })}
              className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="technifold.com">technifold.com</option>
              <option value="folding.technifold.com">folding.technifold.com (Coming Soon)</option>
              <option value="binding.technifold.com">binding.technifold.com (Coming Soon)</option>
              <option value="webfed.technifold.com">webfed.technifold.com (Coming Soon)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Targeting */}
      <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
        <h3 className="text-[16px] font-[600] text-[#0a0a0a] mb-4">Targeting</h3>

        <div>
          <label className="block text-[13px] font-[600] text-[#0a0a0a] mb-3">
            Target Prospect Status (leave empty for all)
          </label>
          <div className="space-y-2">
            {['cold', 'warm', 'hot', 'qualified'].map(status => (
              <label key={status} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.target_status.includes(status)}
                  onChange={() => toggleStatus(status)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-[13px] text-[#0a0a0a] capitalize">{status}</span>
                <span className="text-[12px] text-[#64748b]">
                  ({prospectCounts[status as keyof typeof prospectCounts]} prospects)
                </span>
              </label>
            ))}
          </div>

          <div className="mt-3 text-[13px] text-blue-600 font-[600]">
            Estimated Recipients: {estimatedRecipients()} prospects
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
        <h3 className="text-[16px] font-[600] text-[#0a0a0a] mb-4">Email Content</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-[600] text-[#0a0a0a] mb-2">
              Subject Line <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.email_subject}
              onChange={(e) => setFormData({ ...formData, email_subject: e.target.value })}
              placeholder="Is Your Folder Causing Fiber-Cracking?"
              className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-[600] text-[#0a0a0a] mb-2">
              Preview Text
            </label>
            <input
              type="text"
              value={formData.email_preview_text}
              onChange={(e) => setFormData({ ...formData, email_preview_text: e.target.value })}
              placeholder="Technifold can solve this problem..."
              className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[13px] font-[600] text-[#0a0a0a] mb-2">
              Email Body (HTML) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.email_body_html}
              onChange={(e) => setFormData({ ...formData, email_body_html: e.target.value })}
              placeholder="<p>Hi {{first_name}},</p><p>We've noticed many {{company_name}} operators struggle with fiber-cracking...</p>"
              className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={12}
              required
            />
            <p className="text-[12px] text-[#64748b] mt-2">
              Available variables: {'{'}{'{'} first_name {'}'}{'}'},  {'{'}{'{'} last_name {'}'}{'}'},  {'{'}{'{'} company_name {'}'}{'}'},  {'{'}{'{'} tracking_link {'}'}{'}'}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg font-[600] text-[14px] hover:bg-gray-700 transition-colors disabled:bg-gray-300"
        >
          {saving ? 'Saving...' : 'Save as Draft'}
        </button>
        <button
          type="button"
          onClick={(e) => handleSubmit(e, true)}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-[600] text-[14px] hover:bg-blue-700 transition-colors disabled:bg-gray-300"
        >
          {saving ? 'Sending...' : 'Send Campaign Now'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 text-[#64748b] hover:text-[#0a0a0a] font-[600] text-[14px]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
