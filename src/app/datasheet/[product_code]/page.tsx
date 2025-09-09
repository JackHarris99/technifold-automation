import { notFound } from 'next/navigation';
import { getToolByProductCode, getCompatibleConsumables, decodeProductCodeFromUrl } from '@/lib/supabase';
import { TechnicalDataSheet } from '@/components/technical/TechnicalDataSheet';

interface PageProps {
  params: Promise<{ product_code: string }>;
}

export default async function TechnicalSpecPage({ params }: PageProps) {
  const { product_code } = await params;
  
  // Decode the product code from URL (handles codes with slashes like "FF-MF/30-FP-01")
  const decodedProductCode = decodeProductCodeFromUrl(product_code);

  const [tool, consumables] = await Promise.all([
    getToolByProductCode(decodedProductCode),
    getCompatibleConsumables(decodedProductCode)
  ]);

  if (!tool) {
    notFound();
  }

  return (
    <TechnicalDataSheet 
      tool={tool}
      consumables={consumables as any[]} // eslint-disable-line @typescript-eslint/no-explicit-any
    />
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { product_code } = await params;
  const decodedProductCode = decodeProductCodeFromUrl(product_code);
  const tool = await getToolByProductCode(decodedProductCode);
  
  if (!tool) {
    return {
      title: 'Product Not Found - Technifold',
    };
  }

  return {
    title: `${tool.product_name || tool.name || decodedProductCode} - Technical Specifications | Technifold`,
    description: `Technical data sheet for ${tool.product_name || decodedProductCode}. Specifications, compatibility, and consumables information.`,
    robots: 'noindex, nofollow', // Not for public SEO - direct access only
  };
}