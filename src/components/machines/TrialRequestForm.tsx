'use client';

import { useState } from 'react';

interface TrialRequestFormProps {
  machine: {
    machine_id: string;
    brand: string;
    model: string;
    type: string;
    display_name?: string;
  };
}

export function TrialRequestForm({ machine }: TrialRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/trial/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          machine_id: machine.machine_id,
          machine_brand: machine.brand,
          machine_model: machine.model,
          machine_type: machine.type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error('Trial request error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Check Your Email</h3>
        <p className="text-slate-600 mb-4">
          We've sent your personalized trial offer to <strong>{formData.email}</strong>
        </p>
        <p className="text-sm text-slate-500">
          Can't find it? Check your spam folder or call <strong>+44 (0)1455 381 538</strong>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
          Your Name *
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          placeholder="John Smith"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          placeholder="john@company.com"
        />
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-1">
          Company
        </label>
        <input
          type="text"
          id="company"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          placeholder="ABC Printing Ltd"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          placeholder="+44 1234 567890"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 text-white py-3 font-medium hover:bg-slate-800 transition-colors disabled:bg-slate-400"
      >
        {loading ? 'Sending...' : 'Request 30-Day Trial'}
      </button>

      <p className="text-xs text-slate-500 text-center">
        We'll email you a personalized offer link for your {machine.brand} {machine.model}.
        No payment required to request.
      </p>
    </form>
  );
}
