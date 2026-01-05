'use client';

export default function LogoBanner() {
  const logos = [
    'heidelberg', 'horizon', 'duplo', 'mbo', 'muller-martini',
    'morgana', 'kolbus', 'hohner', 'baumfolder', 'guk',
    'harris', 'kluge', 'longford', 'macey', 'mb-bauerle',
    'multigraf', 'rollem', 'rosback', 'wohlenberg'
  ];

  return (
    <section className="bg-white py-8 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-6">
          <p className="text-center text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Compatible With Leading Machinery Brands
          </p>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-8 items-center justify-items-center">
          {logos.map((logo) => (
            <div key={logo} className="w-24 h-16 flex items-center justify-center">
              <img
                src={`/images/logo/${logo}.png`}
                alt={logo.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
