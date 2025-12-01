-- Create machine page templates table
-- Stores copy templates for machine marketing pages

CREATE TABLE IF NOT EXISTS machine_page_templates (
  template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT UNIQUE NOT NULL,
  machine_type TEXT NOT NULL,
  job_type TEXT,
  active BOOLEAN DEFAULT true,

  -- Copy sections stored as JSONB for flexibility
  copy_sections JSONB NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX idx_machine_page_templates_type ON machine_page_templates(machine_type);
CREATE INDEX idx_machine_page_templates_active ON machine_page_templates(active);

-- Insert starter templates

-- 1. Folding Machines (Cover Work)
INSERT INTO machine_page_templates (template_key, machine_type, job_type, copy_sections) VALUES (
  'folding-machines-cover-work',
  'folding-machines',
  'cover-work',
  '{
    "hero_headline": "Eliminate Fiber Cracking On Your {brand} {model}",
    "hero_subheading": "Transform finishing quality on your {machine_type}. From £99/month.",
    "problem_section_title": "The Problems You Face Every Day",
    "problems": [
      {
        "icon": "💔",
        "title": "Fiber Cracking",
        "description": "Digital stock cracks at the fold, ruining perfect print jobs and costing you reprints."
      },
      {
        "icon": "⏱️",
        "title": "Slow Throughput",
        "description": "Manual guillotine finishing creates bottlenecks and limits your daily output."
      },
      {
        "icon": "❌",
        "title": "Quality Issues",
        "description": "Inconsistent folds, poor perforations, and alignment issues frustrate customers."
      }
    ],
    "solution_section_title": "How We Solve This For Your {brand} {model}",
    "solution_subheading": "Full inline finishing capability. One monthly subscription. Zero capital outlay.",
    "solution_features": [
      {
        "title": "Inline Creasing",
        "description": "Perfect creases on every fold, eliminating fiber cracking completely"
      },
      {
        "title": "Micro-Perforation",
        "description": "Clean, precise perforations for tear-off sections and reply cards"
      },
      {
        "title": "Edge Trimming",
        "description": "Accurate inline cutting for finished edges and special shapes"
      },
      {
        "title": "Consumables Included",
        "description": "Creasing ribs, perforation blades, and cutting bosses delivered automatically"
      }
    ],
    "value_props": [
      {
        "icon": "💰",
        "title": "Save £500-£2,000/month",
        "description": "Reduce rejects, eliminate rework, faster throughput"
      },
      {
        "icon": "⚡",
        "title": "Run 30-50% faster",
        "description": "Inline finishing eliminates guillotine bottlenecks"
      },
      {
        "icon": "✨",
        "title": "Perfect finish quality",
        "description": "No fiber cracking, clean perforations, accurate cutting"
      }
    ],
    "cta_primary": "Request Free Trial",
    "cta_secondary": "See How It Works",
    "pricing_title": "Simple, Transparent Pricing",
    "pricing_subheading": "No hidden fees. No long contracts. Cancel anytime."
  }'
);

-- 2. Perfect Binders
INSERT INTO machine_page_templates (template_key, machine_type, job_type, copy_sections) VALUES (
  'perfect-binders-standard',
  'perfect-binders',
  'standard',
  '{
    "hero_headline": "Professional Cover Creasing For Your {brand} {model}",
    "hero_subheading": "Eliminate cover cracking and feed jams on your {machine_type}. From £89/month.",
    "problem_section_title": "The Problems You Face Every Day",
    "problems": [
      {
        "icon": "📘",
        "title": "Cover Cracking",
        "description": "Covers crack at spine and hinge, especially on heavier stocks."
      },
      {
        "icon": "⏱️",
        "title": "Manual Pre-Processing",
        "description": "Covers need manual preparation before binding - time-consuming bottleneck."
      },
      {
        "icon": "❌",
        "title": "Feed Reliability",
        "description": "Uncreased covers cause jams and slow down your production."
      }
    ],
    "solution_section_title": "How We Solve This For Your {brand} {model}",
    "solution_subheading": "Automated cover creasing. Reliable feeding. Professional results.",
    "solution_features": [
      {
        "title": "Spine Creasing",
        "description": "Perfect spine creases eliminate cracking on heavy cover stocks"
      },
      {
        "title": "Hinge Creasing",
        "description": "Optional hinge creasing for lay-flat covers and premium finishes"
      },
      {
        "title": "Reliable Feeding",
        "description": "Pre-creased covers feed consistently, reducing jams and downtime"
      },
      {
        "title": "Consumables Included",
        "description": "Creasing wheels and maintenance parts delivered automatically"
      }
    ],
    "value_props": [
      {
        "icon": "💰",
        "title": "Save £300-£1,500/month",
        "description": "Eliminate manual pre-creasing labor and reduce waste"
      },
      {
        "icon": "⚡",
        "title": "Run 20-40% faster",
        "description": "No manual preparation bottleneck"
      },
      {
        "icon": "✨",
        "title": "Professional finish quality",
        "description": "No spine cracks, perfect hinge lines, premium appearance"
      }
    ],
    "cta_primary": "Request Free Trial",
    "cta_secondary": "See How It Works",
    "pricing_title": "Simple, Transparent Pricing",
    "pricing_subheading": "No hidden fees. No long contracts. Cancel anytime."
  }'
);

-- 3. Saddle Stitchers
INSERT INTO machine_page_templates (template_key, machine_type, job_type, copy_sections) VALUES (
  'saddle-stitchers-standard',
  'saddle-stitchers',
  'standard',
  '{
    "hero_headline": "Perfect Spine Creasing For Your {brand} {model}",
    "hero_subheading": "Eliminate cover feed issues on your {machine_type}. From £69/month.",
    "problem_section_title": "The Problems You Face Every Day",
    "problems": [
      {
        "icon": "📖",
        "title": "Poor Spine Quality",
        "description": "Covers crack on the spine, making booklets look unprofessional."
      },
      {
        "icon": "⏱️",
        "title": "Manual Pre-Creasing",
        "description": "Operators manually crease covers before stitching - slow and inconsistent."
      },
      {
        "icon": "❌",
        "title": "Cover Feed Issues",
        "description": "Heavy stock causes jams and misfeeds without proper creasing."
      }
    ],
    "solution_section_title": "How We Solve This For Your {brand} {model}",
    "solution_subheading": "Automated inline creasing. Reliable feeding. Professional booklets.",
    "solution_features": [
      {
        "title": "Inline Spine Creasing",
        "description": "Perfect spine creases on every cover before stitching"
      },
      {
        "title": "Consistent Feeding",
        "description": "Pre-creased covers feed reliably, eliminating jams"
      },
      {
        "title": "Heavy Stock Handling",
        "description": "Run 300gsm+ covers without feed issues"
      },
      {
        "title": "Consumables Included",
        "description": "Creasing wheels and maintenance parts delivered automatically"
      }
    ],
    "value_props": [
      {
        "icon": "💰",
        "title": "Save £200-£1,000/month",
        "description": "Eliminate manual pre-creasing labor and reduce jams"
      },
      {
        "icon": "⚡",
        "title": "Run 25-45% faster",
        "description": "No manual preparation, no feed interruptions"
      },
      {
        "icon": "✨",
        "title": "Professional booklet quality",
        "description": "No spine cracks, consistent appearance, happy customers"
      }
    ],
    "cta_primary": "Request Free Trial",
    "cta_secondary": "See How It Works",
    "pricing_title": "Simple, Transparent Pricing",
    "pricing_subheading": "No hidden fees. No long contracts. Cancel anytime."
  }'
);

COMMENT ON TABLE machine_page_templates IS 'Marketing copy templates for machine-specific landing pages';
COMMENT ON COLUMN machine_page_templates.template_key IS 'Unique identifier for this template';
COMMENT ON COLUMN machine_page_templates.machine_type IS 'Machine type this template applies to (folding-machines, perfect-binders, saddle-stitchers)';
COMMENT ON COLUMN machine_page_templates.job_type IS 'Job type focus (cover-work, section-work, etc.) - allows multiple templates per machine type';
COMMENT ON COLUMN machine_page_templates.copy_sections IS 'JSONB containing all copy sections with {placeholder} variables for personalization';
