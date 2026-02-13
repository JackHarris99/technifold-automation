/**
 * Email Header Component
 * Technifold logo and email title
 */

import * as React from 'react';
import { Section, Img, Heading, Text } from '@react-email/components';
import { colors, fonts, spacing } from '../styles/theme';

interface EmailHeaderProps {
  title: string;
  subtitle?: string;
}

export function EmailHeader({ title, subtitle }: EmailHeaderProps) {
  return (
    <Section style={header}>
      <Img
        src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/technifold.png"
        alt="Technifold"
        width="140"
        height="auto"
        style={logo}
      />
      <Heading style={heading}>{title}</Heading>
      {subtitle && <Text style={subtitleText}>{subtitle}</Text>}
    </Section>
  );
}

const header = {
  padding: `${spacing.xl} ${spacing.lg}`,
  textAlign: 'center' as const,
  borderBottom: `1px solid ${colors.border}`,
};

const logo = {
  margin: '0 auto 20px',
  display: 'block',
};

const heading = {
  color: colors.text,
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 8px 0',
  fontFamily: fonts.heading,
};

const subtitleText = {
  color: colors.textMuted,
  fontSize: '16px',
  margin: 0,
  fontFamily: fonts.body,
};
