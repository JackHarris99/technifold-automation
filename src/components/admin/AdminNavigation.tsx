/**
 * Admin Navigation - Dynamic navigation based on current section
 */

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface AdminNavigationProps {
  isDirector: boolean;
}

export default function AdminNavigation({ isDirector }: AdminNavigationProps) {
  const pathname = usePathname();

  // Determine current section
  const currentSection = pathname.startsWith('/admin/marketing')
    ? 'marketing'
    : pathname.startsWith('/admin/crm')
    ? 'crm'
    : 'sales'; // default to sales

  return (
    <nav className="flex-1 overflow-y-auto py-4">
      {currentSection === 'sales' && (
        <>
          <NavSection title="Sales Actions">
            <NavLink href="/admin/sales" icon="🎯" label="Action Dashboard" />
            <NavLink href="/admin/pipeline" icon="📊" label="Pipeline" />
            <NavLink href="/admin/companies" icon="🏢" label="My Companies" />
          </NavSection>

          <NavSection title="Quick Tools">
            <NavLink href="/admin/quote-builder" icon="📄" label="Create Quote" />
            <NavLink href="/admin/test-invoice" icon="📧" label="Send Invoice" />
            <NavLink href="/admin/sku-explorer" icon="📦" label="SKU Explorer" />
          </NavSection>
        </>
      )}

      {currentSection === 'marketing' && (
        <>
          <NavSection title="Campaigns">
            <NavLink href="/admin/campaigns" icon="📧" label="Email Campaigns" />
            <NavLink href="/admin/engagements" icon="📊" label="Engagement" />
            <NavLink href="/admin/prospects" icon="👥" label="Prospects" />
          </NavSection>

          <NavSection title="Content">
            <NavLink href="/admin/quote-requests" icon="📬" label="Quote Requests" />
            {isDirector && (
              <>
                <NavLink href="/admin/content-blocks" icon="📝" label="Content Blocks" />
                <NavLink href="/admin/brand-media" icon="🎨" label="Brand Media" />
              </>
            )}
          </NavSection>
        </>
      )}

      {currentSection === 'crm' && (
        <>
          <NavSection title="Company Data">
            <NavLink href="/admin/companies" icon="🏢" label="All Companies" />
            <NavLink href="/admin/orders" icon="📦" label="All Orders" />
            <NavLink href="/admin/subscriptions" icon="💳" label="Subscriptions" />
          </NavSection>

          <NavSection title="Analytics">
            <NavLink href="/admin/sales-history" icon="📈" label="Sales History" />
            <NavLink href="/admin/trials" icon="🚀" label="Trials" />
          </NavSection>

          {isDirector && (
            <NavSection title="Admin">
              <NavLink href="/admin/users" icon="👥" label="Users" />
              <NavLink href="/admin/categorize" icon="🏷️" label="Categorize" />
            </NavSection>
          )}
        </>
      )}
    </nav>
  );
}

function NavSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <div className="px-3 mb-2 mt-6 first:mt-0">
        <div className="text-blue-200 text-xs uppercase font-semibold tracking-wider px-3">
          {title}
        </div>
      </div>
      {children}
    </>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/admin/sales' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`flex items-center space-x-3 px-6 py-3 transition-all ${
        isActive
          ? 'bg-white/20 text-white font-semibold'
          : 'text-blue-100 hover:bg-white/10'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
}
