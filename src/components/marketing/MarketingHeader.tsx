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
    <header>
      {/* Top Row - Logos Only (White Background) */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-20 gap-8">
            {technifold?.logo_url ? (
              <Link href="/" className="flex items-center h-12">
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
              <Link href="/" className="flex items-center h-12">
                <div className="h-12 w-32 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-sm text-gray-400">Technifold</span>
                </div>
              </Link>
            )}

            {technicrease?.logo_url ? (
              <div className="flex items-center h-12">
                <div className="relative h-12 w-auto">
                  <MediaImage
                    src={technicrease.logo_url}
                    alt="Technicrease"
                    width={150}
                    height={48}
                    className="h-12 w-auto object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="h-12 w-32 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-sm text-gray-400">Technicrease</span>
              </div>
            )}

            {creasestream?.logo_url ? (
              <div className="flex items-center h-12">
                <div className="relative h-12 w-auto">
                  <MediaImage
                    src={creasestream.logo_url}
                    alt="CreaseStream"
                    width={150}
                    height={48}
                    className="h-12 w-auto object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="h-12 w-32 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-sm text-gray-400">CreaseStream</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row - Navigation (Blue Background) */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-14 gap-8">
            <Link
              href="/about"
              className="text-white hover:text-blue-100 font-medium tracking-wide transition-colors text-[15px] uppercase"
              style={{ fontFamily: "'Inter', 'system-ui', sans-serif", letterSpacing: '0.5px' }}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-white hover:text-blue-100 font-medium tracking-wide transition-colors text-[15px] uppercase"
              style={{ fontFamily: "'Inter', 'system-ui', sans-serif", letterSpacing: '0.5px' }}
            >
              Contact
            </Link>
            <Link
              href="/admin"
              className="text-white hover:text-blue-100 font-medium tracking-wide transition-colors text-[15px] uppercase"
              style={{ fontFamily: "'Inter', 'system-ui', sans-serif", letterSpacing: '0.5px' }}
            >
              Admin
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}