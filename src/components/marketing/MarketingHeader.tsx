import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase';
import MediaImage from '../shared/MediaImage';

export async function MarketingHeader() {
  // Fetch brand logos from database
  const supabase = getSupabaseClient();
  const { data: brands } = await supabase
    .from('site_branding')
    .select('brand_key, brand_name, logo_url')
    .order('brand_key');

  // Create a map for easy lookup
  const brandMap = new Map(
    (brands || []).map(b => [b.brand_key, b])
  );

  const technifold = brandMap.get('technifold');
  const technicrease = brandMap.get('technicrease');
  const creasestream = brandMap.get('creasestream');

  return (
    <header className="bg-white border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Three Brand Logos */}
          <div className="flex items-center gap-8">
            {technifold?.logo_url ? (
              <Link href="/" className="flex items-center">
                <div className="relative h-12 w-auto">
                  <MediaImage
                    src={technifold.logo_url}
                    alt="Technifold"
                    width={150}
                    height={48}
                    className="h-12 w-auto object-contain"
                  />
                </div>
              </Link>
            ) : (
              <Link href="/" className="flex items-center">
                <div className="h-12 w-32 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-sm text-gray-400">Technifold</span>
                </div>
              </Link>
            )}

            {technicrease?.logo_url ? (
              <div className="flex items-center">
                <div className="relative h-10 w-auto">
                  <MediaImage
                    src={technicrease.logo_url}
                    alt="Technicrease"
                    width={150}
                    height={40}
                    className="h-10 w-auto object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="h-10 w-32 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-sm text-gray-400">Technicrease</span>
              </div>
            )}

            {creasestream?.logo_url ? (
              <div className="flex items-center">
                <div className="relative h-10 w-auto">
                  <MediaImage
                    src={creasestream.logo_url}
                    alt="CreaseStream"
                    width={150}
                    height={40}
                    className="h-10 w-auto object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="h-10 w-32 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-sm text-gray-400">CreaseStream</span>
              </div>
            )}
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