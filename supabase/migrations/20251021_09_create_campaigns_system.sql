-- Progressive Campaign System
-- Enables marketing campaigns with machine-specific targeting and progressive learning

-- ============================================================================
-- MACHINE TAXONOMY
-- Flexible hierarchy for machines (can be expanded as we learn more)
-- ============================================================================

CREATE TABLE IF NOT EXISTS machine_taxonomy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES machine_taxonomy(id) ON DELETE CASCADE,
  level INT NOT NULL CHECK (level BETWEEN 1 AND 4),
  -- Level 1: Machine type (e.g., "Folding Machine", "Offset Press")
  -- Level 2: Brand + Type (e.g., "Heidelberg Stahlfolder")
  -- Level 3: Model (e.g., "Ti52")
  -- Level 4: Specific variant (e.g., "Ti52/4")

  slug TEXT NOT NULL UNIQUE, -- URL-friendly: "heidelberg-stahlfolder-ti52"
  display_name TEXT NOT NULL, -- User-friendly: "Heidelberg Stahlfolder Ti52"

  -- Marketing copy for each level
  short_description TEXT, -- "Solve Fibre-Cracking on Your {display_name}"
  tagline_template TEXT, -- "Fast-Fit Tri-Creaser for {display_name}"

  -- Product compatibility
  compatible_product_codes TEXT[], -- Which products work with this machine

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT, -- Admin user who added this

  -- Search/filtering
  keywords TEXT[], -- For fuzzy search
  is_active BOOLEAN DEFAULT TRUE
);

-- Index for hierarchy queries
CREATE INDEX idx_machine_taxonomy_parent ON machine_taxonomy(parent_id);
CREATE INDEX idx_machine_taxonomy_level ON machine_taxonomy(level);
CREATE INDEX idx_machine_taxonomy_slug ON machine_taxonomy(slug);

-- ============================================================================
-- COMPANY MACHINE KNOWLEDGE
-- What we know about each company's machines (progressive learning)
-- ============================================================================

CREATE TABLE IF NOT EXISTS company_machine_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  machine_taxonomy_id UUID NOT NULL REFERENCES machine_taxonomy(id) ON DELETE CASCADE,

  -- Confidence in this knowledge
  confidence_level INT NOT NULL CHECK (confidence_level BETWEEN 1 AND 4),
  -- 1: Guessed/inferred (from industry data)
  -- 2: Customer clicked in campaign (needs confirmation)
  -- 3: Sales team confirmed
  -- 4: Customer account verified (from order/contract)

  -- How we learned this
  learned_from TEXT NOT NULL, -- 'campaign_click', 'manual_entry', 'sales_call', 'order_data'
  learned_at TIMESTAMP DEFAULT NOW(),
  learned_by TEXT, -- Contact ID or admin user who added this

  -- Campaign tracking
  source_campaign_key TEXT, -- Which campaign taught us this
  source_token TEXT, -- Which specific link they clicked

  -- Confirmation workflow
  confirmed BOOLEAN DEFAULT FALSE,
  confirmed_by TEXT, -- Admin user who confirmed
  confirmed_at TIMESTAMP,

  -- Notes from sales team
  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Prevent duplicates
  UNIQUE(company_id, machine_taxonomy_id)
);

CREATE INDEX idx_company_machine_knowledge_company ON company_machine_knowledge(company_id);
CREATE INDEX idx_company_machine_knowledge_confidence ON company_machine_knowledge(confidence_level);
CREATE INDEX idx_company_machine_knowledge_unconfirmed ON company_machine_knowledge(confirmed) WHERE confirmed = FALSE;

-- ============================================================================
-- CAMPAIGNS
-- Marketing campaigns targeting specific machines/knowledge levels
-- ============================================================================

CREATE TABLE IF NOT EXISTS campaigns (
  campaign_key TEXT PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL DEFAULT 'progressive', -- 'progressive', 'one-time', 'seasonal'

  -- Product being sold
  product_codes TEXT[] NOT NULL, -- Tools/hardware being marketed

  -- Targeting
  target_machine_category_id UUID REFERENCES machine_taxonomy(id), -- Top-level machine type
  target_knowledge_levels INT[], -- Which levels to send to: [1,2,3]

  -- Campaign content
  subject_line_template TEXT, -- Email subject
  tagline_template TEXT, -- Landing page headline
  description TEXT,
  offer_details JSONB, -- Discounts, bundles, etc.

  -- Scheduling
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'
  scheduled_start TIMESTAMP,
  scheduled_end TIMESTAMP,

  -- Tracking
  links_generated INT DEFAULT 0,
  clicks_total INT DEFAULT 0,
  conversions_total INT DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_product_codes ON campaigns USING GIN(product_codes);

-- ============================================================================
-- CAMPAIGN INTERACTIONS
-- Track every click to learn from it (contact-level tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS campaign_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who clicked
  company_id UUID NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(contact_id) ON DELETE SET NULL,
  contact_role TEXT, -- Captured from contact record for quick filtering

  -- What campaign
  campaign_key TEXT NOT NULL REFERENCES campaigns(campaign_key) ON DELETE CASCADE,
  token TEXT NOT NULL, -- The personalized token they used

  -- What they clicked
  interaction_type TEXT NOT NULL, -- 'link_click', 'machine_selection', 'product_view', 'quote_request'
  machine_taxonomy_id UUID REFERENCES machine_taxonomy(id), -- What machine they selected
  clicked_option TEXT, -- Raw value they clicked
  current_knowledge_level INT, -- Knowledge level at time of click

  -- Machine learning data
  learned_new_info BOOLEAN DEFAULT FALSE, -- Did this click teach us something new?
  confidence_increase INT, -- Did confidence level go up?

  -- Metadata
  clicked_at TIMESTAMP DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,

  -- Session tracking
  session_id UUID, -- Group multiple clicks in same session
  session_duration_seconds INT
);

CREATE INDEX idx_campaign_interactions_company ON campaign_interactions(company_id);
CREATE INDEX idx_campaign_interactions_contact ON campaign_interactions(contact_id);
CREATE INDEX idx_campaign_interactions_campaign ON campaign_interactions(campaign_key);
CREATE INDEX idx_campaign_interactions_timestamp ON campaign_interactions(clicked_at DESC);
CREATE INDEX idx_campaign_interactions_learned ON campaign_interactions(learned_new_info) WHERE learned_new_info = TRUE;

-- ============================================================================
-- CAMPAIGN LINKS
-- Track generated personalized links for each campaign
-- ============================================================================

CREATE TABLE IF NOT EXISTS campaign_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  campaign_key TEXT NOT NULL REFERENCES campaigns(campaign_key) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(contact_id) ON DELETE SET NULL,

  -- Tokenization
  token TEXT NOT NULL UNIQUE, -- The actual token in the URL

  -- Personalization level
  knowledge_level INT NOT NULL, -- 1, 2, 3, or 4
  machine_taxonomy_id UUID REFERENCES machine_taxonomy(id), -- Most specific machine we know

  -- Tracking
  sent_at TIMESTAMP,
  first_clicked_at TIMESTAMP,
  last_clicked_at TIMESTAMP,
  click_count INT DEFAULT 0,

  -- Link lifecycle
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_campaign_links_campaign ON campaign_links(campaign_key);
CREATE INDEX idx_campaign_links_company ON campaign_links(company_id);
CREATE INDEX idx_campaign_links_token ON campaign_links(token);
CREATE INDEX idx_campaign_links_active ON campaign_links(is_active, expires_at);

-- ============================================================================
-- KNOWLEDGE CONFIRMATION QUEUE
-- Sales team reviews and confirms machine knowledge learned from campaigns
-- ============================================================================

CREATE TABLE IF NOT EXISTS knowledge_confirmation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  company_id UUID NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(contact_id) ON DELETE SET NULL,

  -- What was learned
  machine_taxonomy_id UUID NOT NULL REFERENCES machine_taxonomy(id),
  learned_from_campaign TEXT REFERENCES campaigns(campaign_key),
  interaction_id UUID REFERENCES campaign_interactions(id),

  -- Evidence
  evidence_type TEXT, -- 'campaign_click', 'multiple_clicks', 'quote_request'
  evidence_details JSONB, -- Store click data, selections made, etc.
  confidence_score DECIMAL, -- Algorithm-calculated confidence (0-100)

  -- Review status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'rejected', 'needs_info'
  reviewed_by TEXT,
  reviewed_at TIMESTAMP,
  review_notes TEXT,

  -- Priority
  priority INT DEFAULT 0, -- Higher = more important to review

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_knowledge_queue_status ON knowledge_confirmation_queue(status) WHERE status = 'pending';
CREATE INDEX idx_knowledge_queue_priority ON knowledge_confirmation_queue(priority DESC, created_at ASC);
CREATE INDEX idx_knowledge_queue_company ON knowledge_confirmation_queue(company_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get full machine hierarchy path
CREATE OR REPLACE FUNCTION get_machine_hierarchy(taxonomy_id UUID)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  WITH RECURSIVE hierarchy AS (
    SELECT id, parent_id, display_name, level
    FROM machine_taxonomy
    WHERE id = taxonomy_id

    UNION ALL

    SELECT mt.id, mt.parent_id, mt.display_name, mt.level
    FROM machine_taxonomy mt
    INNER JOIN hierarchy h ON mt.id = h.parent_id
  )
  SELECT string_agg(display_name, ' > ' ORDER BY level)
  INTO result
  FROM hierarchy;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update campaign stats
CREATE OR REPLACE FUNCTION update_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE campaigns
  SET
    clicks_total = (
      SELECT COUNT(DISTINCT id)
      FROM campaign_interactions
      WHERE campaign_key = NEW.campaign_key
    ),
    updated_at = NOW()
  WHERE campaign_key = NEW.campaign_key;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_campaign_stats
AFTER INSERT ON campaign_interactions
FOR EACH ROW
EXECUTE FUNCTION update_campaign_stats();

-- ============================================================================
-- SEED DATA - Basic Machine Types
-- (You can expand this as you learn more)
-- ============================================================================

-- Level 1: Machine Types
INSERT INTO machine_taxonomy (level, slug, display_name, short_description, tagline_template, keywords)
VALUES
  (1, 'folding-machine', 'Folding Machine', 'Solve fibre-cracking on your folding operations', 'Tri-Creaser for {display_name}', ARRAY['folder', 'folding', 'buckle folder']),
  (1, 'offset-press', 'Offset Press', 'Enhance print quality on your press', 'Gripper Solutions for {display_name}', ARRAY['press', 'printing press', 'offset']),
  (1, 'die-cutter', 'Die Cutting Machine', 'Perfect creasing for your die cutting', 'Creasing Tools for {display_name}', ARRAY['die cutter', 'cutting', 'finishing'])
ON CONFLICT (slug) DO NOTHING;

-- Level 2: Some common brands (examples - you'll add more)
INSERT INTO machine_taxonomy (level, parent_id, slug, display_name, short_description, tagline_template, keywords)
SELECT
  2,
  (SELECT id FROM machine_taxonomy WHERE slug = 'folding-machine'),
  'heidelberg-stahlfolder',
  'Heidelberg Stahlfolder',
  'Solve fibre-cracking on your Heidelberg Stahlfolder',
  'Fast-Fit Tri-Creaser for {display_name}',
  ARRAY['heidelberg', 'stahlfolder', 'folder']
ON CONFLICT (slug) DO NOTHING;

INSERT INTO machine_taxonomy (level, parent_id, slug, display_name, short_description, tagline_template, keywords)
SELECT
  2,
  (SELECT id FROM machine_taxonomy WHERE slug = 'folding-machine'),
  'mbo-folder',
  'MBO Folder',
  'Solve fibre-cracking on your MBO Folder',
  'Tri-Creaser for {display_name}',
  ARRAY['mbo', 'folder']
ON CONFLICT (slug) DO NOTHING;

-- You can add Level 3 (specific models) manually through the admin UI as you learn them

COMMENT ON TABLE machine_taxonomy IS 'Hierarchical structure of machines - grows as we learn more about customer equipment';
COMMENT ON TABLE company_machine_knowledge IS 'Progressive learning: what we know about each companys machines and confidence level';
COMMENT ON TABLE campaign_interactions IS 'Contact-level tracking of every click to learn machine details and contact relevance';
COMMENT ON TABLE knowledge_confirmation_queue IS 'Sales team reviews clicks and confirms machine knowledge before trusting it';
