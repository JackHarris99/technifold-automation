/**
 * Distributor Dashboard Component
 * Shows customer list and order management interface
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Customer {
  company_id: string;
  company_name: string;
  type: string;
  created_at: string;
  last_invoice_at: string | null;
}

interface DistributorDashboardProps {
  distributor: {
    company_id: string;
    company_name: string;
  };
  customers: Customer[];
}

export default function DistributorDashboard({
  distributor,
  customers,
}: DistributorDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter((customer) =>
    customer.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8] p-6">
          <div className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-2">
            Total Customers
          </div>
          <div className="text-[36px] font-[800] text-[#0a0a0a] tracking-[-0.02em] leading-[1]">
            {customers.length}
          </div>
        </div>

        <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8] p-6">
          <div className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-2">
            Active This Month
          </div>
          <div className="text-[36px] font-[800] text-[#1e40af] tracking-[-0.02em] leading-[1]">
            {customers.filter((c) => {
              if (!c.last_invoice_at) return false;
              const lastInvoice = new Date(c.last_invoice_at);
              const thisMonth = new Date();
              return (
                lastInvoice.getMonth() === thisMonth.getMonth() &&
                lastInvoice.getFullYear() === thisMonth.getFullYear()
              );
            }).length}
          </div>
        </div>

        <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8] p-6">
          <div className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-2">
            New Customers
          </div>
          <div className="text-[36px] font-[800] text-[#15803d] tracking-[-0.02em] leading-[1]">
            {customers.filter((c) => {
              const created = new Date(c.created_at);
              const thisMonth = new Date();
              return (
                created.getMonth() === thisMonth.getMonth() &&
                created.getFullYear() === thisMonth.getFullYear()
              );
            }).length}
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8]">
        <div className="p-6 border-b border-[#e8e8e8]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[20px] font-[600] text-[#0a0a0a] mb-1 tracking-[-0.01em]">
                Your Customers
              </h2>
              <p className="text-[13px] text-[#334155] font-[400]">
                {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="w-64">
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] text-[13px] text-[#0a0a0a] font-[500] focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[14px] text-[#475569] font-[400]">
                {searchTerm ? 'No customers found matching your search' : 'No customers yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.company_id}
                  className="p-5 bg-[#f8fafc] rounded-[12px] border border-[#e2e8f0] hover:border-[#cbd5e1] transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-[15px] font-[600] text-[#0a0a0a] mb-1 group-hover:text-[#1e40af] transition-colors">
                        {customer.company_name}
                      </h3>
                      <div className="flex items-center gap-4">
                        <span className="text-[11px] text-[#475569] font-[500]">
                          Type: {customer.type || 'customer'}
                        </span>
                        {customer.last_invoice_at && (
                          <span className="text-[11px] text-[#475569] font-[500]">
                            Last order: {new Date(customer.last_invoice_at).toLocaleDateString('en-GB')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/distributor/customer/${customer.company_id}`}
                        className="px-4 py-2 bg-white border border-[#e2e8f0] rounded-[8px] text-[13px] font-[600] text-[#475569] hover:text-[#1e40af] hover:border-[#1e40af] transition-all"
                      >
                        View Details
                      </Link>
                      <Link
                        href={`/distributor/order/${customer.company_id}`}
                        className="px-4 py-2 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white rounded-[8px] text-[13px] font-[600] hover:from-[#1e3a8a] hover:to-[#2563eb] transition-all"
                      >
                        Place Order
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
