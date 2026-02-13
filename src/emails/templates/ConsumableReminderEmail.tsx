/**
 * Consumable Reorder Reminder Email
 * Sent to customers to remind them to restock consumables
 */

import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';
import { EmailHeader } from '../components/EmailHeader';
import { EmailFooter } from '../components/EmailFooter';
import { EmailButton } from '../components/EmailButton';
import { ProductGrid } from '../components/ProductGrid';
import { colors, fonts, spacing } from '../styles/theme';

export interface ConsumableReminderEmailProps {
  contactName: string;
  companyName: string;
  products: Array<{
    sku: string;
    imageUrl?: string;
  }>;
  portalUrl: string;
  unsubscribeUrl?: string;
}

export function ConsumableReminderEmail({
  contactName,
  companyName,
  products,
  portalUrl,
  unsubscribeUrl,
}: ConsumableReminderEmailProps) {
  return (
    <EmailLayout preview={`Time to restock your consumables - ${companyName}`}>
      <EmailHeader
        title="Time to Restock?"
        subtitle="Your usual consumables are ready"
      />

      <Section style={content}>
        <Text style={greeting}>Hi {contactName},</Text>

        <Text style={bodyText}>
          It's been a while since your last order with Technifold. We thought you might need to restock your usual consumables.
        </Text>

        {products.length > 0 && (
          <>
            <Text style={sectionHeading}>Your Usual Consumables</Text>
            <ProductGrid products={products.slice(0, 6)} />
          </>
        )}

        <EmailButton href={portalUrl}>
          Reorder Consumables
        </EmailButton>

        <Section style={benefitsBox}>
          <Text style={benefitsTitle}>Why order from your portal?</Text>
          <table style={benefitsList}>
            <tr>
              <td style={benefitItem}>✓ Your personalized pricing</td>
            </tr>
            <tr>
              <td style={benefitItem}>✓ Fast checkout with saved addresses</td>
            </tr>
            <tr>
              <td style={benefitItem}>✓ Order approval within 24 hours</td>
            </tr>
          </table>
        </Section>

        <Text style={closingText}>
          This portal is personalized for {companyName}. Your access link never expires.
        </Text>
      </Section>

      <EmailFooter unsubscribeUrl={unsubscribeUrl} />
    </EmailLayout>
  );
}

// Default props for preview
ConsumableReminderEmail.PreviewProps = {
  contactName: 'John Smith',
  companyName: 'ABC Printing Ltd',
  products: [
    { sku: '317-SS', imageUrl: 'https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/products/317-SS.jpeg' },
    { sku: '317-SS-BLACK', imageUrl: 'https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/products/317-SS-BLACK.jpg' },
    { sku: '317-SS-BLUE', imageUrl: 'https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/products/317-SS-BLUE.jpg' },
    { sku: '317-SS-ORANGE', imageUrl: 'https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/products/317-SS-ORANGE.jpg' },
  ],
  portalUrl: 'https://www.technifold.com/customer/access?token=example123',
  unsubscribeUrl: 'https://www.technifold.com/unsubscribe?token=example',
} as ConsumableReminderEmailProps;

export default ConsumableReminderEmail;

// Styles
const content = {
  padding: `${spacing.xl} ${spacing.lg}`,
};

const greeting = {
  fontSize: '16px',
  color: colors.text,
  margin: `0 0 ${spacing.md} 0`,
  fontFamily: fonts.body,
};

const bodyText = {
  fontSize: '16px',
  lineHeight: '24px',
  color: colors.text,
  margin: `0 0 ${spacing.lg} 0`,
  fontFamily: fonts.body,
};

const sectionHeading = {
  fontSize: '18px',
  fontWeight: '600',
  color: colors.text,
  margin: `${spacing.lg} 0 ${spacing.md} 0`,
  fontFamily: fonts.heading,
};

const benefitsBox = {
  backgroundColor: '#eff6ff',
  borderLeft: `4px solid ${colors.accent}`,
  padding: spacing.lg,
  margin: `${spacing.lg} 0`,
  borderRadius: '4px',
};

const benefitsTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: colors.primary,
  margin: `0 0 ${spacing.md} 0`,
  fontFamily: fonts.body,
};

const benefitsList = {
  width: '100%',
};

const benefitItem = {
  fontSize: '14px',
  color: colors.primary,
  padding: `${spacing.xs} 0`,
  fontFamily: fonts.body,
};

const closingText = {
  fontSize: '14px',
  color: colors.textMuted,
  textAlign: 'center' as const,
  margin: `${spacing.lg} 0 0 0`,
  fontFamily: fonts.body,
};
