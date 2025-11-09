import Link from 'next/link';

export function MarketingHeader() {
  return (
    <header className="bg-white border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Three Brand Logos */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <img
                src="/media/technifold-logo.png"
                alt="Technifold"
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden h-12 w-32 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-sm text-gray-400">Technifold</span>
              </div>
            </Link>

            <div className="flex items-center">
              <img
                src="/media/technicrease-logo.png"
                alt="Technicrease"
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden h-10 w-32 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-sm text-gray-400">Technicrease</span>
              </div>
            </div>

            <div className="flex items-center">
              <img
                src="/media/creasestream-logo.png"
                alt="CreaseStream"
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden h-10 w-32 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-sm text-gray-400">CreaseStream</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium">
              Contact
            </Link>
          </div>

          {/* CTA Button */}
          <div className="flex items-center space-x-4">
            <Link
              href="/admin"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Admin
            </Link>
            <Link
              href="/contact"
              className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Get Quote
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}