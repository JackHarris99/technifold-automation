/**
 * Company Header Component
 * Displays company name, tags, and action CTAs
 */

'use client';

import { useState } from 'react';
import CreateQuoteModal from './CreateQuoteModal';
import SendOfferModal from './SendOfferModal';

interface CompanyHeaderProps {
  company: {
    company_id: string;
    company_name: string;
    country: string | null;
    category: string | null;
    portal_token: string | null;
    zoho_account_id: string | null;
    stripe_customer_id: string | null;
  };
}

export default function CompanyHeader({ company }: CompanyHeaderProps) {
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);

  const handleCreateInvoice = async () => {
    // TODO: Implement create invoice action
    alert('Create Invoice action - To be implemented');
  };

  const handleOpenInZoho = () => {
    if (company.zoho_account_id) {
      window.open(`https://crm.zoho.com/crm/org123/tab/Accounts/${company.zoho_account_id}`, '_blank');
    } else {
      alert('Company not synced to Zoho yet');
    }
  };

  const handleCopyPortalLink = () => {
    if (company.portal_token) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
      const portalUrl = `${baseUrl}/portal/${company.portal_token}`;
      navigator.clipboard.writeText(portalUrl);
      alert('Portal link copied to clipboard!');
    }
  };

  return (
    <>
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                {company.company_name}
              </h1>
              <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-4">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span className="font-medium">ID:</span>
                  <span className="ml-1">{company.company_id}</span>
                </div>
                {company.country && (
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span className="font-medium">Country:</span>
                    <span className="ml-1">{company.country}</span>
                  </div>
                )}
                {company.category && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {company.category}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4 gap-2 flex-wrap">
              <button
                onClick={() => setShowQuoteModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Quote
              </button>
              <button
                onClick={() => setShowOfferModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Send Offer
              </button>
              {company.portal_token && (
                <button
                  onClick={handleCopyPortalLink}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Copy Portal Link
                </button>
              )}
              <button
                onClick={handleCreateInvoice}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Invoice
              </button>
              {company.zoho_account_id && (
                <button
                  onClick={handleOpenInZoho}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Open in Zoho →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showQuoteModal && (
        <CreateQuoteModal
          companyId={company.company_id}
          companyName={company.company_name}
          onClose={() => setShowQuoteModal(false)}
        />
      )}
      {showOfferModal && (
        <SendOfferModal
          companyId={company.company_id}
          companyName={company.company_name}
          onClose={() => setShowOfferModal(false)}
        />
      )}
    </>
  );
}
