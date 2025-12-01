/**
 * Machine Marketing Page - Template-Driven with Database Copy
 *
 * Features:
 * - Fetches copy templates from database
 * - Dynamic personalization ({brand}, {model}, {type})
 * - SEO optimized (meta tags, structured data)
 * - Request trial flow (not direct Stripe)
 */

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'link';
import { createServerClient } from '@/lib/supabase-server';
import MachinePageClient from './MachinePageClient';

interface Machine {
  machine_id: string;
  slug: string;
  brand: string;
  model: string;
  type: string;
  display_name: string;
}

interface PageTemplate {
  template_key: string;
  machine_type: string;
  copy_sections: any;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createServerClient();

  const { data: machine } = await supabase
    .from('machines')
    .select('brand, model, type, display_name')
    .eq('slug', params.slug)
    .single();

  if (!machine) {
    return {
      title: 'Machine Not Found | Technifold'
    };
  }

  const machineTypeName = getMachineTypeName(machine.type);

  return {
    title: `Creasing Solutions for ${machine.brand} ${machine.model} | Technifold`,
    description: `Eliminate fiber cracking and quality issues on your ${machine.brand} ${machine.model}. Inline finishing solutions from £99/month. 30-day free trial.`,
    openGraph: {
      title: `Transform Your ${machine.brand} ${machine.model}`,
      description: `Professional finishing solutions for your ${machineTypeName}. From £99/month.`,
      type: 'website',
    },
  };
}

export default async function MachinePage({ params }: { params: { slug: string } }) {
  const supabase = createServerClient();

  // Fetch machine data
  const { data: machine } = await supabase
    .from('machines')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!machine) {
    notFound();
  }

  // Fetch page template for this machine type
  const { data: template } = await supabase
    .from('machine_page_templates')
    .select('*')
    .eq('machine_type', machine.type)
    .eq('active', true)
    .single();

  // Fallback to default template if none found
  const pageTemplate = template || getDefaultTemplate(machine.type);

  // Determine base pricing
  const basePricing = getMachinePricing(machine.type);

  // Personalization data
  const personalization = {
    brand: machine.brand || 'your',
    model: machine.model || 'machine',
    machine_type: getMachineTypeName(machine.type),
    monthly_price: basePricing.display,
    typical_range: basePricing.typicalRange,
  };

  // Replace placeholders in template
  const renderedCopy = replacePlaceholders(pageTemplate.copy_sections, personalization);

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: `Technifold Finishing System - ${machine.brand} ${machine.model}`,
            description: renderedCopy.hero_subheading,
            brand: {
              '@type': 'Brand',
              name: 'Technifold',
            },
            offers: {
              '@type': 'Offer',
              price: basePricing.amount,
              priceCurrency: 'GBP',
              availability: 'https://schema.org/InStock',
            },
          }),
        }}
      />

      <MachinePageClient
        machine={machine}
        renderedCopy={renderedCopy}
        basePricing={basePricing}
        personalization={personalization}
      />
    </>
  );
}

// Helper Functions

function getMachinePricing(type: string) {
  const pricing = {
    'folding-machines': { amount: 99, display: '£99', typicalRange: '£139-£159' },
    'saddle-stitchers': { amount: 69, display: '£69', typicalRange: '£89-£119' },
    'perfect-binders': { amount: 89, display: '£89', typicalRange: '£119-£149' },
  };

  return pricing[type as keyof typeof pricing] || pricing['folding-machines'];
}

function getMachineTypeName(type: string): string {
  const names = {
    'folding-machines': 'folding machine',
    'saddle-stitchers': 'saddle stitcher',
    'perfect-binders': 'perfect binder',
  };

  return names[type as keyof typeof names] || type.replace(/-/g, ' ');
}

function replacePlaceholders(template: any, data: Record<string, string>): any {
  const jsonString = JSON.stringify(template);
  let replaced = jsonString;

  // Replace all {placeholder} variables
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    replaced = replaced.replace(regex, value);
  }

  return JSON.parse(replaced);
}

function getDefaultTemplate(machineType: string): PageTemplate {
  // Hardcoded fallback template if database is empty
  return {
    template_key: 'default-folding',
    machine_type: machineType,
    copy_sections: {
      hero_headline: 'Transform Finishing Quality On Your {brand} {model}',
      hero_subheading: 'Professional inline finishing solutions. From {monthly_price}/month.',
      problem_section_title: 'The Problems You Face',
      problems: [
        {
          icon: '⚠️',
          title: 'Quality Issues',
          description: 'Fiber cracking, poor folds, and inconsistent results.',
        },
        {
          icon: '⏱️',
          title: 'Slow Production',
          description: 'Manual finishing creates bottlenecks.',
        },
        {
          icon: '💸',
          title: 'High Costs',
          description: 'Rejects and rework eat into your profits.',
        },
      ],
      solution_section_title: 'How We Solve This',
      solution_subheading: 'Professional finishing capability for your {machine_type}.',
      solution_features: [
        {
          title: 'Inline Finishing',
          description: 'Crease, perforate, and cut in one pass',
        },
        {
          title: 'Perfect Quality',
          description: 'Eliminate fiber cracking and quality issues',
        },
        {
          title: 'Faster Production',
          description: 'Run 30-50% faster with inline capability',
        },
      ],
      value_props: [
        {
          icon: '💰',
          title: 'Save Money',
          description: 'Reduce rejects and rework',
        },
        {
          icon: '⚡',
          title: 'Increase Speed',
          description: 'Eliminate bottlenecks',
        },
      ],
      cta_primary: 'Request Free Trial',
      cta_secondary: 'Learn More',
      pricing_title: 'Simple Pricing',
      pricing_subheading: 'From {monthly_price}/month',
    },
  };
}
