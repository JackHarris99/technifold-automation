/**
 * Email Rendering Utilities
 * Convert React Email components to HTML and plain text
 */

import { render } from '@react-email/components';
import * as React from 'react';

/**
 * Render a React Email component to HTML and plain text
 */
export async function renderEmail(component: React.ReactElement) {
  const html = await render(component);
  const text = await render(component, { plainText: true });

  return { html, text };
}

/**
 * Type-safe email renderer with props validation
 */
export function createEmailRenderer<T>(
  Component: React.ComponentType<T>
) {
  return async (props: T) => {
    return await renderEmail(React.createElement(Component, props));
  };
}
