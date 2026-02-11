import Link from 'next/link';
import Image from 'next/image';

export async function MarketingHeader() {
  return (
    <header>
      {/* Top Row - Logos Only (White Background) */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-8">
            <Link href="/" className="relative h-10 w-32">
              <Image
                src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/technifold.png"
                alt="Technifold"
                fill
                className="object-contain"
                priority
              />
            </Link>

            <div className="relative h-10 w-32">
              <Image
                src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/technicrease.png"
                alt="Technicrease"
                fill
                className="object-contain"
                priority
              />
            </div>

            <div className="relative h-10 w-32">
              <Image
                src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/creasestream.png"
                alt="Creasestream"
                fill
                className="object-contain"
                priority
              />
            </div>
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
            <Link
              href="/distributor/login"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold tracking-wide transition-all text-[15px] uppercase px-4 py-2 rounded-lg border border-white/30"
              style={{ fontFamily: "'Inter', 'system-ui', sans-serif", letterSpacing: '0.5px' }}
            >
              Distributor Login
            </Link>
            <Link
              href="/customer/login"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold tracking-wide transition-all text-[15px] uppercase px-4 py-2 rounded-lg border border-white/30"
              style={{ fontFamily: "'Inter', 'system-ui', sans-serif", letterSpacing: '0.5px' }}
            >
              Customer Login
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}