/**
 * Content Blocks Component
 * Renders content blocks (features, benefits, stats, etc.) in modern styled containers
 */

'use client';

import ReactMarkdown from 'react-markdown';

interface ContentBlock {
  block_id: string;
  block_type: string;
  title?: string;
  content: string;
  icon?: string;
  display_order: number;
  is_override?: boolean;
}

interface ContentBlocksProps {
  blocks: ContentBlock[];
  blocksByType?: Record<string, ContentBlock[]>;
}

export default function ContentBlocks({ blocks, blocksByType }: ContentBlocksProps) {
  // If we have grouped blocks, render by type
  if (blocksByType && Object.keys(blocksByType).length > 0) {
    return (
      <div className="space-y-8">
        {blocksByType.feature && blocksByType.feature.length > 0 && (
          <FeaturesSection features={blocksByType.feature} />
        )}
        {blocksByType.benefit && blocksByType.benefit.length > 0 && (
          <BenefitsSection benefits={blocksByType.benefit} />
        )}
        {blocksByType.stat && blocksByType.stat.length > 0 && (
          <StatsSection stats={blocksByType.stat} />
        )}
        {blocksByType.step && blocksByType.step.length > 0 && (
          <StepsSection steps={blocksByType.step} />
        )}
        {blocksByType.testimonial && blocksByType.testimonial.length > 0 && (
          <TestimonialsSection testimonials={blocksByType.testimonial} />
        )}
      </div>
    );
  }

  // Otherwise, render all blocks in a generic container
  return (
    <div className="space-y-6">
      {blocks.map(block => (
        <GenericBlock key={block.block_id} block={block} />
      ))}
    </div>
  );
}

// Features Section - Grid of feature cards
function FeaturesSection({ features }: { features: ContentBlock[] }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12">
      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Key Features</h3>
      <div className="grid md:grid-cols-2 gap-6">
        {features.map(feature => (
          <div key={feature.block_id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              {feature.icon && (
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
              )}
              <div className="flex-1">
                {feature.title && (
                  <h4 className="font-bold text-lg text-gray-900 mb-2">{feature.title}</h4>
                )}
                <div className="prose prose-sm max-w-none text-gray-600">
                  <ReactMarkdown>{feature.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Benefits Section - Checklist style
function BenefitsSection({ benefits }: { benefits: ContentBlock[] }) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 md:p-12">
      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Key Benefits</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {benefits.map(benefit => (
          <div key={benefit.block_id} className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-sm">
            <svg className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div className="flex-1">
              {benefit.title && (
                <h4 className="font-bold text-gray-900 mb-1">{benefit.title}</h4>
              )}
              <div className="prose prose-sm max-w-none text-gray-700">
                <ReactMarkdown>{benefit.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Stats Section - Highlight key metrics
function StatsSection({ stats }: { stats: ContentBlock[] }) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 md:p-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map(stat => (
          <div key={stat.block_id} className="bg-white rounded-xl p-6 text-center shadow-sm">
            {stat.icon && (
              <div className="text-4xl mb-2">{stat.icon}</div>
            )}
            <div className="text-3xl font-bold text-purple-600 mb-2">{stat.title}</div>
            <div className="text-sm text-gray-600">
              <ReactMarkdown>{stat.content}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Steps Section - Numbered steps
function StepsSection({ steps }: { steps: ContentBlock[] }) {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 md:p-12">
      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">How It Works</h3>
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.block_id} className="flex gap-6 bg-white rounded-xl p-6 shadow-sm">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
              {index + 1}
            </div>
            <div className="flex-1">
              {step.title && (
                <h4 className="font-bold text-lg text-gray-900 mb-2">{step.title}</h4>
              )}
              <div className="prose prose-sm max-w-none text-gray-700">
                <ReactMarkdown>{step.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Testimonials Section
function TestimonialsSection({ testimonials }: { testimonials: ContentBlock[] }) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl p-8 md:p-12">
      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">What Customers Say</h3>
      <div className="grid md:grid-cols-2 gap-6">
        {testimonials.map(testimonial => (
          <div key={testimonial.block_id} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-yellow-500 text-2xl mb-3">★★★★★</div>
            <div className="prose prose-sm max-w-none text-gray-700 mb-4">
              <ReactMarkdown>{testimonial.content}</ReactMarkdown>
            </div>
            {testimonial.title && (
              <div className="font-semibold text-gray-900">{testimonial.title}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Generic Block - Fallback for unknown types
function GenericBlock({ block }: { block: ContentBlock }) {
  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      {block.title && (
        <h4 className="font-bold text-lg text-gray-900 mb-3">{block.title}</h4>
      )}
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{block.content}</ReactMarkdown>
      </div>
    </div>
  );
}
