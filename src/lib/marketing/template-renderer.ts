/**
 * Email Template Renderer
 * Fills placeholders in email templates based on contact tags and data
 */

interface Contact {
  contact_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  job_title: string | null;
  company_id: string;
}

interface Company {
  company_id: string;
  company_name: string;
  country: string | null;
  industry: string | null;
}

interface ContactTag {
  tag_id: string;
  category: string; // 'machine_manufacturer', 'machine_model', 'problem', 'product_interest', etc.
  value: string;
  confidence: number;
  source: string;
}

interface RenderContext {
  contact: Contact;
  company: Company;
  tags: ContactTag[];
  customData?: Record<string, any>;
}

interface RenderedTemplate {
  subject: string;
  body: string;
  preview_text: string | null;
  placeholders_filled: string[];
  missing_placeholders: string[];
}

/**
 * Extract all placeholders from a template string
 * Placeholders format: {placeholder_name}
 */
function extractPlaceholders(template: string): string[] {
  const regex = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
  const placeholders: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    placeholders.push(match[1]);
  }

  return [...new Set(placeholders)]; // Remove duplicates
}

/**
 * Get tag value by category
 */
function getTagValue(tags: ContactTag[], category: string): string | null {
  // Sort by confidence (highest first) and get the first match
  const matchingTags = tags
    .filter((tag) => tag.category === category)
    .sort((a, b) => b.confidence - a.confidence);

  return matchingTags.length > 0 ? matchingTags[0].value : null;
}

/**
 * Build placeholder data from context
 */
function buildPlaceholderData(context: RenderContext): Record<string, string> {
  const { contact, company, tags, customData = {} } = context;

  // Base contact data
  const data: Record<string, string> = {
    first_name: contact.first_name || 'there',
    last_name: contact.last_name || '',
    full_name: [contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'there',
    email: contact.email,
    job_title: contact.job_title || '',

    // Company data
    company_name: company.company_name,
    company_country: company.country || '',
    company_industry: company.industry || '',

    // Tags (most common categories)
    manufacturer: getTagValue(tags, 'machine_manufacturer') || '',
    machine_manufacturer: getTagValue(tags, 'machine_manufacturer') || '',
    model: getTagValue(tags, 'machine_model') || '',
    machine_model: getTagValue(tags, 'machine_model') || '',
    machine_type: getTagValue(tags, 'machine_type') || '',
    problem: getTagValue(tags, 'problem') || '',
    product_interest: getTagValue(tags, 'product_interest') || '',
    industry: getTagValue(tags, 'industry') || company.industry || '',

    // Formatted manufacturer name (with proper capitalization)
    manufacturer_display: formatManufacturerName(getTagValue(tags, 'machine_manufacturer') || ''),
    model_display: formatModelName(getTagValue(tags, 'machine_model') || ''),
  };

  // Merge custom data (overrides defaults)
  return { ...data, ...customData };
}

/**
 * Format manufacturer name for display
 * e.g., 'muller_martini' -> 'Müller Martini'
 */
function formatManufacturerName(slug: string): string {
  if (!slug) return '';

  const displayNames: Record<string, string> = {
    'muller_martini': 'Müller Martini',
    'heidelberg': 'Heidelberg',
    'kolbus': 'Kolbus',
    'mbo': 'MBO',
    'stahl': 'Stahl',
    'horizon': 'Horizon',
    'wohlenberg': 'Wohlenberg',
    'polar': 'Polar',
    'perfecta': 'Perfecta',
  };

  return displayNames[slug] || slug.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

/**
 * Format model name for display
 * e.g., 'bolero' -> 'Bolero'
 */
function formatModelName(slug: string): string {
  if (!slug) return '';

  const displayNames: Record<string, string> = {
    'bolero': 'Bolero',
    'stahlfolder': 'Stahlfolder',
    'ti52': 'Ti52',
    'norma': 'Norma',
    'presto': 'Presto',
  };

  return displayNames[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
}

/**
 * Replace placeholders in a template string
 */
function replacePlaceholders(
  template: string,
  data: Record<string, string>
): { result: string; filled: string[]; missing: string[] } {
  const placeholders = extractPlaceholders(template);
  const filled: string[] = [];
  const missing: string[] = [];

  let result = template;

  for (const placeholder of placeholders) {
    const value = data[placeholder];

    if (value !== undefined && value !== null && value !== '') {
      // Replace all occurrences of this placeholder
      const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
      result = result.replace(regex, value);
      filled.push(placeholder);
    } else {
      missing.push(placeholder);
      // Leave placeholder in place if no value available
      // OR optionally replace with empty string:
      // const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
      // result = result.replace(regex, '');
    }
  }

  return { result, filled, missing };
}

/**
 * Render an email template with contact data
 *
 * @param template - Template with subject, body, preview_text
 * @param context - Contact, company, tags data
 * @returns Rendered template with placeholders filled
 */
export function renderEmailTemplate(
  template: {
    subject: string;
    body: string;
    preview_text: string | null;
  },
  context: RenderContext
): RenderedTemplate {
  const data = buildPlaceholderData(context);

  // Render subject
  const subjectResult = replacePlaceholders(template.subject, data);

  // Render body
  const bodyResult = replacePlaceholders(template.body, data);

  // Render preview text
  const previewResult = template.preview_text
    ? replacePlaceholders(template.preview_text, data)
    : { result: null, filled: [], missing: [] };

  // Combine all filled/missing placeholders
  const allFilled = [
    ...new Set([...subjectResult.filled, ...bodyResult.filled, ...previewResult.filled]),
  ];
  const allMissing = [
    ...new Set([...subjectResult.missing, ...bodyResult.missing, ...previewResult.missing]),
  ];

  return {
    subject: subjectResult.result,
    body: bodyResult.result,
    preview_text: previewResult.result,
    placeholders_filled: allFilled,
    missing_placeholders: allMissing,
  };
}

/**
 * Preview a template with sample data (for testing in UI)
 */
export function previewTemplate(
  template: {
    subject: string;
    body: string;
    preview_text: string | null;
  },
  sampleData?: Partial<Record<string, string>>
): RenderedTemplate {
  // Default sample data
  const defaultSample: Record<string, string> = {
    first_name: 'John',
    last_name: 'Smith',
    full_name: 'John Smith',
    email: 'john.smith@example.com',
    job_title: 'Production Manager',
    company_name: 'Example Printing Ltd',
    company_country: 'United Kingdom',
    manufacturer: 'muller_martini',
    manufacturer_display: 'Müller Martini',
    model: 'bolero',
    model_display: 'Bolero',
    machine_type: 'folder',
    problem: 'cracking',
    product_interest: 'enduracrease',
  };

  const data = { ...defaultSample, ...sampleData };

  const subjectResult = replacePlaceholders(template.subject, data);
  const bodyResult = replacePlaceholders(template.body, data);
  const previewResult = template.preview_text
    ? replacePlaceholders(template.preview_text, data)
    : { result: null, filled: [], missing: [] };

  const allFilled = [
    ...new Set([...subjectResult.filled, ...bodyResult.filled, ...previewResult.filled]),
  ];
  const allMissing = [
    ...new Set([...subjectResult.missing, ...bodyResult.missing, ...previewResult.missing]),
  ];

  return {
    subject: subjectResult.result,
    body: bodyResult.result,
    preview_text: previewResult.result,
    placeholders_filled: allFilled,
    missing_placeholders: allMissing,
  };
}

/**
 * Get available placeholders with descriptions
 */
export function getAvailablePlaceholders(): Array<{ name: string; description: string; category: string }> {
  return [
    // Contact placeholders
    { name: 'first_name', description: "Contact's first name", category: 'Contact' },
    { name: 'last_name', description: "Contact's last name", category: 'Contact' },
    { name: 'full_name', description: "Contact's full name", category: 'Contact' },
    { name: 'email', description: "Contact's email address", category: 'Contact' },
    { name: 'job_title', description: "Contact's job title", category: 'Contact' },

    // Company placeholders
    { name: 'company_name', description: 'Company name', category: 'Company' },
    { name: 'company_country', description: 'Company country', category: 'Company' },
    { name: 'company_industry', description: 'Company industry', category: 'Company' },

    // Machine/equipment placeholders
    { name: 'manufacturer', description: 'Machine manufacturer (slug)', category: 'Equipment' },
    { name: 'manufacturer_display', description: 'Machine manufacturer (formatted)', category: 'Equipment' },
    { name: 'model', description: 'Machine model (slug)', category: 'Equipment' },
    { name: 'model_display', description: 'Machine model (formatted)', category: 'Equipment' },
    { name: 'machine_type', description: 'Type of machine (folder, stitcher, etc.)', category: 'Equipment' },

    // Problem/interest placeholders
    { name: 'problem', description: 'Problem they are experiencing', category: 'Interest' },
    { name: 'product_interest', description: 'Product they showed interest in', category: 'Interest' },
    { name: 'industry', description: 'Industry vertical', category: 'Interest' },
  ];
}
