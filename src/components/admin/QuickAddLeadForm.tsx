/**
 * Comprehensive lead entry form
 * Company + Contact + Machine + Tools + Interests
 */

'use client';

import { useState, useEffect } from 'react';

export default function QuickAddLeadForm() {
  const [loading, setLoading] = useState(false);

  // Company
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');

  // Contact
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  // Machines (multi-select)
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [machinesForBrand, setMachinesForBrand] = useState<any[]>([]);
  const [selectedMachines, setSelectedMachines] = useState<Set<string>>(new Set());

  // Tools (they already own from elsewhere)
  const [tools, setTools] = useState<any[]>([]);
  const [toolSearch, setToolSearch] = useState('');
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());

  // Interests (problems/solutions)
  const [solutions, setSolutions] = useState<any[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());

  // Source tracking
  const [source, setSource] = useState('phone_call');
  const [notes, setNotes] = useState('');

  // Fetch brands on load
  useEffect(() => {
    async function fetchBrands() {
      try {
        const res = await fetch('/api/machines/brands');
        const data = await res.json();
        setBrands(data.brands || []);
      } catch (err) {
        console.error('Failed to fetch brands:', err);
      }
    }

    async function fetchTools() {
      try {
        const res = await fetch('/api/products/tools');
        const data = await res.json();
        setTools(data.tools || []);
      } catch (err) {
        console.error('Failed to fetch tools:', err);
      }
    }

    async function fetchSolutions() {
      try {
        const res = await fetch('/api/problem-solutions/all');
        const data = await res.json();
        setSolutions(data.solutions || []);
      } catch (err) {
        console.error('Failed to fetch solutions:', err);
      }
    }

    fetchBrands();
    fetchTools();
    fetchSolutions();
  }, []);

  // Fetch machines when brand selected
  useEffect(() => {
    if (!selectedBrand) {
      setMachinesForBrand([]);
      return;
    }

    async function fetchMachines() {
      try {
        const res = await fetch(`/api/machines/by-brand?brand=${encodeURIComponent(selectedBrand)}`);
        const data = await res.json();
        setMachinesForBrand(data.machines || []);
      } catch (err) {
        console.error('Failed to fetch machines:', err);
      }
    }
    fetchMachines();
  }, [selectedBrand]);

  const toggleTool = (toolCode: string) => {
    setSelectedTools(prev => {
      const next = new Set(prev);
      if (next.has(toolCode)) {
        next.delete(toolCode);
      } else {
        next.add(toolCode);
      }
      return next;
    });
  };

  const toggleMachine = (machineId: string) => {
    setSelectedMachines(prev => {
      const next = new Set(prev);
      if (next.has(machineId)) {
        next.delete(machineId);
      } else {
        next.add(machineId);
      }
      return next;
    });
  };

  const filteredTools = tools.filter(t =>
    toolSearch === '' ||
    t.product_code.toLowerCase().includes(toolSearch.toLowerCase()) ||
    t.description.toLowerCase().includes(toolSearch.toLowerCase())
  );

  const toggleInterest = (problemId: string) => {
    setSelectedInterests(prev => {
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

    if (!companyName || !contactName || !email) {
      alert('Company name, contact name, and email are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/leads/quick-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName,
          company_website: companyWebsite,
          contact_name: contactName,
          email,
          phone,
          job_title: jobTitle,
          machine_ids: Array.from(selectedMachines),
          tool_codes: Array.from(selectedTools),
          problem_solution_ids: Array.from(selectedInterests),
          source,
          notes
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed');
      }

      const result = await response.json();

      alert(`Success!\nCompany: ${result.company_id}\nAssigned to: ${result.sales_rep_name}\nContact created with token for personalized links`);

      // Reset form
      setCompanyName('');
      setCompanyWebsite('');
      setContactName('');
      setEmail('');
      setPhone('');
      setJobTitle('');
      setSelectedBrand('');
      setSelectedMachines(new Set());
      setToolSearch('');
      setSelectedTools(new Set());
      setSelectedInterests(new Set());
      setNotes('');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-8">
      {/* Company Info */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Company Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="ABC Print Ltd"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="text"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="www.abcprint.com"
            />
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="John Smith"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="john@abcprint.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="+44 1234 567890"
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
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Production Manager"
            />
          </div>
        </div>
      </section>

      {/* Machines (Multi-Select) */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Machines (Optional)
        </h2>
        <p className="text-sm text-gray-600 mb-3">Select all machines they mentioned</p>

        {/* Brand Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Select brand...</option>
            {brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        {/* Machine Checkboxes */}
        {machinesForBrand.length > 0 && (
          <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
            {machinesForBrand.map(m => (
              <label key={m.machine_id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMachines.has(m.machine_id)}
                  onChange={() => toggleMachine(m.machine_id)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm">{m.display_name}</span>
              </label>
            ))}
          </div>
        )}
      </section>

      {/* Tools They Own */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Tools They Own (Optional)
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Search by SKU and select tools they mentioned
        </p>

        {/* SKU Search */}
        <input
          type="text"
          value={toolSearch}
          onChange={(e) => setToolSearch(e.target.value)}
          placeholder="Search by SKU or description..."
          className="w-full px-4 py-2 border rounded-lg mb-3"
        />

        <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
          {filteredTools.map(tool => (
            <label key={tool.product_code} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTools.has(tool.product_code)}
                onChange={() => toggleTool(tool.product_code)}
                className="mt-1 h-4 w-4 text-blue-600 rounded"
              />
              <div className="flex-1">
                <div className="text-sm font-semibold">{tool.product_code}</div>
                <div className="text-xs text-gray-600">{tool.description}</div>
              </div>
            </label>
          ))}
        </div>
        {filteredTools.length === 0 && toolSearch && (
          <p className="text-sm text-gray-500 text-center py-4">No tools match "{toolSearch}"</p>
        )}
      </section>

      {/* Interests */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Interests (Optional)
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Problems they mentioned (triggers targeted marketing)
        </p>
        <div className="grid md:grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded-lg p-4">
          {solutions.map(sol => (
            <label key={sol.id} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={selectedInterests.has(sol.id)}
                onChange={() => toggleInterest(sol.id)}
                className="mt-1 h-4 w-4 text-blue-600 rounded"
              />
              <div className="flex-1">
                <div className="text-sm font-semibold">{sol.solution_name}</div>
                <div className="text-xs text-gray-600">{sol.title}</div>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Source & Notes */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Lead Source</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="phone_call">Phone Call</option>
              <option value="trade_show">Trade Show</option>
              <option value="email">Email Inquiry</option>
              <option value="referral">Referral</option>
              <option value="website">Website (Manual Entry)</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              rows={3}
              placeholder="Any additional context..."
            />
          </div>
        </div>
      </section>

      {/* Submit */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Adding Lead...' : 'Add Lead & Auto-Assign'}
        </button>
      </div>
    </form>
  );
}
