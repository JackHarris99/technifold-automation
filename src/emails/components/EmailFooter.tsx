/**
 * Email Footer Component
 * Company contact information and unsubscribe link
 */

import * as React from 'react';
import { Section, Text, Link, Hr } from '@react-email/components';
import { colors, fonts, spacing } from '../styles/theme';

interface EmailFooterProps {
  unsubscribeUrl?: string;
}

export function EmailFooter({ unsubscribeUrl }: EmailFooterProps) {
  return (
    <>
      <Hr style={divider} />
      <Section style={footer}>
        <Text style={footerText}>
          Questions? Contact our team:
          <br />
          Email: <Link href="mailto:info@technifold.co.uk" style={link}>info@technifold.co.uk</Link>
          <br />
          Phone: +44 (0)1455 554491
        </Text>
        <Text style={companyInfo}>
          Technifold Ltd
          <br />
          Unit 2D Tungsten Park
          <br />
          Lutterworth, Leicestershire, LE17 4JA, UK
          <br />
          <Link href="https://technifold.co.uk" style={link}>technifold.co.uk</Link>
        </Text>
        {unsubscribeUrl && (
          <Text style={unsubscribe}>
            <Link href={unsubscribeUrl} style={unsubscribeLink}>
              Unsubscribe from marketing emails
            </Link>
          </Text>
        )}
      </Section>
    </>
  );
}

const divider = {
  borderColor: colors.border,
  margin: `${spacing.lg} 0`,
};

const footer = {
  padding: `${spacing.lg} ${spacing.lg} ${spacing.xl}`,
  textAlign: 'center' as const,
};

const footerText = {
  color: colors.textMuted,
  fontSize: '14px',
  lineHeight: '20px',
  margin: `0 0 ${spacing.md} 0`,
  fontFamily: fonts.body,
};

const companyInfo = {
  color: colors.textMuted,
  fontSize: '12px',
  lineHeight: '18px',
  margin: 0,
  fontFamily: fonts.body,
};

const link = {
  color: colors.accent,
  textDecoration: 'none',
};

const unsubscribe = {
  marginTop: spacing.lg,
  fontSize: '11px',
  color: colors.textMuted,
};

const unsubscribeLink = {
  color: colors.textMuted,
  textDecoration: 'underline',
};
