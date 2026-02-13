/**
 * Email Rendering Utilities
 * Convert React Email components to HTML and plain text
 */

import { render } from '@react-email/components';
import * as React from 'react';

/**
 * Render a React Email component to HTML and plain text
 */
export function renderEmail(component: React.ReactElement) {
  const html = render(component);
  const text = render(component, { plainText: true });

  return { html, text };
}

/**
 * Type-safe email renderer with props validation
 */
export function createEmailRenderer<T>(
  Component: React.ComponentType<T>
) {
  return (props: T) => {
    return renderEmail(React.createElement(Component, props));
  };
}
