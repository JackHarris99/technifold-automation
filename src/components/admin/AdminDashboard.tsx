'use client';

import { useState } from 'react';
import { Company } from '@/types';
import { AdminHeader } from './AdminHeader';
import { CompanyList } from './CompanyList';
import { DatasheetList, Product } from './DatasheetList';

interface AdminDashboardProps {
  companies: Company[];
  products: Product[];
}

export function AdminDashboard({ companies, products }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'customers' | 'datasheets'>('customers');

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Technifold Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage company portal links, track orders, and view product datasheets
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('customers')}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'customers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Customer Portals
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {companies.length}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('datasheets')}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'datasheets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Product Datasheets
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {products.length}
                </span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {activeTab === 'customers' ? (
            <>
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Company Portal Links</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {companies.length} companies with permanent portal access
                </p>
              </div>
              <CompanyList companies={companies} />
            </>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Product Technical Datasheets</h2>
                <p className="text-sm text-gray-500 mt-1">
                  View and manage technical datasheets for all products
                </p>
              </div>
              <DatasheetList products={products} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}