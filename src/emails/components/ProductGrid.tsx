/**
 * Product Grid Component
 * Responsive 2-column grid for 1-6 consumable products
 */

import * as React from 'react';
import { Section } from '@react-email/components';
import { ProductCard } from './ProductCard';
import { spacing } from '../styles/theme';

interface Product {
  sku: string;
  imageUrl?: string;
}

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  // Group products into rows of 2
  const rows: Product[][] = [];
  for (let i = 0; i < products.length; i += 2) {
    rows.push(products.slice(i, i + 2));
  }

  return (
    <Section style={gridSection}>
      <table style={gridTable}>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((product, colIndex) => (
                <ProductCard
                  key={`${rowIndex}-${colIndex}`}
                  sku={product.sku}
                  imageUrl={product.imageUrl}
                />
              ))}
              {/* Fill empty cell if odd number of products */}
              {row.length === 1 && <td style={emptyCell}></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

const gridSection = {
  padding: `0 ${spacing.lg}`,
  margin: `${spacing.lg} 0`,
};

const gridTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const emptyCell = {
  width: '50%',
};
