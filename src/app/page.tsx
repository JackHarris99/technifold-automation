// import Link from 'next/link'; // Currently unused
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { ProductCategoriesMenu } from '@/components/marketing/ProductCategoriesMenu';
import { HeroSection } from '@/components/marketing/HeroSection';
import { ProductShowcase } from '@/components/marketing/ProductShowcase';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <ProductCategoriesMenu />
      <main>
        <HeroSection />
        <ProductShowcase />
      </main>
      <MarketingFooter />
    </div>
  );
}

export const metadata = {
  title: 'Technifold - Professional Print Finishing Solutions',
  description: 'Leading manufacturer of Tri-Creaser and Spine-Creaser systems. Professional print finishing tools and consumables for the graphic arts industry.',
};
