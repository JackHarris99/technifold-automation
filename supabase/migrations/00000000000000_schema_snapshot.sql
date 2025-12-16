--
-- Complete Supabase Schema Snapshot
-- Generated from production database: 2025-01-17
--

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

--
-- Tables
--

CREATE TABLE activity_log (
    activity_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    user_email text NOT NULL,
    user_name text NOT NULL,
    action_type text NOT NULL,
    entity_type text,
    entity_id text,
    description text,
    metadata jsonb DEFAULT '{}'::jsonb,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE brand_media (
    brand_slug text NOT NULL,
    brand_name text NOT NULL,
    logo_url text,
    hero_url text
);

CREATE TABLE companies (
    company_id text NOT NULL,
    company_name text NOT NULL,
    website text,
    country text,
    type text DEFAULT 'customer'::text,
    source text DEFAULT 'sage_import'::text,
    account_opened_at date,
    first_invoice_at date,
    last_invoice_at date,
    vat_number text,
    eori_number text,
    company_reg_number text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    category text,
    stripe_customer_id text,
    zoho_account_id text,
    account_owner text,
    portal_payload jsonb,
    domain text
);

CREATE TABLE company_consumables (
    company_id text NOT NULL,
    consumable_code text NOT NULL,
    first_ordered_at date NOT NULL,
    last_ordered_at date NOT NULL,
    total_orders integer DEFAULT 1 NOT NULL,
    total_quantity integer NOT NULL,
    last_order_amount numeric,
    last_order_quantity integer,
    last_invoice_id text
);

CREATE TABLE company_machine (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    machine_id uuid NOT NULL,
    company_id text NOT NULL,
    quantity integer DEFAULT 1,
    location text,
    verified boolean DEFAULT FALSE,
    source text DEFAULT 'website_form'::text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    confidence smallint DEFAULT 1,
    evidence jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE company_tools (
    company_id text NOT NULL,
    tool_code text NOT NULL,
    first_seen_at date NOT NULL,
    last_seen_at date NOT NULL,
    total_units integer NOT NULL
);

CREATE TABLE contact_interactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contact_id uuid NOT NULL,
    company_id text NOT NULL,
    interaction_type text NOT NULL,
    url text,
    referrer text,
    metadata jsonb,
    occurred_at timestamp with time zone DEFAULT now()
);

CREATE TABLE contacts (
    contact_id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id text NOT NULL,
    first_name text,
    last_name text,
    full_name text,
    email text,
    phone text,
    role text,
    source text DEFAULT 'sage_import'::text,
    status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    token uuid,
    marketing_status text,
    gdpr_consent_at timestamp with time zone,
    zoho_contact_id text
);

CREATE TABLE engagement_events (
    event_id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id text,
    contact_id uuid,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL,
    event_type text NOT NULL,
    source text,
    url text,
    meta jsonb DEFAULT '{}'::jsonb NOT NULL,
    source_event_id text,
    event_name text,
    campaign_key text,
    offer_key text,
    value numeric,
    currency text
);

CREATE TABLE invoice_items (
    invoice_id uuid NOT NULL,
    product_code text NOT NULL,
    line_number integer NOT NULL,
    description text NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric NOT NULL,
    line_total numeric NOT NULL,
    notes text
);

CREATE TABLE invoices (
    invoice_id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id text NOT NULL,
    contact_id uuid,
    stripe_invoice_id text,
    stripe_customer_id text,
    stripe_payment_intent_id text,
    invoice_number text,
    invoice_type text,
    currency text DEFAULT 'gbp'::text NOT NULL,
    subtotal numeric NOT NULL,
    tax_amount numeric DEFAULT 0,
    shipping_amount numeric DEFAULT 0,
    total_amount numeric NOT NULL,
    status text NOT NULL,
    payment_status text NOT NULL,
    invoice_date date DEFAULT CURRENT_DATE NOT NULL,
    due_date date,
    paid_at timestamp with time zone,
    sent_at timestamp with time zone,
    voided_at timestamp with time zone,
    invoice_url text,
    invoice_pdf_url text,
    shipping_address_id uuid,
    shipping_country text,
    tracking_number text,
    carrier text,
    shipped_at timestamp with time zone,
    notes text,
    created_by text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE machines (
    machine_id uuid DEFAULT gen_random_uuid() NOT NULL,
    brand text NOT NULL,
    model text,
    display_name text,
    type text NOT NULL,
    shaft_size_mm integer,
    country text,
    oem_url text,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    slug text,
    type_canonical text,
    outer_diameter_mm numeric,
    shaft_specs jsonb,
    shaft_config_id integer
);

CREATE TABLE order_items (
    order_id uuid NOT NULL,
    product_code text NOT NULL,
    description text,
    qty integer NOT NULL,
    unit_price numeric NOT NULL,
    line_total numeric NOT NULL
);

CREATE TABLE orders (
    order_id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id text NOT NULL,
    currency text DEFAULT 'GBP'::text NOT NULL,
    payment_channel text NOT NULL,
    payment_status text DEFAULT 'unpaid'::text NOT NULL,
    fulfillment_status text DEFAULT 'hold_unpaid'::text NOT NULL,
    subtotal numeric DEFAULT 0 NOT NULL,
    shipping_amount numeric DEFAULT 0 NOT NULL,
    tax_amount numeric DEFAULT 0 NOT NULL,
    total_amount numeric DEFAULT 0 NOT NULL,
    shipping_country text,
    shipping_name text,
    shipping_company text,
    shipping_address1 text,
    shipping_address2 text,
    shipping_city text,
    shipping_postcode text,
    stripe_checkout_session_id text,
    stripe_payment_intent_id text,
    books_customer_id text,
    books_invoice_id text,
    books_payment_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    shipping_address_id uuid,
    invoice_number text,
    order_type text,
    rental_agreement_id uuid,
    tracking_number text,
    carrier text,
    shipped_at timestamp with time zone,
    estimated_delivery text,
    stripe_invoice_id text,
    invoice_status text,
    invoice_url text,
    invoice_pdf_url text,
    commercial_invoice_pdf_url text,
    invoice_sent_at timestamp with time zone,
    invoice_voided_at timestamp with time zone,
    shipping_weight_kg numeric,
    incoterms text
);

CREATE TABLE outbox (
    job_id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_type text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    max_attempts integer DEFAULT 3 NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    company_id text,
    order_id uuid,
    last_error text,
    locked_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone
);

CREATE TABLE products (
    product_code text NOT NULL,
    description text,
    type text DEFAULT 'part'::text,
    category text,
    active boolean DEFAULT TRUE,
    is_marketable boolean DEFAULT FALSE,
    is_reminder_eligible boolean DEFAULT FALSE,
    price numeric,
    currency text DEFAULT 'GBP'::text,
    site_visibility text[] DEFAULT '{technifold}'::text[],
    extra jsonb DEFAULT '{}'::jsonb,
    image_url text,
    image_alt text,
    video_url text,
    weight_kg numeric,
    dimensions_cm text,
    hs_code text,
    country_of_origin text DEFAULT 'GB'::text,
    rental_price_monthly numeric,
    customs_value_gbp numeric,
    width_cm numeric,
    height_cm numeric,
    depth_cm numeric
);

CREATE TABLE quote_requests (
    quote_request_id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    contact_id uuid NOT NULL,
    machine_slug character varying,
    interested_products jsonb DEFAULT '[]'::jsonb,
    status character varying DEFAULT 'requested'::character varying NOT NULL,
    source character varying DEFAULT 'manual'::character varying NOT NULL,
    assigned_to character varying,
    notes text,
    marketing_token text,
    quote_token text,
    lost_reason text,
    won_amount numeric,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    quote_sent_at timestamp with time zone,
    closed_at timestamp with time zone
);

CREATE TABLE rental_agreements (
    rental_id uuid DEFAULT gen_random_uuid() NOT NULL,
    serial_number text NOT NULL,
    company_id text NOT NULL,
    contact_id uuid,
    product_code text NOT NULL,
    stripe_subscription_id text,
    stripe_customer_id text,
    monthly_price numeric NOT NULL,
    currency text DEFAULT 'GBP'::text NOT NULL,
    start_date timestamp with time zone NOT NULL,
    trial_end_date timestamp with time zone,
    minimum_term_months integer DEFAULT 24 NOT NULL,
    contract_signed_at timestamp with time zone NOT NULL,
    contract_pdf_url text,
    contract_ip_address inet,
    status text DEFAULT 'trial'::text NOT NULL,
    cancelled_at timestamp with time zone,
    cancellation_reason text,
    tool_returned_at timestamp with time zone,
    return_condition text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE shipping_addresses (
    address_id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id text NOT NULL,
    address_line_1 text NOT NULL,
    address_line_2 text,
    city text NOT NULL,
    state_province text,
    postal_code text NOT NULL,
    country text DEFAULT 'GB'::text NOT NULL,
    is_default boolean DEFAULT FALSE,
    label text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE shipping_manifests (
    manifest_id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id text NOT NULL,
    subscription_id character varying,
    order_id uuid,
    destination_country character varying NOT NULL,
    shipment_type character varying NOT NULL,
    courier character varying,
    tracking_number character varying,
    shipped_at timestamp without time zone,
    delivered_at timestamp without time zone,
    customs_invoice_number character varying,
    total_customs_value_gbp numeric,
    total_weight_kg numeric,
    items jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notes text
);

CREATE TABLE site_branding (
    brand_key text NOT NULL,
    brand_name text NOT NULL,
    logo_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE subscription_events (
    event_id uuid DEFAULT gen_random_uuid() NOT NULL,
    subscription_id uuid NOT NULL,
    event_type character varying NOT NULL,
    event_name character varying,
    old_value jsonb,
    new_value jsonb,
    performed_by text,
    performed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notes text
);

CREATE TABLE subscription_tools (
    subscription_id uuid NOT NULL,
    tool_code text NOT NULL,
    added_at timestamp with time zone DEFAULT now() NOT NULL,
    added_by text,
    removed_at timestamp with time zone,
    removed_by text,
    removal_reason text
);

CREATE TABLE subscriptions (
    subscription_id uuid DEFAULT gen_random_uuid() NOT NULL,
    stripe_subscription_id character varying,
    stripe_customer_id character varying,
    company_id text NOT NULL,
    contact_id uuid,
    monthly_price numeric NOT NULL,
    currency character varying DEFAULT 'GBP'::character varying,
    tools jsonb DEFAULT '[]'::jsonb,
    status character varying DEFAULT 'trial'::character varying,
    trial_start_date timestamp without time zone,
    trial_end_date timestamp without time zone,
    current_period_start timestamp without time zone,
    current_period_end timestamp without time zone,
    next_billing_date timestamp without time zone,
    ratchet_max numeric,
    cancel_at_period_end boolean DEFAULT FALSE,
    cancelled_at timestamp without time zone,
    cancellation_reason text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    created_by text,
    updated_by text
);

CREATE TABLE tool_consumable_map (
    tool_code text NOT NULL,
    consumable_code text NOT NULL
);

CREATE TABLE trial_intents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    token text NOT NULL,
    company_id text,
    contact_id uuid,
    machine_id uuid,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE users (
    user_id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    full_name text NOT NULL,
    role text NOT NULL,
    sales_rep_id text,
    is_active boolean DEFAULT TRUE NOT NULL,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Primary Keys
--

ALTER TABLE ONLY activity_log ADD CONSTRAINT activity_log_pkey PRIMARY KEY (activity_id);
ALTER TABLE ONLY brand_media ADD CONSTRAINT brand_media_pkey PRIMARY KEY (brand_slug);
ALTER TABLE ONLY companies ADD CONSTRAINT companies_pkey PRIMARY KEY (company_id);
ALTER TABLE ONLY company_consumables ADD CONSTRAINT company_consumables_pkey PRIMARY KEY (company_id, consumable_code);
ALTER TABLE ONLY company_machine ADD CONSTRAINT company_machines_pkey PRIMARY KEY (id);
ALTER TABLE ONLY company_tools ADD CONSTRAINT company_tool_pkey PRIMARY KEY (company_id, tool_code);
ALTER TABLE ONLY contact_interactions ADD CONSTRAINT contact_interactions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY contacts ADD CONSTRAINT contacts_pkey PRIMARY KEY (contact_id);
ALTER TABLE ONLY engagement_events ADD CONSTRAINT engagement_events_pkey PRIMARY KEY (event_id);
ALTER TABLE ONLY invoice_items ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (invoice_id, product_code, line_number);
ALTER TABLE ONLY invoices ADD CONSTRAINT invoices_pkey PRIMARY KEY (invoice_id);
ALTER TABLE ONLY machines ADD CONSTRAINT machines_pkey PRIMARY KEY (machine_id);
ALTER TABLE ONLY order_items ADD CONSTRAINT order_items_pkey PRIMARY KEY (order_id, product_code);
ALTER TABLE ONLY orders ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);
ALTER TABLE ONLY outbox ADD CONSTRAINT outbox_pkey PRIMARY KEY (job_id);
ALTER TABLE ONLY products ADD CONSTRAINT products_pkey PRIMARY KEY (product_code);
ALTER TABLE ONLY quote_requests ADD CONSTRAINT quote_requests_pkey PRIMARY KEY (quote_request_id);
ALTER TABLE ONLY rental_agreements ADD CONSTRAINT rental_agreements_pkey PRIMARY KEY (rental_id);
ALTER TABLE ONLY shipping_addresses ADD CONSTRAINT shipping_addresses_pkey PRIMARY KEY (address_id);
ALTER TABLE ONLY shipping_manifests ADD CONSTRAINT shipping_manifests_pkey PRIMARY KEY (manifest_id);
ALTER TABLE ONLY site_branding ADD CONSTRAINT site_branding_pkey PRIMARY KEY (brand_key);
ALTER TABLE ONLY subscription_events ADD CONSTRAINT subscription_events_pkey PRIMARY KEY (event_id);
ALTER TABLE ONLY subscription_tools ADD CONSTRAINT subscription_tools_pkey PRIMARY KEY (subscription_id, tool_code, added_at);
ALTER TABLE ONLY subscriptions ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (subscription_id);
ALTER TABLE ONLY tool_consumable_map ADD CONSTRAINT tool_consumable_map_pkey PRIMARY KEY (tool_code, consumable_code);
ALTER TABLE ONLY trial_intents ADD CONSTRAINT trial_intents_pkey PRIMARY KEY (id);
ALTER TABLE ONLY users ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);

-- Unique constraints
ALTER TABLE ONLY contacts ADD CONSTRAINT uq_contacts_company_email_exact UNIQUE (company_id, email);
ALTER TABLE ONLY contacts ADD CONSTRAINT uix_contacts_token UNIQUE (token);
ALTER TABLE ONLY company_machine ADD CONSTRAINT company_machine_company_machine_unique UNIQUE (company_id, machine_id);
ALTER TABLE ONLY engagement_events ADD CONSTRAINT uix_events_source_id UNIQUE (source, source_event_id);
ALTER TABLE ONLY invoices ADD CONSTRAINT invoices_stripe_invoice_id_key UNIQUE (stripe_invoice_id);
ALTER TABLE ONLY invoices ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);
ALTER TABLE ONLY machines ADD CONSTRAINT machines_slug_key UNIQUE (slug);
ALTER TABLE ONLY rental_agreements ADD CONSTRAINT rental_agreements_serial_number_key UNIQUE (serial_number);
ALTER TABLE ONLY rental_agreements ADD CONSTRAINT rental_agreements_stripe_subscription_id_key UNIQUE (stripe_subscription_id);
ALTER TABLE ONLY subscriptions ADD CONSTRAINT subscriptions_stripe_subscription_id_key UNIQUE (stripe_subscription_id);
ALTER TABLE ONLY trial_intents ADD CONSTRAINT trial_intents_token_key UNIQUE (token);
ALTER TABLE ONLY users ADD CONSTRAINT users_email_key UNIQUE (email);

--
-- Foreign Keys
--

ALTER TABLE ONLY activity_log ADD CONSTRAINT activity_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id);
ALTER TABLE ONLY company_consumables ADD CONSTRAINT company_consumables_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(company_id);
ALTER TABLE ONLY company_consumables ADD CONSTRAINT company_consumables_consumable_code_fkey FOREIGN KEY (consumable_code) REFERENCES products(product_code);
ALTER TABLE ONLY company_machine ADD CONSTRAINT company_machine_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(company_id);
ALTER TABLE ONLY company_machine ADD CONSTRAINT company_machine_machine_id_fkey FOREIGN KEY (machine_id) REFERENCES machines(machine_id);
ALTER TABLE ONLY company_tools ADD CONSTRAINT company_tools_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(company_id);
ALTER TABLE ONLY company_tools ADD CONSTRAINT company_tools_tool_code_fkey FOREIGN KEY (tool_code) REFERENCES products(product_code);
ALTER TABLE ONLY contact_interactions ADD CONSTRAINT contact_interactions_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(company_id);
ALTER TABLE ONLY contact_interactions ADD CONSTRAINT contact_interactions_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES contacts(contact_id);
ALTER TABLE ONLY contacts ADD CONSTRAINT contacts_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(company_id);
ALTER TABLE ONLY engagement_events ADD CONSTRAINT engagement_events_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(company_id);
ALTER TABLE ONLY engagement_events ADD CONSTRAINT engagement_events_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES contacts(contact_id);
ALTER TABLE ONLY invoice_items ADD CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id);
ALTER TABLE ONLY invoice_items ADD CONSTRAINT invoice_items_product_code_fkey FOREIGN KEY (product_code) REFERENCES products(product_code);
ALTER TABLE ONLY invoices ADD CONSTRAINT invoices_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(company_id);
ALTER TABLE ONLY invoices ADD CONSTRAINT invoices_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES contacts(contact_id);
ALTER TABLE ONLY invoices ADD CONSTRAINT invoices_shipping_address_id_fkey FOREIGN KEY (shipping_address_id) REFERENCES shipping_addresses(address_id);
ALTER TABLE ONLY order_items ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(order_id);
ALTER TABLE ONLY orders ADD CONSTRAINT orders_rental_agreement_id_fkey FOREIGN KEY (rental_agreement_id) REFERENCES rental_agreements(rental_id);
ALTER TABLE ONLY orders ADD CONSTRAINT orders_shipping_address_id_fkey FOREIGN KEY (shipping_address_id) REFERENCES shipping_addresses(address_id);
ALTER TABLE ONLY quote_requests ADD CONSTRAINT quote_requests_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(company_id);
ALTER TABLE ONLY quote_requests ADD CONSTRAINT quote_requests_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES contacts(contact_id);
ALTER TABLE ONLY rental_agreements ADD CONSTRAINT rental_agreements_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(company_id);
ALTER TABLE ONLY rental_agreements ADD CONSTRAINT rental_agreements_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES contacts(contact_id);
ALTER TABLE ONLY rental_agreements ADD CONSTRAINT rental_agreements_product_code_fkey FOREIGN KEY (product_code) REFERENCES products(product_code);
ALTER TABLE ONLY shipping_addresses ADD CONSTRAINT shipping_addresses_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(company_id);
ALTER TABLE ONLY shipping_manifests ADD CONSTRAINT shipping_manifests_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(company_id);
ALTER TABLE ONLY shipping_manifests ADD CONSTRAINT shipping_manifests_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(order_id);
ALTER TABLE ONLY subscription_events ADD CONSTRAINT subscription_events_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES subscriptions(subscription_id);
ALTER TABLE ONLY subscription_tools ADD CONSTRAINT subscription_tools_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES subscriptions(subscription_id);
ALTER TABLE ONLY subscription_tools ADD CONSTRAINT subscription_tools_tool_code_fkey FOREIGN KEY (tool_code) REFERENCES products(product_code);
ALTER TABLE ONLY subscriptions ADD CONSTRAINT subscriptions_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(company_id);
ALTER TABLE ONLY subscriptions ADD CONSTRAINT subscriptions_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES contacts(contact_id);
ALTER TABLE ONLY tool_consumable_map ADD CONSTRAINT tool_consumable_map_consumable_code_fkey FOREIGN KEY (consumable_code) REFERENCES products(product_code);
ALTER TABLE ONLY trial_intents ADD CONSTRAINT trial_intents_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(company_id);
ALTER TABLE ONLY trial_intents ADD CONSTRAINT trial_intents_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES contacts(contact_id);
ALTER TABLE ONLY trial_intents ADD CONSTRAINT trial_intents_machine_id_fkey FOREIGN KEY (machine_id) REFERENCES machines(machine_id);

--
-- Indexes
--

CREATE INDEX idx_activity_log_action_type ON activity_log USING btree (action_type);
CREATE INDEX idx_activity_log_created_at ON activity_log USING btree (created_at DESC);
CREATE INDEX idx_activity_log_entity ON activity_log USING btree (entity_type, entity_id);
CREATE INDEX idx_activity_log_user_id ON activity_log USING btree (user_id);
CREATE INDEX idx_companies_category ON companies USING btree (category);
CREATE INDEX idx_companies_domain ON companies USING btree (domain);
CREATE INDEX idx_companies_id_trgm ON companies USING gin (company_id gin_trgm_ops);
CREATE INDEX idx_companies_name ON companies USING btree (company_name);
CREATE INDEX idx_companies_name_trgm ON companies USING gin (company_name gin_trgm_ops);
CREATE INDEX idx_companies_stripe_customer_id ON companies USING btree (stripe_customer_id) WHERE (stripe_customer_id IS NOT NULL);
CREATE INDEX idx_companies_type ON companies USING btree (type);
CREATE INDEX idx_companies_zoho_account_id ON companies USING btree (zoho_account_id) WHERE (zoho_account_id IS NOT NULL);
CREATE INDEX idx_company_consumables_company ON company_consumables USING btree (company_id);
CREATE INDEX idx_company_consumables_consumable ON company_consumables USING btree (consumable_code);
CREATE INDEX idx_company_consumables_last_order ON company_consumables USING btree (last_ordered_at);
CREATE INDEX idx_company_machine_company ON company_machine USING btree (company_id);
CREATE INDEX idx_company_machines_machine ON company_machine USING btree (machine_id);
CREATE INDEX idx_company_tool_company ON company_tools USING btree (company_id);
CREATE INDEX idx_contact_interactions_company ON contact_interactions USING btree (company_id);
CREATE INDEX idx_contact_interactions_contact ON contact_interactions USING btree (contact_id);
CREATE INDEX idx_contact_interactions_metadata ON contact_interactions USING gin (metadata);
CREATE INDEX idx_contact_interactions_occurred ON contact_interactions USING btree (occurred_at DESC);
CREATE INDEX idx_contact_interactions_type ON contact_interactions USING btree (interaction_type);
CREATE INDEX idx_contacts_company ON contacts USING btree (company_id);
CREATE INDEX idx_contacts_zoho_contact_id ON contacts USING btree (zoho_contact_id) WHERE (zoho_contact_id IS NOT NULL);
CREATE INDEX idx_engagement_events_company_time ON engagement_events USING btree (company_id, occurred_at);
CREATE INDEX idx_engagement_events_contact_time ON engagement_events USING btree (contact_id, occurred_at);
CREATE INDEX idx_events_name_time ON engagement_events USING btree (event_name, occurred_at DESC);
CREATE INDEX idx_invoice_items_invoice ON invoice_items USING btree (invoice_id);
CREATE INDEX idx_invoice_items_product ON invoice_items USING btree (product_code);
CREATE INDEX idx_invoices_company ON invoices USING btree (company_id);
CREATE INDEX idx_invoices_contact ON invoices USING btree (contact_id);
CREATE INDEX idx_invoices_created_by ON invoices USING btree (created_by);
CREATE INDEX idx_invoices_date ON invoices USING btree (invoice_date);
CREATE INDEX idx_invoices_status ON invoices USING btree (status, payment_status);
CREATE INDEX idx_invoices_stripe_invoice ON invoices USING btree (stripe_invoice_id);
CREATE INDEX idx_machines_brand ON machines USING btree (brand);
CREATE INDEX idx_machines_shaft_config ON machines USING btree (shaft_config_id);
CREATE INDEX idx_machines_slug ON machines USING btree (slug);
CREATE INDEX idx_manifests_company ON shipping_manifests USING btree (company_id);
CREATE INDEX idx_manifests_country ON shipping_manifests USING btree (destination_country);
CREATE INDEX idx_manifests_shipped ON shipping_manifests USING btree (shipped_at);
CREATE INDEX idx_manifests_subscription ON shipping_manifests USING btree (subscription_id);
CREATE INDEX idx_orders_company ON orders USING btree (company_id, created_at DESC);
CREATE INDEX idx_orders_invoice_number ON orders USING btree (invoice_number) WHERE (invoice_number IS NOT NULL);
CREATE INDEX idx_orders_invoice_status ON orders USING btree (invoice_status) WHERE (invoice_status IS NOT NULL);
CREATE INDEX idx_orders_rental ON orders USING btree (rental_agreement_id) WHERE (rental_agreement_id IS NOT NULL);
CREATE INDEX idx_orders_shipping_address ON orders USING btree (shipping_address_id) WHERE (shipping_address_id IS NOT NULL);
CREATE INDEX idx_orders_status ON orders USING btree (fulfillment_status, created_at DESC);
CREATE INDEX idx_orders_stripe_invoice_id ON orders USING btree (stripe_invoice_id) WHERE (stripe_invoice_id IS NOT NULL);
CREATE INDEX idx_orders_tracking_number ON orders USING btree (tracking_number) WHERE (tracking_number IS NOT NULL);
CREATE INDEX idx_orders_type ON orders USING btree (order_type) WHERE (order_type IS NOT NULL);
CREATE INDEX idx_orders_unpaid ON orders USING btree (invoice_status, created_at DESC) WHERE (invoice_status = ANY (ARRAY['open'::text, 'sent'::text]));
CREATE INDEX idx_outbox_company ON outbox USING btree (company_id);
CREATE INDEX idx_outbox_created ON outbox USING btree (created_at DESC);
CREATE INDEX idx_outbox_order ON outbox USING btree (order_id);
CREATE INDEX idx_outbox_pick ON outbox USING btree (status, locked_until, attempts);
CREATE INDEX idx_products_hs_code ON products USING btree (hs_code);
CREATE INDEX idx_products_origin ON products USING btree (country_of_origin);
CREATE INDEX idx_quote_requests_assigned ON quote_requests USING btree (assigned_to);
CREATE INDEX idx_quote_requests_company ON quote_requests USING btree (company_id);
CREATE INDEX idx_quote_requests_contact ON quote_requests USING btree (contact_id);
CREATE INDEX idx_quote_requests_created ON quote_requests USING btree (created_at DESC);
CREATE INDEX idx_quote_requests_status ON quote_requests USING btree (status);
CREATE INDEX idx_rental_agreements_company ON rental_agreements USING btree (company_id);
CREATE INDEX idx_rental_agreements_company_id ON rental_agreements USING btree (company_id);
CREATE INDEX idx_rental_agreements_contact ON rental_agreements USING btree (contact_id) WHERE (contact_id IS NOT NULL);
CREATE INDEX idx_rental_agreements_contact_id ON rental_agreements USING btree (contact_id) WHERE (contact_id IS NOT NULL);
CREATE INDEX idx_rental_agreements_product ON rental_agreements USING btree (product_code);
CREATE INDEX idx_rental_agreements_product_code ON rental_agreements USING btree (product_code);
CREATE INDEX idx_rental_agreements_status ON rental_agreements USING btree (status, created_at DESC);
CREATE INDEX idx_rental_agreements_stripe_sub ON rental_agreements USING btree (stripe_subscription_id) WHERE (stripe_subscription_id IS NOT NULL);
CREATE INDEX idx_rental_agreements_stripe_subscription ON rental_agreements USING btree (stripe_subscription_id);
CREATE INDEX idx_shipping_addresses_company ON shipping_addresses USING btree (company_id);
CREATE INDEX idx_shipping_addresses_default ON shipping_addresses USING btree (company_id, is_default) WHERE (is_default = true);
CREATE INDEX idx_subscription_events_date ON subscription_events USING btree (performed_at);
CREATE INDEX idx_subscription_events_subscription ON subscription_events USING btree (subscription_id);
CREATE INDEX idx_subscription_events_type ON subscription_events USING btree (event_type);
CREATE INDEX idx_subscription_tools_active ON subscription_tools USING btree (subscription_id, tool_code) WHERE (removed_at IS NULL);
CREATE INDEX idx_subscription_tools_subscription ON subscription_tools USING btree (subscription_id);
CREATE INDEX idx_subscription_tools_tool ON subscription_tools USING btree (tool_code);
CREATE INDEX idx_subscriptions_company ON subscriptions USING btree (company_id);
CREATE INDEX idx_subscriptions_next_billing ON subscriptions USING btree (next_billing_date);
CREATE INDEX idx_subscriptions_status ON subscriptions USING btree (status);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions USING btree (stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_sub ON subscriptions USING btree (stripe_subscription_id);
CREATE INDEX idx_tcm_consumable ON tool_consumable_map USING btree (consumable_code);
CREATE INDEX idx_tcm_tool ON tool_consumable_map USING btree (tool_code);
CREATE INDEX idx_users_email ON users USING btree (email) WHERE (is_active = true);
CREATE INDEX idx_users_sales_rep_id ON users USING btree (sales_rep_id) WHERE (sales_rep_id IS NOT NULL);

--
-- Schema snapshot complete
--

