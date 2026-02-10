/**
 * Auto-Tagger
 * Automatically tags contacts based on their click actions
 */

import { getSupabaseClient } from '@/lib/supabase';

export interface TagRule {
  category: string;
  value: string;
  confidence: number;
  source: string;
}

interface ClickAction {
  action: string; // e.g., 'select_manufacturer', 'view_product', 'download_case_study'
  value: string;  // e.g., 'muller_martini', 'bolero_enduracrease'
  metadata?: Record<string, any>;
}

/**
 * Generate tags from a click action
 * Returns array of tags to apply to the contact
 */
export function generateTagsFromClick(clickAction: ClickAction): TagRule[] {
  const { action, value, metadata = {} } = clickAction;
  const tags: TagRule[] = [];

  switch (action) {
    // Manufacturer selection
    case 'select_manufacturer':
    case 'view_manufacturer':
      tags.push({
        category: 'machine_manufacturer',
        value: value.toLowerCase(),
        confidence: 1.0, // Direct selection = 100% confidence
        source: 'click',
      });
      break;

    // Model selection
    case 'select_model':
    case 'view_model':
      tags.push({
        category: 'machine_model',
        value: value.toLowerCase(),
        confidence: 1.0,
        source: 'click',
      });
      // If metadata includes manufacturer, tag that too
      if (metadata.manufacturer) {
        tags.push({
          category: 'machine_manufacturer',
          value: metadata.manufacturer.toLowerCase(),
          confidence: 0.9, // Inferred from model
          source: 'click',
        });
      }
      break;

    // Problem/solution interest
    case 'view_solution':
    case 'select_problem':
      tags.push({
        category: 'problem',
        value: value.toLowerCase(),
        confidence: 1.0,
        source: 'click',
      });
      break;

    // Product interest
    case 'view_product':
      // Handle compound values like "bolero_enduracrease"
      // Split into model + product if contains underscore
      if (value.includes('_')) {
        const [model, product] = value.split('_');
        tags.push({
          category: 'machine_model',
          value: model.toLowerCase(),
          confidence: 0.8, // Inferred from product view
          source: 'click',
        });
        tags.push({
          category: 'product_interest',
          value: product.toLowerCase(),
          confidence: 1.0,
          source: 'click',
        });
      } else {
        tags.push({
          category: 'product_interest',
          value: value.toLowerCase(),
          confidence: 1.0,
          source: 'click',
        });
      }
      break;

    // Case study / content downloads
    case 'download_case_study':
      tags.push({
        category: 'content_interest',
        value: value.toLowerCase(),
        confidence: 1.0,
        source: 'click',
      });
      // If case study is about a specific manufacturer/model, tag those
      if (metadata.manufacturer) {
        tags.push({
          category: 'machine_manufacturer',
          value: metadata.manufacturer.toLowerCase(),
          confidence: 0.7,
          source: 'click',
        });
      }
      if (metadata.model) {
        tags.push({
          category: 'machine_model',
          value: metadata.model.toLowerCase(),
          confidence: 0.7,
          source: 'click',
        });
      }
      break;

    // Machine type interest
    case 'view_machine_type':
      tags.push({
        category: 'machine_type',
        value: value.toLowerCase(),
        confidence: 0.9,
        source: 'click',
      });
      break;

    // Industry vertical
    case 'select_industry':
      tags.push({
        category: 'industry',
        value: value.toLowerCase(),
        confidence: 1.0,
        source: 'click',
      });
      break;

    // CTA clicks (lower confidence, shows general interest)
    case 'request_quote':
      tags.push({
        category: 'intent',
        value: 'request_quote',
        confidence: 1.0,
        source: 'click',
      });
      break;

    case 'book_consultation':
      tags.push({
        category: 'intent',
        value: 'consultation',
        confidence: 1.0,
        source: 'click',
      });
      break;

    case 'view_pricing':
      tags.push({
        category: 'intent',
        value: 'pricing_interest',
        confidence: 0.8,
        source: 'click',
      });
      break;

    // Default: tag the raw action
    default:
      tags.push({
        category: 'action',
        value: action.toLowerCase(),
        confidence: 0.5,
        source: 'click',
      });
      break;
  }

  return tags;
}

/**
 * Apply tags to a contact
 * Handles upserts (updates confidence if tag already exists)
 */
export async function applyTagsToContact(
  contactId: string,
  tags: TagRule[],
  metadata?: {
    campaign_id?: string;
    template_id?: string;
    click_url?: string;
  }
): Promise<{ success: boolean; tags_applied: number; error?: string }> {
  try {
    const supabase = getSupabaseClient();

    // For each tag, upsert into contact_tags
    const results = await Promise.all(
      tags.map(async (tag) => {
        // Check if tag already exists
        const { data: existingTag } = await supabase
          .from('contact_tags')
          .select('tag_id, confidence')
          .eq('contact_id', contactId)
          .eq('category', tag.category)
          .eq('value', tag.value)
          .maybeSingle();

        if (existingTag) {
          // Tag exists - update confidence if new confidence is higher
          if (tag.confidence > existingTag.confidence) {
            const { error } = await supabase
              .from('contact_tags')
              .update({
                confidence: tag.confidence,
                source: tag.source,
                updated_at: new Date().toISOString(),
              })
              .eq('tag_id', existingTag.tag_id);

            return { success: !error, updated: true };
          }
          return { success: true, updated: false }; // Tag exists with higher confidence, skip
        } else {
          // Create new tag
          const { error } = await supabase.from('contact_tags').insert({
            contact_id: contactId,
            category: tag.category,
            value: tag.value,
            confidence: tag.confidence,
            source: tag.source,
          });

          return { success: !error, created: true };
        }
      })
    );

    // Count successful operations
    const tagsApplied = results.filter((r) => r.success).length;

    // Log engagement event
    try {
      await supabase.from('engagement_events').insert({
        contact_id: contactId,
        occurred_at: new Date().toISOString(),
        event_type: 'auto_tag_applied',
        event_name: 'Contact auto-tagged from click',
        source: 'email_click',
        meta: {
          tags_applied: tagsApplied,
          tags: tags.map((t) => `${t.category}:${t.value}`),
          campaign_id: metadata?.campaign_id,
          template_id: metadata?.template_id,
          click_url: metadata?.click_url,
        },
      });
    } catch (eventError) {
      console.error('[Auto-Tagger] Failed to log event:', eventError);
      // Don't fail if event logging fails
    }

    return {
      success: true,
      tags_applied: tagsApplied,
    };
  } catch (error) {
    console.error('[Auto-Tagger] Error applying tags:', error);
    return {
      success: false,
      tags_applied: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Parse click action from URL parameters
 * e.g., "?action=select_manufacturer&value=muller_martini"
 */
export function parseClickAction(searchParams: URLSearchParams): ClickAction | null {
  const action = searchParams.get('action');
  const value = searchParams.get('value');

  if (!action || !value) {
    return null;
  }

  // Parse additional metadata
  const metadata: Record<string, any> = {};
  for (const [key, val] of searchParams.entries()) {
    if (key !== 'action' && key !== 'value' && key !== 'token') {
      metadata[key] = val;
    }
  }

  return {
    action,
    value,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  };
}

/**
 * Get recommended actions for a template
 * Returns suggested action types based on template targeting
 */
export function getRecommendedActions(template: {
  target_manufacturer?: string | null;
  target_model?: string | null;
  target_problem?: string | null;
  target_machine_type?: string | null;
  category?: string | null;
}): Array<{ action: string; description: string }> {
  const actions: Array<{ action: string; description: string }> = [];

  // Always include generic CTAs
  actions.push(
    { action: 'request_quote', description: 'Request a quote' },
    { action: 'book_consultation', description: 'Book a consultation' }
  );

  // Add specific actions based on template targeting
  if (template.target_manufacturer) {
    actions.push({
      action: 'select_manufacturer',
      description: `View ${template.target_manufacturer} solutions`,
    });
  }

  if (template.target_model) {
    actions.push({
      action: 'select_model',
      description: `Learn about ${template.target_model}`,
    });
  }

  if (template.target_problem) {
    actions.push({
      action: 'view_solution',
      description: `See solution for ${template.target_problem}`,
    });
  }

  if (template.target_machine_type) {
    actions.push({
      action: 'view_machine_type',
      description: `Browse ${template.target_machine_type} products`,
    });
  }

  // Category-specific actions
  if (template.category === 'case_study') {
    actions.push({
      action: 'download_case_study',
      description: 'Download case study',
    });
  }

  if (template.category === 'product_intro') {
    actions.push({
      action: 'view_product',
      description: 'View product details',
    });
  }

  return actions;
}
