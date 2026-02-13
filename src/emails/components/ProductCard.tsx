/**
 * Product Card Component
 * Displays single consumable product with image and SKU
 */

import * as React from 'react';
import { Img, Text } from '@react-email/components';
import { colors, fonts, spacing, borderRadius } from '../styles/theme';

interface ProductCardProps {
  sku: string;
  imageUrl?: string;
}

export function ProductCard({ sku, imageUrl }: ProductCardProps) {
  const defaultImage = 'https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/products/placeholder.jpg';
  const productImage = imageUrl || defaultImage;

  return (
    <td style={cardCell}>
      <table style={cardTable}>
        <tr>
          <td style={imageCell}>
            <Img
              src={productImage}
              alt={sku}
              width="100"
              height="100"
              style={image}
            />
          </td>
        </tr>
        <tr>
          <td style={skuCell}>
            <Text style={skuText}>{sku}</Text>
          </td>
        </tr>
      </table>
    </td>
  );
}

const cardCell = {
  width: '50%',
  verticalAlign: 'top' as const,
  padding: spacing.sm,
};

const cardTable = {
  width: '100%',
  backgroundColor: colors.white,
  border: `1px solid ${colors.border}`,
  borderRadius: borderRadius.md,
  overflow: 'hidden',
};

const imageCell = {
  backgroundColor: '#f9fafb',
  padding: spacing.md,
  textAlign: 'center' as const,
  height: '120px',
  verticalAlign: 'middle' as const,
};

const image = {
  maxWidth: '100px',
  maxHeight: '100px',
  width: 'auto',
  height: 'auto',
  objectFit: 'contain' as const,
  display: 'block',
  margin: '0 auto',
};

const skuCell = {
  padding: spacing.md,
  textAlign: 'center' as const,
};

const skuText = {
  fontFamily: fonts.code,
  fontSize: '13px',
  fontWeight: '700',
  color: colors.accent,
  margin: 0,
};
