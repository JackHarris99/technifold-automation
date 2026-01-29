'use client';

import { useState, useEffect } from 'react';
import TechnicreaseConfigQuoteBuilder from '@/components/admin/TechnicreaseConfigQuoteBuilder';

interface Company {
  company_id: string;
  company_name: string;
}

interface Contact {
  contact_id: string;
  full_name: string;
  email: string;
}

interface MachineConfig {
  id: string;
  machineType: 'TECHNICREASE-V1' | 'TECHNICREASE-V2';
  machineName: string;
  width: string;
  price: number;
  tools: ToolConfig[];
  imageUrl?: string;
}

interface ToolConfig {
  id: string;
  productCode: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export default function TechnicreaseQuoteBuilderPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [companySearch, setCompanySearch] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const [machineConfigs, setMachineConfigs] = useState<MachineConfig[]>([]);

  const [quoteType, setQuoteType] = useState<'interactive' | 'static'>('static');
  const [isTestToken, setIsTestToken] = useState(false);
  const [freeShipping, setFreeShipping] = useState(false);
  const [shippingTbc, setShippingTbc] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [quoteUrl, setQuoteUrl] = useState('');
  const [quoteId, setQuoteId] = useState('');

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (companySearch) {
      const filtered = companies.filter(c =>
        c.company_name.toLowerCase().includes(companySearch.toLowerCase())
      ).slice(0, 20);
      setFilteredCompanies(filtered);
      setShowCompanyDropdown(true);
    } else {
      setFilteredCompanies(companies.slice(0, 20));
      setShowCompanyDropdown(false);
    }
  }, [companySearch, companies]);

  async function loadCompanies() {
    try {
      const response = await fetch('/api/admin/companies/all');
      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (err) {
      console.error('Failed to load companies:', err);
    }
  }

  async function loadContacts(companyId: string) {
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/contacts`);
      const data = await response.json();
      setContacts(data.contacts || []);
      if (data.contacts?.length > 0) {
        setSelectedContact(data.contacts[0]);
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
    }
  }

  function selectCompany(company: Company) {
    setSelectedCompany(company);
    setCompanySearch('');
    setShowCompanyDropdown(false);
    loadContacts(company.company_id);
  }

  function calculateTotal() {
    return machineConfigs.reduce((total, config) => {
      const machinePrice = config.price;
      const toolsPrice = config.tools.reduce((sum, tool) => sum + (tool.price * tool.quantity), 0);
      return total + machinePrice + toolsPrice;
    }, 0);
  }

  async function generateQuote() {
    if (!selectedCompany || !selectedContact) {
      alert('Please select company and contact');
      return;
    }

    if (machineConfigs.length === 0) {
      alert('Please add at least one machine configuration');
      return;
    }

    setGenerating(true);
    try {
      // Convert machine configs to line items with parent-child relationships
      const lineItems: any[] = [];
      let lineNumber = 1;

      machineConfigs.forEach(config => {
        // Add machine as parent line item
        const machineLineNumber = lineNumber++;
        lineItems.push({
          product_code: config.machineType,
          description: `${config.machineName} (Width: ${config.width})`,
          quantity: 1,
          unit_price: config.price,
          discount_percent: 0,
          product_type: 'technicrease',
          parent_line_number: null,
          configuration: { width: config.width },
          image_url: config.imageUrl,
        });

        // Add tools as child line items
        config.tools.forEach(tool => {
          lineItems.push({
            product_code: tool.productCode,
            description: tool.name,
            quantity: tool.quantity,
            unit_price: tool.price,
            discount_percent: 0,
            product_type: 'technicrease',
            parent_line_number: machineLineNumber,
            image_url: tool.imageUrl,
          });
          lineNumber++;
        });
      });

      const response = await fetch('/api/admin/quotes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: selectedCompany.company_id,
          contact_id: selectedContact.contact_id,
          pricing_mode: null,
          line_items: lineItems,
          quote_type: quoteType,
          is_test: isTestToken,
          free_shipping: freeShipping,
          shipping_tbc: shippingTbc,
          requires_approval: true,
        }),
      });

      const data = await response.json();
      if (data.url && data.quote_id) {
        setQuoteUrl(data.url);
        setQuoteId(data.quote_id);
      } else {
        alert('Failed to generate quote: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error generating quote');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">TechniCrease Quote Builder</h1>

        {/* Company Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Select Company</h2>
          <div className="relative">
            <input
              type="text"
              value={selectedCompany ? selectedCompany.company_name : companySearch}
              onChange={(e) => {
                if (selectedCompany) {
                  setSelectedCompany(null);
                  setSelectedContact(null);
                }
                setCompanySearch(e.target.value);
              }}
              placeholder="Search companies..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            {showCompanyDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredCompanies.map((company) => (
                  <button
                    key={company.company_id}
                    onClick={() => selectCompany(company)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    {company.company_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedCompany && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-semibold text-green-900">Selected: {selectedCompany.company_name}</p>
            </div>
          )}
        </div>

        {/* Contact Selection */}
        {selectedCompany && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Select Contact</h2>
            <select
              value={selectedContact?.contact_id || ''}
              onChange={(e) => {
                const contact = contacts.find(c => c.contact_id === e.target.value);
                setSelectedContact(contact || null);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            >
              <option value="">Select contact...</option>
              {contacts.map((contact) => (
                <option key={contact.contact_id} value={contact.contact_id}>
                  {contact.full_name} ({contact.email})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Machine Configurations */}
        {selectedCompany && selectedContact && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Configure Machines</h2>
            <TechnicreaseConfigQuoteBuilder
              configurations={machineConfigs}
              onConfigurationsChange={setMachineConfigs}
            />
          </div>
        )}

        {/* Quote Options */}
        {machineConfigs.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Quote Options</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quote Type</label>
                <select
                  value={quoteType}
                  onChange={(e) => setQuoteType(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="static">Static (Fixed prices)</option>
                  <option value="interactive">Interactive (Customer can adjust)</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="freeShipping"
                  checked={freeShipping}
                  onChange={(e) => {
                    setFreeShipping(e.target.checked);
                    if (e.target.checked) setShippingTbc(false);
                  }}
                  disabled={shippingTbc}
                  className="w-4 h-4"
                />
                <label htmlFor="freeShipping" className="text-sm font-semibold text-gray-700">
                  Free Shipping
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="shippingTbc"
                  checked={shippingTbc}
                  onChange={(e) => {
                    setShippingTbc(e.target.checked);
                    if (e.target.checked) setFreeShipping(false);
                  }}
                  className="w-4 h-4"
                />
                <label htmlFor="shippingTbc" className="text-sm font-semibold text-gray-700">
                  Shipping TBC (To Be Confirmed)
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="testToken"
                  checked={isTestToken}
                  onChange={(e) => setIsTestToken(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="testToken" className="text-sm font-semibold text-gray-700">
                  Test Mode
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Summary & Generate */}
        {machineConfigs.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Generate Quote</h2>
            <div className="mb-4">
              <div className="text-3xl font-bold text-orange-600">
                Total: £{total.toLocaleString('en-GB')}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {machineConfigs.length} machine{machineConfigs.length !== 1 ? 's' : ''} configured
              </p>
            </div>
            <button
              onClick={generateQuote}
              disabled={generating}
              className="w-full bg-orange-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? 'Generating...' : 'Generate TechniCrease Quote'}
            </button>
          </div>
        )}

        {/* Quote Result */}
        {quoteUrl && (
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-900 mb-4">✓ Quote Generated!</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-green-900 mb-1">Quote URL:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={quoteUrl}
                    readOnly
                    className="flex-1 px-4 py-2 bg-white border border-green-300 rounded-lg"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(quoteUrl)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div>
                <a
                  href={`/admin/quotes/${quoteId}`}
                  target="_blank"
                  className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700"
                >
                  View Quote Details →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
