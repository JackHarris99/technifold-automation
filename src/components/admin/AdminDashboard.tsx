'use client';

import { useState } from 'react';
import { Company } from '@/types';
import { AdminHeader } from './AdminHeader';
import { CompanyGrid } from './CompanyGrid';
import { DatasheetGrid, Product } from './DatasheetGrid';
import OrdersTable from './OrdersTable';
import OutboxJobsTable from './OutboxJobsTable';

interface Order {
  order_id: string;
  company_id: string;
  company_name?: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
  stripe_session_id?: string;
}

interface OutboxJob {
  id: string;
  job_id: string;
  job_type: string;
  status: string;
  payload: any;
  attempts: number;
  max_attempts: number;
  created_at: string;
  scheduled_for: string;
  locked_until: string | null;
  last_error: string | null;
  completed_at: string | null;
}

interface AdminDashboardProps {
  customers: Company[];
  partners: Company[];
  press: Company[];
  prospects: Company[];
  products: Product[];
  orders: Order[];
  outboxJobs: OutboxJob[];
  categoryInfo?: Record<string, number>;
}

export function AdminDashboard({
  customers,
  partners,
  press,
  prospects,
  products,
  orders,
  outboxJobs
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'customers' | 'partners' | 'press' | 'prospects' | 'datasheets' | 'orders' | 'outbox'>('customers');

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
                  {customers.length}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('partners')}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'partners'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Partners
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {partners.length}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('press')}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'press'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Press
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {press.length}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('prospects')}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'prospects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Prospects
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {prospects.length}
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

            <button
              onClick={() => setActiveTab('orders')}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'orders'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Orders
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {orders.length}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('outbox')}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'outbox'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Outbox Jobs
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {outboxJobs.length}
                </span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'customers' && <CompanyGrid companies={customers} />}
        {activeTab === 'partners' && <CompanyGrid companies={partners} />}
        {activeTab === 'press' && <CompanyGrid companies={press} />}
        {activeTab === 'prospects' && <CompanyGrid companies={prospects} />}
        {activeTab === 'datasheets' && <DatasheetGrid products={products} />}
        {activeTab === 'orders' && <OrdersTable orders={orders} />}
        {activeTab === 'outbox' && <OutboxJobsTable jobs={outboxJobs} />}
      </main>
    </div>
  );
}