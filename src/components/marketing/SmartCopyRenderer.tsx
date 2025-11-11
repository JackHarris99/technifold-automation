/**
 * Smart Copy Renderer
 * Intelligently parses marketing copy and applies modern design/structure
 */

'use client';

import ReactMarkdown from 'react-markdown';

interface SmartCopyRendererProps {
  content: string;
  problemTitle?: string;
}

export default function SmartCopyRenderer({ content, problemTitle }: SmartCopyRendererProps) {
  // Parse the content intelligently
  const parsed = parseContent(content);

  return (
    <div className="space-y-8">
      {parsed.sections.map((section, index) => (
        <div key={index}>
          {/* Hero Title - First short line becomes the main title */}
          {section.heroTitle && (
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                {section.heroTitle}
              </h2>
              {section.subtitle && (
                <p className="text-xl text-gray-600 leading-relaxed">
                  {section.subtitle}
                </p>
              )}
            </div>
          )}

          {/* Section Header */}
          {section.header && (
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
              <h3 className="text-2xl font-bold text-blue-700">
                {section.header}
              </h3>
            </div>
          )}

          {/* Body Paragraphs */}
          {section.paragraphs.map((para, pIndex) => (
            <p key={pIndex} className="text-base text-gray-700 leading-relaxed mb-4">
              {para}
            </p>
          ))}

          {/* Bullet Lists with Icons */}
          {section.lists.map((list, lIndex) => (
            <div key={lIndex} className="my-6">
              {list.title && (
                <h4 className="text-lg font-bold text-gray-900 mb-4">{list.title}</h4>
              )}
              <div className="grid md:grid-cols-2 gap-3">
                {list.items.map((item, iIndex) => (
                  <div key={iIndex} className="flex items-start gap-3 bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Call-out boxes for important info */}
          {section.callouts.map((callout, cIndex) => (
            <div key={cIndex} className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-600 rounded-r-xl p-6 my-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  {callout.title && (
                    <h4 className="text-lg font-bold text-green-900 mb-2">{callout.title}</h4>
                  )}
                  <p className="text-green-900 leading-relaxed">{callout.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

interface ParsedSection {
  heroTitle?: string;
  subtitle?: string;
  header?: string;
  paragraphs: string[];
  lists: { title?: string; items: string[] }[];
  callouts: { title?: string; text: string }[];
}

interface ParsedContent {
  sections: ParsedSection[];
}

function parseContent(content: string): ParsedContent {
  const lines = content.split('\n').filter(line => line.trim());
  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection = { paragraphs: [], lists: [], callouts: [] };

  // First, check if the very first line is a short, punchy title (not a header)
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    // If first line is short (< 60 chars), doesn't start with #, and isn't a list
    if (firstLine.length < 60 && !firstLine.startsWith('#') && !firstLine.match(/^[-*•]/)) {
      currentSection.heroTitle = firstLine;
      lines.shift(); // Remove from processing

      // Check if next line is a subtitle (medium length, descriptive)
      if (lines.length > 0 && lines[0].length < 120 && !lines[0].startsWith('#')) {
        currentSection.subtitle = lines[0].trim();
        lines.shift();
      }
    }
  }

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    // Headers (##, ###)
    if (line.startsWith('##')) {
      // Save current section if it has content
      if (currentSection.paragraphs.length > 0 || currentSection.lists.length > 0) {
        sections.push(currentSection);
        currentSection = { paragraphs: [], lists: [], callouts: [] };
      }
      currentSection.header = line.replace(/^#+\s*/, '');
      i++;
      continue;
    }

    // Detect list blocks (lines starting with -, *, or •)
    if (line.match(/^[-*•]/)) {
      const listItems: string[] = [];
      let listTitle: string | undefined;

      // Check if previous line could be a list title
      if (currentSection.paragraphs.length > 0) {
        const lastPara = currentSection.paragraphs[currentSection.paragraphs.length - 1];
        if (lastPara.length < 50 && lastPara.endsWith(':')) {
          listTitle = lastPara.replace(/:$/, '');
          currentSection.paragraphs.pop();
        }
      }

      // Collect all list items
      while (i < lines.length && lines[i].trim().match(/^[-*•]/)) {
        listItems.push(lines[i].trim().replace(/^[-*•]\s*/, ''));
        i++;
      }

      currentSection.lists.push({ title: listTitle, items: listItems });
      continue;
    }

    // Detect ROI/callout patterns
    if (line.match(/ROI|guarantee|money.back|fast|quick|simple|easy/i) && line.length < 80) {
      const calloutText = [line];

      // Grab next line if it's part of the callout
      if (i + 1 < lines.length && lines[i + 1].length < 200) {
        calloutText.push(lines[i + 1]);
        i++;
      }

      currentSection.callouts.push({
        title: calloutText[0],
        text: calloutText.slice(1).join(' ')
      });
      i++;
      continue;
    }

    // Regular paragraph
    if (line.length > 0) {
      currentSection.paragraphs.push(line);
    }

    i++;
  }

  // Add final section
  if (currentSection.paragraphs.length > 0 || currentSection.lists.length > 0 || currentSection.callouts.length > 0) {
    sections.push(currentSection);
  }

  return { sections };
}
