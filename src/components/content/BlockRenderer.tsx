'use client';

/**
 * Block Renderer - Renders different content block types beautifully
 */

import ReactMarkdown from 'react-markdown';

interface ContentBlock {
  block_id: string;
  block_type: string;
  solution_slug: string | null;
  relevance_tags: string[];
  content: any;
  priority: number;
  relevance_score?: number;
}

interface BlockRendererProps {
  block: ContentBlock;
  machineContext?: {
    brand?: string;
    model?: string;
    display_name?: string;
  };
}

export function BlockRenderer({ block, machineContext }: BlockRendererProps) {
  const { block_type, content } = block;

  switch (block_type) {
    case 'intro':
      return <IntroBlock content={content} machineContext={machineContext} />;

    case 'highlight':
      return <HighlightBlock content={content} />;

    case 'benefits':
      return <BenefitsBlock content={content} />;

    case 'hierarchy':
      return <HierarchyBlock content={content} />;

    case 'stats_list':
      return <StatsListBlock content={content} />;

    case 'testimonial':
      return <TestimonialBlock content={content} />;

    case 'tech_spec':
      return <TechSpecBlock content={content} />;

    case 'content_section':
      return <ContentSectionBlock content={content} />;

    default:
      return <GenericBlock content={content} />;
  }
}

// INTRO BLOCK - Hero-style introduction
function IntroBlock({ content, machineContext }: { content: any; machineContext?: any }) {
  const heading = content.heading || '';
  const text = content.text || '';

  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-12 mb-12 overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
        <svg viewBox="0 0 200 200" fill="currentColor">
          <path d="M45.1,-78.1C58.9,-70.5,71.1,-59.4,79.6,-45.8C88.1,-32.2,92.9,-16.1,93.4,0.3C93.9,16.7,90.1,33.4,81.1,47.3C72.1,61.2,58,72.3,42.8,79.8C27.6,87.3,11.3,91.2,-4.7,99.2C-20.7,107.2,-41.4,119.3,-57.8,112.8C-74.2,106.3,-86.3,81.2,-93.1,57.4C-99.9,33.6,-101.4,11.1,-98.7,-10.3C-96,-31.7,-89.1,-52,-77.9,-67.8C-66.7,-83.6,-51.2,-94.9,-34.8,-100.8C-18.4,-106.7,-1.1,-107.2,14.9,-102.3C30.9,-97.4,31.3,-85.7,45.1,-78.1Z" />
        </svg>
      </div>

      <div className="relative z-10">
        {machineContext?.display_name && (
          <div className="mb-6 inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-bold text-lg">Perfect Match for Your {machineContext.display_name}</span>
          </div>
        )}

        <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
          {heading}
        </h1>

        <div className="prose prose-xl prose-invert max-w-none text-blue-50 leading-relaxed">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

// HIGHLIGHT BLOCK - Eye-catching callouts
function HighlightBlock({ content }: { content: any }) {
  const text = content.text || '';

  // Don't render if no text
  if (!text || text.trim().length === 0) {
    return null;
  }

  return (
    <div className="relative my-12">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl transform -rotate-1"></div>
      <div className="relative bg-white rounded-2xl p-8 md:p-12 shadow-2xl border-4 border-amber-400">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight flex-1">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

// BENEFITS BLOCK - Visually striking benefits grid
function BenefitsBlock({ content }: { content: any }) {
  const heading = content.heading || '';
  const markdown = content.markdown || '';

  // Don't render if no content
  if (!heading && !markdown) {
    return null;
  }

  return (
    <div className="my-16">
      {heading && (
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">{heading}</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
        </div>
      )}

      {markdown && (
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 md:p-12 border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-2xl">
          <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-blue-700">
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

// HIERARCHY BLOCK (Product versions)
function HierarchyBlock({ content }: { content: any }) {
  const heading = content.heading || '';
  const markdown = content.markdown || '';

  return (
    <div className="my-8 bg-white rounded-xl p-8 border-2 border-gray-200 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{heading}</h2>
      <div className="prose max-w-none">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}

// STATS LIST BLOCK
function StatsListBlock({ content }: { content: any }) {
  const heading = content.heading || '';
  const stats = content.stats || [];

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{heading}</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat: any, idx: number) => (
          <div key={idx} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
            <div className="text-3xl font-bold text-green-700 mb-2">
              {stat.value}
            </div>
            <div className="text-gray-700 font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// TESTIMONIAL BLOCK
function TestimonialBlock({ content }: { content: any }) {
  const quote = content.quote || '';
  const customer = content.customer || '';
  const company = content.company || '';
  const location = content.location || '';
  const role = content.role || '';

  return (
    <div className="my-12 relative">
      <div className="absolute -inset-4 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-3xl opacity-20 blur-2xl"></div>

      <div className="relative bg-white rounded-3xl p-10 md:p-14 shadow-2xl border border-gray-200">
        <div className="flex gap-1 mb-6">
          {[1,2,3,4,5].map(i => (
            <svg key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        <div className="relative mb-8">
          <svg className="absolute -top-4 -left-2 w-12 h-12 text-blue-100" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <p className="text-2xl md:text-3xl text-gray-800 font-medium leading-relaxed pl-8">
            {quote}
          </p>
        </div>

        <div className="flex items-center gap-5 pt-6 border-t-2 border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg">
            {customer ? customer[0] : '?'}
          </div>
          <div>
            <div className="font-bold text-xl text-gray-900">{customer}</div>
            <div className="text-gray-600 font-medium">
              {role && <span>{role} • </span>}
              <span className="text-blue-600 font-semibold">{company}</span>
              {location && <span className="text-gray-400"> • {location}</span>}
            </div>
          </div>
        </div>

        <div className="mt-6 inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-sm font-bold">Verified Customer</span>
        </div>
      </div>
    </div>
  );
}

// TECH SPEC BLOCK
function TechSpecBlock({ content }: { content: any }) {
  const heading = content.heading || '';
  const markdown = content.markdown || '';

  // Don't render if no content
  if (!heading && !markdown) {
    return null;
  }

  return (
    <div className="my-12 bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl p-8 md:p-10 border-2 border-gray-300 shadow-sm">
      {heading && (
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-2xl font-bold text-gray-900">{heading}</h3>
        </div>
      )}
      {markdown && (
        <div className="prose prose-base max-w-none text-gray-700 prose-headings:text-gray-900 prose-strong:text-gray-900">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

// Helper function to filter out internal/admin-only sections from markdown
function filterCustomerMarkdown(markdown: string): string {
  if (!markdown) return '';

  // Split by markdown headings
  const lines = markdown.split('\n');
  const filteredLines: string[] = [];
  let skipSection = false;

  const internalKeywords = [
    'notes for marketing',
    'internal notes',
    'admin only',
    'do not show',
    'internal',
    'admin:',
    'note:',
    'todo:',
    'draft',
  ];

  for (const line of lines) {
    // Check if this is a heading line
    const headingMatch = line.match(/^#{1,6}\s+(.+)$/);

    if (headingMatch) {
      const headingText = headingMatch[1].toLowerCase();
      // Check if this heading indicates an internal section
      skipSection = internalKeywords.some(keyword => headingText.includes(keyword));

      // If not skipping, add the heading
      if (!skipSection) {
        filteredLines.push(line);
      }
    } else if (!skipSection) {
      // Only add non-heading lines if we're not in a skip section
      filteredLines.push(line);
    }
  }

  return filteredLines.join('\n').trim();
}

// CONTENT SECTION BLOCK (Generic markdown section)
function ContentSectionBlock({ content }: { content: any }) {
  const heading = content.heading || '';
  const rawMarkdown = content.markdown || '';

  // Filter out internal sections
  const markdown = filterCustomerMarkdown(rawMarkdown);

  // Don't render if no customer-facing content remains
  if (!markdown && !heading) {
    return null;
  }

  return (
    <div className="my-12 bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 md:p-12 border-2 border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
      {heading && (
        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">{heading}</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
        </div>
      )}
      {markdown && (
        <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

// GENERIC FALLBACK
function GenericBlock({ content }: { content: any }) {
  return (
    <div className="my-4 p-4 bg-gray-100 rounded-lg">
      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  );
}
