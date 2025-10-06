'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface Tool {
  code: string;
  description: string | null;
}

interface CategoryCardProps {
  category: {
    name: string;
    tools: Tool[];
    exampleImage: string;
  };
  style: {
    gradient: string;
    iconBg: string;
    accentColor: string;
  };
}

export function CategoryCard({ category, style }: CategoryCardProps) {
  const [imageError, setImageError] = useState(false);
  const toolCount = category.tools.length;

  return (
    <div
      className={`bg-gradient-to-br ${style.gradient} rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}
    >
      {/* Card Header with Image */}
      <div className="relative h-48 bg-white/50">
        <Image
          src={imageError ? '/product-placeholder.svg' : category.exampleImage}
          alt={`${category.name} Tools`}
          fill
          className="object-contain p-4"
          onError={() => setImageError(true)}
        />
        {/* Category Badge */}
        <div className={`absolute top-4 right-4 ${style.iconBg} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
          {toolCount} {toolCount === 1 ? 'Tool' : 'Tools'}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {category.name}
        </h3>

        {/* Show first 3 tool examples */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Featured Tools:</p>
          <ul className="space-y-1">
            {category.tools.slice(0, 3).map((tool) => (
              <li key={tool.code} className="flex items-center text-sm text-gray-700">
                <svg className={`w-3 h-3 ${style.accentColor} mr-2 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="truncate">{tool.description || tool.code}</span>
              </li>
            ))}
            {category.tools.length > 3 && (
              <li className={`text-sm ${style.accentColor} font-medium`}>
                +{category.tools.length - 3} more
              </li>
            )}
          </ul>
        </div>

        {/* Call to Action */}
        <Link
          href={`/tools/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
          className={`inline-flex items-center ${style.iconBg} text-white px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity`}
        >
          View {category.name} Tools
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}