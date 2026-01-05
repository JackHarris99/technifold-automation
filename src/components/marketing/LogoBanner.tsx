'use client';

export default function LogoBanner() {
  return (
    <section className="bg-white py-8 border-b border-gray-200 overflow-hidden">
      <div className="mb-4">
        <p className="text-center text-sm font-semibold text-gray-600 uppercase tracking-wide">
          Compatible With Leading Machinery Brands
        </p>
      </div>
      <div className="relative">
        <style jsx>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .logo-scroll {
            animation: scroll 40s linear infinite;
          }
          .logo-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div className="flex logo-scroll">
          {/* First set of logos */}
          <div className="flex items-center gap-12 px-6">
            <img src="/images/logo/heidelberg.png" alt="Heidelberg" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/horizon.png" alt="Horizon" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/duplo.png" alt="Duplo" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/mbo.png" alt="MBO" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/muller-martini.png" alt="Muller Martini" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/morgana.png" alt="Morgana" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/kolbus.png" alt="Kolbus" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/hohner.png" alt="Hohner" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/baumfolder.png" alt="Baumfolder" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/guk.png" alt="GUK" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/harris.png" alt="Harris" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/kluge.png" alt="Kluge" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/longford.png" alt="Longford" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/macey.png" alt="Macey" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/mb-bauerle.png" alt="MB Bäuerle" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/multigraf.png" alt="Multigraf" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/rollem.png" alt="Rollem" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/rosback.png" alt="Rosback" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/wohlenberg.png" alt="Wohlenberg" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
          </div>
          {/* Duplicate set for seamless loop */}
          <div className="flex items-center gap-12 px-6">
            <img src="/images/logo/heidelberg.png" alt="Heidelberg" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/horizon.png" alt="Horizon" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/duplo.png" alt="Duplo" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/mbo.png" alt="MBO" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/muller-martini.png" alt="Muller Martini" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/morgana.png" alt="Morgana" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/kolbus.png" alt="Kolbus" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/hohner.png" alt="Hohner" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/baumfolder.png" alt="Baumfolder" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/guk.png" alt="GUK" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/harris.png" alt="Harris" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/kluge.png" alt="Kluge" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/longford.png" alt="Longford" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/macey.png" alt="Macey" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/mb-bauerle.png" alt="MB Bäuerle" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/multigraf.png" alt="Multigraf" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/rollem.png" alt="Rollem" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/rosback.png" alt="Rosback" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="/images/logo/wohlenberg.png" alt="Wohlenberg" className="h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
          </div>
        </div>
      </div>
    </section>
  );
}
