/**
 * Email Button Component
 * Bulletproof button with fallback link
 */

import * as React from 'react';
import { Button, Link, Section, Text } from '@react-email/components';
import { colors, fonts, spacing, borderRadius } from '../styles/theme';

interface EmailButtonProps {
  href: string;
  children: string;
}

export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Section style={buttonSection}>
      <Button href={href} style={button}>
        {children}
      </Button>
      <Text style={fallbackText}>
        or visit: <Link href={href} style={fallbackLink}>{href}</Link>
      </Text>
    </Section>
  );
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: `${spacing.lg} 0`,
};

const button = {
  backgroundColor: colors.success,
  borderRadius: borderRadius.md,
  color: colors.white,
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  fontFamily: fonts.body,
};

const fallbackText = {
  marginTop: spacing.sm,
  fontSize: '12px',
  color: colors.textMuted,
  fontFamily: fonts.body,
};

const fallbackLink = {
  color: colors.accent,
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
};
