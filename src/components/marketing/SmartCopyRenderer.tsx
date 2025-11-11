/**
 * Marketing Copy Renderer
 * Professional typography-focused rendering without aggressive parsing
 */

'use client';

import ReactMarkdown from 'react-markdown';

interface SmartCopyRendererProps {
  content: string;
  problemTitle?: string;
}

export default function SmartCopyRenderer({ content, problemTitle }: SmartCopyRendererProps) {
  return (
    <div className="prose prose-lg max-w-none">
      <style jsx global>{`
        .prose {
          --tw-prose-body: rgb(31 41 55);
          --tw-prose-headings: rgb(17 24 39);
          --tw-prose-bold: rgb(17 24 39);
        }

        .prose p {
          font-size: 1.125rem;
          line-height: 1.8;
          color: rgb(55 65 81);
          margin-bottom: 1.25rem;
        }

        .prose strong {
          font-weight: 600;
          color: rgb(17 24 39);
        }

        .prose h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: rgb(17 24 39);
          margin-top: 2rem;
          margin-bottom: 1rem;
          line-height: 1.3;
        }

        .prose h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: rgb(31 41 55);
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }

        .prose ul {
          margin-top: 1.25rem;
          margin-bottom: 1.25rem;
          list-style-type: none;
          padding-left: 0;
        }

        .prose ul li {
          position: relative;
          padding-left: 1.75rem;
          margin-bottom: 0.75rem;
          font-size: 1.0625rem;
          line-height: 1.7;
          color: rgb(55 65 81);
        }

        .prose ul li::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: rgb(34 197 94);
          font-weight: 700;
          font-size: 1.125rem;
        }

        .prose ol {
          margin-top: 1.25rem;
          margin-bottom: 1.25rem;
          padding-left: 1.75rem;
        }

        .prose ol li {
          margin-bottom: 0.75rem;
          font-size: 1.0625rem;
          line-height: 1.7;
          color: rgb(55 65 81);
        }
      `}</style>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
