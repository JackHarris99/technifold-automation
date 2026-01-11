import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About Technifold</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-800 mb-6">
            Leading manufacturer of professional print finishing solutions for the graphic arts industry.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Solutions</h2>
          <p className="text-gray-700 mb-4">
            Technifold specializes in innovative print finishing systems including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
            <li>Tri-Creaser systems for digital and offset presses</li>
            <li>Spine-Creaser technology for perfect binding</li>
            <li>Professional tools and consumables</li>
            <li>Production-proven solutions for print finishing challenges</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Commitment</h2>
          <p className="text-gray-700 mb-4">
            We are committed to providing the highest quality print finishing solutions
            that help our customers achieve exceptional results and improve their production efficiency.
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}

export const metadata = {
  title: 'About Technifold - Professional Print Finishing Solutions',
  description: 'Learn about Technifold, leading manufacturer of Tri-Creaser and Spine-Creaser systems for the graphic arts industry.',
};
