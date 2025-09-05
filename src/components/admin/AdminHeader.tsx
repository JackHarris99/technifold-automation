import Link from 'next/link';

export function AdminHeader() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Technifold</h1>
                <p className="text-xs text-gray-500">Admin Dashboard</p>
              </div>
            </Link>
          </div>
          
          <nav className="flex space-x-8">
            <Link
              href="/admin"
              className="text-blue-600 bg-blue-50 px-3 py-2 rounded-md text-sm font-medium"
            >
              Companies
            </Link>
            <Link
              href="/admin/campaigns"
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Email Campaigns
            </Link>
            <Link
              href="/admin/analytics"
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Analytics
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}