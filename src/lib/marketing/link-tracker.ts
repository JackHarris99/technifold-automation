/**
 * Link Tracker
 * Injects tracking tokens into email links for click tracking
 */

import { generateToken } from '@/lib/tokens';

interface TrackingContext {
  contact_id: string;
  company_id: string;
  campaign_id?: string;
  template_id?: string;
}

interface LinkAction {
  href: string;
  action?: string;
  value?: string;
  metadata?: Record<string, string>;
}

/**
 * Generate a tracking URL for a link
 *
 * @param targetUrl - The destination URL
 * @param context - Contact/campaign context
 * @param action - Optional action for auto-tagging
 * @param value - Optional value for auto-tagging
 * @returns Tracking URL that goes through /api/track/click
 */
export function generateTrackingUrl(
  targetUrl: string,
  context: TrackingContext,
  action?: string,
  value?: string,
  metadata?: Record<string, string>
): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://technifold.com';

  // Generate token with contact/campaign context
  const token = generateToken(
    {
      company_id: context.company_id,
      contact_id: context.contact_id,
      ...(context.campaign_id && { campaign_id: context.campaign_id }),
      ...(context.template_id && { template_id: context.template_id }),
    } as any,
    720 // 30 days TTL for click tracking links
  );

  // Build tracking URL
  const trackingUrl = new URL(`${baseUrl}/api/track/click`);
  trackingUrl.searchParams.set('token', token);
  trackingUrl.searchParams.set('target', targetUrl);

  // Add action/value for auto-tagging
  if (action) {
    trackingUrl.searchParams.set('action', action);
  }
  if (value) {
    trackingUrl.searchParams.set('value', value);
  }

  // Add metadata
  if (metadata) {
    for (const [key, val] of Object.entries(metadata)) {
      trackingUrl.searchParams.set(key, val);
    }
  }

  return trackingUrl.toString();
}

/**
 * Inject tracking into all links in HTML email body
 *
 * @param htmlBody - HTML email body
 * @param context - Contact/campaign context
 * @param linkActions - Optional mapping of href → action/value for specific links
 * @returns HTML body with tracking links injected
 */
export function injectTrackingLinks(
  htmlBody: string,
  context: TrackingContext,
  linkActions?: Record<string, { action?: string; value?: string; metadata?: Record<string, string> }>
): string {
  // Regex to find <a href="..."> tags
  const linkRegex = /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi;

  return htmlBody.replace(linkRegex, (match, before, href, after) => {
    // Skip if href is a mailto: or tel: link
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
      return match;
    }

    // Skip if href is the unsubscribe link (already has token)
    if (href.includes('/u/') || href.includes('unsubscribe')) {
      return match;
    }

    // Check if this link has specific action/value defined
    const linkAction = linkActions?.[href];

    // Generate tracking URL
    const trackingUrl = generateTrackingUrl(
      href,
      context,
      linkAction?.action,
      linkAction?.value,
      linkAction?.metadata
    );

    // Replace href with tracking URL
    return `<a ${before}href="${trackingUrl}"${after}>`;
  });
}

/**
 * Build a smart tracking link for a CTA button
 * Automatically infers action from the href
 *
 * @param href - Target URL
 * @param context - Contact/campaign context
 * @returns Tracking URL with auto-detected action
 */
export function buildSmartTrackingLink(
  href: string,
  context: TrackingContext
): string {
  let action: string | undefined;
  let value: string | undefined;

  // Detect action from URL patterns
  if (href.includes('/quote') || href.includes('request-quote')) {
    action = 'request_quote';
    value = 'quote_request';
  } else if (href.includes('/contact') || href.includes('book-consultation')) {
    action = 'book_consultation';
    value = 'consultation';
  } else if (href.includes('/pricing')) {
    action = 'view_pricing';
    value = 'pricing_page';
  } else if (href.includes('/case-study') || href.includes('/case-studies')) {
    action = 'download_case_study';
    // Extract case study slug from URL
    const match = href.match(/case-stud(?:y|ies)\/([^/?]+)/);
    value = match ? match[1] : 'case_study';
  } else if (href.includes('/product')) {
    action = 'view_product';
    // Extract product slug from URL
    const match = href.match(/product\/([^/?]+)/);
    value = match ? match[1] : 'product';
  }

  return generateTrackingUrl(href, context, action, value);
}

/**
 * Parse tracking link to extract action/value
 * Useful for testing or debugging
 *
 * @param trackingUrl - Full tracking URL
 * @returns Parsed components
 */
export function parseTrackingLink(trackingUrl: string): {
  target: string | null;
  action: string | null;
  value: string | null;
  token: string | null;
} {
  try {
    const url = new URL(trackingUrl);
    return {
      target: url.searchParams.get('target'),
      action: url.searchParams.get('action'),
      value: url.searchParams.get('value'),
      token: url.searchParams.get('token'),
    };
  } catch {
    return {
      target: null,
      action: null,
      value: null,
      token: null,
    };
  }
}

/**
 * Build manufacturer picker links for landing pages
 *
 * @param manufacturers - Array of manufacturer slugs
 * @param context - Contact/campaign context
 * @param targetPage - Landing page URL
 * @returns Array of tracking links with auto-tagging
 */
export function buildManufacturerPickerLinks(
  manufacturers: string[],
  context: TrackingContext,
  targetPage: string
): Array<{ manufacturer: string; url: string }> {
  return manufacturers.map((manufacturer) => ({
    manufacturer,
    url: generateTrackingUrl(
      targetPage,
      context,
      'select_manufacturer',
      manufacturer,
      { manufacturer }
    ),
  }));
}

/**
 * Build model picker links for landing pages
 *
 * @param models - Array of {slug, manufacturer} objects
 * @param context - Contact/campaign context
 * @param targetPage - Landing page URL
 * @returns Array of tracking links with auto-tagging
 */
export function buildModelPickerLinks(
  models: Array<{ slug: string; manufacturer: string }>,
  context: TrackingContext,
  targetPage: string
): Array<{ model: string; url: string }> {
  return models.map((model) => ({
    model: model.slug,
    url: generateTrackingUrl(
      targetPage,
      context,
      'select_model',
      model.slug,
      { manufacturer: model.manufacturer, model: model.slug }
    ),
  }));
}
