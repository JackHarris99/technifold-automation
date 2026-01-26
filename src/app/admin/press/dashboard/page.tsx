/**
 * Press & Media Dashboard
 * Central hub for managing media relations and press contacts
 */

import Link from 'next/link';

export default async function PressDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Press & Media Dashboard</h1>
        <p className="text-gray-600">Manage media relations, press contacts, and coverage tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Press Contacts Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">📰 Press Contacts</h2>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">21</p>
          <p className="text-sm text-gray-600 mb-4">Media outlets and journalists</p>
          <Link
            href="/admin/press/contacts"
            className="text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            View all contacts →
          </Link>
        </div>

        {/* Media Coverage Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-600">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">📝 Media Coverage</h2>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">-</p>
          <p className="text-sm text-gray-600 mb-4">Tracked articles and mentions</p>
          <Link
            href="/admin/press/coverage"
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
          >
            View coverage →
          </Link>
        </div>

        {/* Press Releases Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-violet-600">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">📢 Press Releases</h2>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">-</p>
          <p className="text-sm text-gray-600 mb-4">Published releases</p>
          <Link
            href="/admin/press/releases"
            className="text-violet-600 hover:text-violet-700 font-medium text-sm"
          >
            View releases →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/press/contacts"
            className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
          >
            <div className="text-2xl mb-2">📰</div>
            <div className="font-medium text-gray-900">View Contacts</div>
            <div className="text-sm text-gray-600">Browse all media contacts</div>
          </Link>

          <Link
            href="/admin/press/outlets"
            className="p-4 border-2 border-indigo-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
          >
            <div className="text-2xl mb-2">🏢</div>
            <div className="font-medium text-gray-900">Media Outlets</div>
            <div className="text-sm text-gray-600">Manage outlet relationships</div>
          </Link>

          <Link
            href="/admin/press/coverage"
            className="p-4 border-2 border-violet-200 rounded-lg hover:border-violet-400 hover:bg-violet-50 transition-colors"
          >
            <div className="text-2xl mb-2">📝</div>
            <div className="font-medium text-gray-900">Track Coverage</div>
            <div className="text-sm text-gray-600">Log media mentions</div>
          </Link>

          <Link
            href="/admin/press/releases"
            className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
          >
            <div className="text-2xl mb-2">📢</div>
            <div className="font-medium text-gray-900">Press Releases</div>
            <div className="text-sm text-gray-600">Manage press releases</div>
          </Link>
        </div>
      </div>

      {/* Getting Started */}
      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="font-semibold text-purple-900 mb-2">🚀 Getting Started</h3>
        <p className="text-purple-800 text-sm mb-3">
          Your press contacts have been imported from Pipedrive. Next steps:
        </p>
        <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
          <li>Review and categorize media contacts by type (journalist, editor, blogger)</li>
          <li>Group contacts by publication or outlet</li>
          <li>Start tracking media coverage and mentions</li>
          <li>Plan and distribute press releases</li>
        </ul>
      </div>
    </div>
  );
}
