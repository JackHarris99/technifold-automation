/**
 * Account Settings Client Component
 * Edit contact info, company info, and password
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Contact {
  contact_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
}

interface Company {
  company_id: string;
  company_name: string;
  billing_address_line_1: string;
  billing_address_line_2: string | null;
  billing_city: string;
  billing_state_province: string | null;
  billing_postal_code: string;
  billing_country: string;
  vat_number: string | null;
}

interface Props {
  contact: Contact | null;
  company: Company | null;
  userName: string;
}

type Tab = 'contact' | 'company' | 'password';

export default function AccountClient({ contact: initialContact, company: initialCompany, userName }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('contact');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    first_name: initialContact?.first_name || '',
    last_name: initialContact?.last_name || '',
    email: initialContact?.email || '',
    phone: initialContact?.phone || '',
  });

  // Company form state
  const [companyForm, setCompanyForm] = useState({
    company_name: initialCompany?.company_name || '',
    billing_address_line_1: initialCompany?.billing_address_line_1 || '',
    billing_address_line_2: initialCompany?.billing_address_line_2 || '',
    billing_city: initialCompany?.billing_city || '',
    billing_state_province: initialCompany?.billing_state_province || '',
    billing_postal_code: initialCompany?.billing_postal_code || '',
    billing_country: initialCompany?.billing_country || 'GB',
    vat_number: initialCompany?.vat_number || '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const handleLogout = async () => {
    await fetch('/api/customer/auth/logout', { method: 'POST' });
    router.push('/customer/login');
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/customer/account/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update contact information');
      }

      setSuccess('Contact information updated successfully');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/customer/account/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update company information');
      }

      setSuccess('Company information updated successfully');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate passwords match
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/customer/account/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setSuccess('Password updated successfully');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8]">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="relative h-10 w-32">
                <Image
                  src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/technifold.png"
                  alt="Technifold"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <nav className="flex items-center gap-6">
                <a
                  href="/customer/portal"
                  className="text-sm font-semibold text-[#666] hover:text-[#0a0a0a] transition-colors"
                >
                  Reorder
                </a>
                <a
                  href="/customer/orders"
                  className="text-sm font-semibold text-[#666] hover:text-[#0a0a0a] transition-colors"
                >
                  Order History
                </a>
                <a
                  href="/customer/addresses"
                  className="text-sm font-semibold text-[#666] hover:text-[#0a0a0a] transition-colors"
                >
                  Addresses
                </a>
                <a
                  href="/customer/account"
                  className="text-sm font-semibold text-blue-600 border-b-2 border-blue-600 pb-1"
                >
                  Account
                </a>
              </nav>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#666]">
                Welcome, <strong>{userName}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-semibold text-[#666] hover:text-[#0a0a0a] hover:bg-gray-100 rounded-lg transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0a0a0a] mb-2">Account Settings</h1>
          <p className="text-[#666]">Manage your contact information and preferences</p>
        </div>

        {/* Tabs - Enhanced visibility */}
        <div className="mb-8">
          <div className="bg-gray-50 rounded-xl p-2 inline-flex gap-2">
            <button
              onClick={() => {
                setActiveTab('contact');
                setError(null);
                setSuccess(null);
              }}
              className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'contact'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-[#666] hover:text-[#0a0a0a] hover:bg-white/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Contact Information
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('company');
                setError(null);
                setSuccess(null);
              }}
              className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'company'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-[#666] hover:text-[#0a0a0a] hover:bg-white/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Company & Billing
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('password');
                setError(null);
                setSuccess(null);
              }}
              className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'password'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-[#666] hover:text-[#0a0a0a] hover:bg-white/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Password
              </div>
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] p-8">
          {activeTab === 'contact' && (
            <form onSubmit={handleContactSubmit}>
              <h2 className="text-xl font-bold text-[#0a0a0a] mb-6">Contact Information</h2>
              <div className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.first_name}
                      onChange={(e) => setContactForm({ ...contactForm, first_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.last_name}
                      onChange={(e) => setContactForm({ ...contactForm, last_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'company' && (
            <form onSubmit={handleCompanySubmit}>
              <h2 className="text-xl font-bold text-[#0a0a0a] mb-6">Company Information</h2>
              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyForm.company_name}
                    onChange={(e) => setCompanyForm({ ...companyForm, company_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                    Billing Address Line 1 *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyForm.billing_address_line_1}
                    onChange={(e) => setCompanyForm({ ...companyForm, billing_address_line_1: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                    Billing Address Line 2
                  </label>
                  <input
                    type="text"
                    value={companyForm.billing_address_line_2}
                    onChange={(e) => setCompanyForm({ ...companyForm, billing_address_line_2: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyForm.billing_city}
                      onChange={(e) => setCompanyForm({ ...companyForm, billing_city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                      State/Province
                    </label>
                    <input
                      type="text"
                      value={companyForm.billing_state_province}
                      onChange={(e) => setCompanyForm({ ...companyForm, billing_state_province: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyForm.billing_postal_code}
                      onChange={(e) => setCompanyForm({ ...companyForm, billing_postal_code: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                      Country *
                    </label>
                    <select
                      required
                      value={companyForm.billing_country}
                      onChange={(e) => setCompanyForm({ ...companyForm, billing_country: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="GB">United Kingdom</option>
                      <option value="US">United States</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="IT">Italy</option>
                      <option value="ES">Spain</option>
                      <option value="NL">Netherlands</option>
                      <option value="BE">Belgium</option>
                      <option value="CH">Switzerland</option>
                      <option value="AT">Austria</option>
                      <option value="IE">Ireland</option>
                      <option value="PL">Poland</option>
                      <option value="SE">Sweden</option>
                      <option value="DK">Denmark</option>
                      <option value="NO">Norway</option>
                      <option value="FI">Finland</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                    VAT Number
                  </label>
                  <input
                    type="text"
                    value={companyForm.vat_number}
                    onChange={(e) => setCompanyForm({ ...companyForm, vat_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., GB123456789"
                  />
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit}>
              <h2 className="text-xl font-bold text-[#0a0a0a] mb-6">Change Password</h2>
              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                    New Password * (min. 8 characters)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
