/**
 * CaptureModal - Universal lead capture for website and internal use
 * Pre-fills machine, shows problem/solution checkboxes, captures contact info
 */

'use client';

import { useState, useEffect } from 'react';

interface Problem {
  problem_solution_id: string;
  solution_name: string;
  title: string;
}

interface CaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMachineId?: string;
  initialMachineName?: string;
  initialProblems?: Problem[];
}

export default function CaptureModal({
  isOpen,
  onClose,
  initialMachineId,
  initialMachineName,
  initialProblems = []
}: CaptureModalProps) {
  const [step, setStep] = useState(1);
  const [machines, setMachines] = useState<any[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState(initialMachineId || '');
  const [problems, setProblems] = useState<Problem[]>(initialProblems);
  const [selectedProblems, setSelectedProblems] = useState<Set<string>>(new Set());

  // Form fields
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch machines for dropdown
  useEffect(() => {
    async function fetchMachines() {
      try {
        const response = await fetch('/api/machines/brands');
        const data = await response.json();

        // Get all machines (we'll group by brand later if needed)
        const allMachines: any[] = [];
        for (const brand of data.brands || []) {
          const machineResponse = await fetch(`/api/machines/by-brand?brand=${encodeURIComponent(brand)}`);
          const machineData = await machineResponse.json();
          allMachines.push(...(machineData.machines || []));
        }
        setMachines(allMachines);
      } catch (error) {
        console.error('Failed to fetch machines:', error);
      }
    }
    if (isOpen && !initialMachineId) {
      fetchMachines();
    }
  }, [isOpen, initialMachineId]);

  // Fetch problems when machine changes
  useEffect(() => {
    if (!selectedMachineId || selectedMachineId === initialMachineId) return;

    async function fetchProblems() {
      setLoading(true);
      try {
        // Get machine slug first
        const machine = machines.find(m => m.machine_id === selectedMachineId);
        if (!machine) return;

        const response = await fetch(`/api/machines/solutions?slug=${machine.slug}`);
        const data = await response.json();

        setProblems(data.problemCards || []);
      } catch (error) {
        console.error('Failed to fetch problems:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProblems();
  }, [selectedMachineId, machines, initialMachineId]);

  const toggleProblem = (problemId: string) => {
    setSelectedProblems(prev => {
      const next = new Set(prev);
      if (next.has(problemId)) {
        next.delete(problemId);
      } else {
        next.add(problemId);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName || !contactName || !email || selectedProblems.size === 0) {
      alert('Please fill in all required fields and select at least one interest');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName,
          contact_name: contactName,
          email,
          job_title: jobTitle,
          machine_id: selectedMachineId,
          problem_solution_ids: Array.from(selectedProblems)
        })
      });

      if (!response.ok) throw new Error('Submission failed');

      const data = await response.json();

      // Success! Show thank you or close
      alert('Thank you! We\'ll send you personalized information shortly.');
      onClose();

      // Reset form
      setStep(1);
      setCompanyName('');
      setContactName('');
      setEmail('');
      setJobTitle('');
      setSelectedProblems(new Set());
    } catch (error) {
      alert('Something went wrong. Please try again or contact us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedMachine = machines.find(m => m.machine_id === selectedMachineId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Get Personalized Solutions</h2>
              <p className="text-blue-100 mt-1">Tell us about your needs</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Machine Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Your Machine {initialMachineId && <span className="text-gray-500 font-normal">(change if needed)</span>}
            </label>
            <select
              value={selectedMachineId}
              onChange={(e) => setSelectedMachineId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {initialMachineId && initialMachineName ? (
                <option value={initialMachineId}>{initialMachineName}</option>
              ) : (
                <option value="">Select your machine...</option>
              )}
              {!initialMachineId && machines.map(machine => (
                <option key={machine.machine_id} value={machine.machine_id}>
                  {machine.display_name}
                </option>
              ))}
            </select>
          </div>

          {/* Problem Selection */}
          {problems.length > 0 && (
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                I'm interested in: <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-xl p-4">
                {problems.map(problem => (
                  <label
                    key={problem.problem_solution_id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProblems.has(problem.problem_solution_id)}
                      onChange={() => toggleProblem(problem.problem_solution_id)}
                      className="mt-1 h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{problem.solution_name}</div>
                      <div className="text-sm text-gray-600">{problem.title}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Your Details</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Smith"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ABC Print Ltd"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="john@abcprint.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Production Manager"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || selectedProblems.size === 0}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Sending...' : `Get Info on ${selectedProblems.size} Solution${selectedProblems.size !== 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
