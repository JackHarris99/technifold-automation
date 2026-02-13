/**
 * Email Layout Wrapper
 * Provides consistent structure and responsive table layout for all emails
 */

import * as React from 'react';
import { Html, Head, Body, Container, Preview } from '@react-email/components';
import { colors, fonts } from '../styles/theme';

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          {children}
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: colors.background,
  fontFamily: fonts.body,
  margin: 0,
  padding: 0,
};

const container = {
  backgroundColor: colors.white,
  margin: '0 auto',
  maxWidth: '600px',
  width: '100%',
};
