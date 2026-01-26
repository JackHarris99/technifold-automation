-- Automated Deduplication Migration
-- Merges duplicate companies and contacts while preserving all transactional data

BEGIN;

-- ============================================================================
-- STEP 1: CREATE BACKUP TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS companies_backup_20260126 AS SELECT * FROM companies;
CREATE TABLE IF NOT EXISTS contacts_backup_20260126 AS SELECT * FROM contacts;
CREATE TABLE IF NOT EXISTS invoices_backup_20260126 AS SELECT * FROM invoices;

-- ============================================================================
-- STEP 2: CREATE AUDIT TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS company_dedup_analysis (
    analysis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    keeper_company_id UUID NOT NULL,
    duplicate_company_ids UUID[] NOT NULL,
    keeper_score NUMERIC,
    duplicate_scores JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS company_dedup_log (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type TEXT NOT NULL,
    company_name TEXT,
    from_company_id UUID,
    to_company_id UUID,
    table_name TEXT,
    rows_affected INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_dedup_analysis (
    analysis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    keeper_contact_id UUID NOT NULL,
    duplicate_contact_ids UUID[] NOT NULL,
    keeper_company_id UUID NOT NULL,
    keeper_score NUMERIC,
    duplicate_scores JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_dedup_log (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type TEXT NOT NULL,
    email TEXT,
    from_contact_id UUID,
    to_contact_id UUID,
    table_name TEXT,
    rows_affected INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: COMPANY DEDUPLICATION - ANALYSIS
-- ============================================================================

-- Identify and score all duplicate company groups
WITH duplicate_groups AS (
    SELECT
        LOWER(TRIM(company_name)) as normalized_name,
        COUNT(*) as dup_count
    FROM companies
    GROUP BY LOWER(TRIM(company_name))
    HAVING COUNT(*) > 1
),
company_scores AS (
    SELECT
        c.company_id,
        c.company_name,
        c.type,
        c.created_at,
        -- Count relationships
        (SELECT COUNT(*) FROM invoices WHERE company_id = c.company_id) as invoice_count,
        (SELECT COUNT(*) FROM orders WHERE company_id = c.company_id) as order_count,
        (SELECT COUNT(*) FROM quotes WHERE company_id = c.company_id) as quote_count,
        (SELECT COUNT(*) FROM contacts WHERE company_id = c.company_id) as contact_count,
        (SELECT COUNT(*) FROM company_product_history WHERE company_id = c.company_id) as product_history_count,
        -- Calculate score (higher = more important to keep)
        COALESCE((SELECT COUNT(*) FROM invoices WHERE company_id = c.company_id) * 100, 0) +
        COALESCE((SELECT COUNT(*) FROM orders WHERE company_id = c.company_id) * 50, 0) +
        COALESCE((SELECT COUNT(*) FROM quotes WHERE company_id = c.company_id) * 40, 0) +
        COALESCE((SELECT COUNT(*) FROM contacts WHERE company_id = c.company_id) * 10, 0) +
        COALESCE((SELECT COUNT(*) FROM company_product_history WHERE company_id = c.company_id) * 5, 0) +
        CASE WHEN c.sage_customer_code IS NOT NULL THEN 20 ELSE 0 END +
        CASE WHEN c.stripe_customer_id IS NOT NULL THEN 15 ELSE 0 END +
        CASE WHEN c.account_owner IS NOT NULL THEN 10 ELSE 0 END +
        CASE WHEN c.billing_address_line_1 IS NOT NULL THEN 8 ELSE 0 END +
        CASE WHEN c.website IS NOT NULL THEN 5 ELSE 0 END +
        EXTRACT(EPOCH FROM (NOW() - c.created_at)) / 86400 * 0.1 as score
    FROM companies c
    WHERE LOWER(TRIM(c.company_name)) IN (SELECT normalized_name FROM duplicate_groups)
)
INSERT INTO company_dedup_analysis (
    company_name,
    keeper_company_id,
    duplicate_company_ids,
    keeper_score,
    duplicate_scores
)
SELECT
    company_name,
    (array_agg(company_id ORDER BY score DESC))[1] as keeper_company_id,
    array_agg(company_id ORDER BY score DESC) as duplicate_company_ids,
    (array_agg(score ORDER BY score DESC))[1] as keeper_score,
    jsonb_agg(jsonb_build_object(
        'company_id', company_id,
        'score', score,
        'invoices', invoice_count,
        'orders', order_count,
        'quotes', quote_count,
        'contacts', contact_count,
        'type', type,
        'created_at', created_at
    ) ORDER BY score DESC) as duplicate_scores
FROM company_scores
GROUP BY company_name;

-- ============================================================================
-- STEP 4: COMPANY DEDUPLICATION - MERGE EXECUTION
-- ============================================================================

DO $$
DECLARE
    analysis_row RECORD;
    v_keeper_id UUID;
    v_duplicate_id UUID;
    v_company_name TEXT;
    v_rows_affected INTEGER;
    duplicate_idx INTEGER;
BEGIN
    -- Loop through each duplicate company group
    FOR analysis_row IN
        SELECT * FROM company_dedup_analysis
    LOOP
        v_keeper_id := analysis_row.keeper_company_id;
        v_company_name := analysis_row.company_name;

        -- Loop through each duplicate (skip first element which is the keeper)
        FOR duplicate_idx IN 2..array_length(analysis_row.duplicate_company_ids, 1)
        LOOP
            v_duplicate_id := analysis_row.duplicate_company_ids[duplicate_idx];

            RAISE NOTICE 'Merging company: % (%) into keeper: %', v_company_name, v_duplicate_id, v_keeper_id;

            -- Migrate all foreign key relationships

            -- company_consumables
            UPDATE company_consumables SET company_id = v_keeper_id WHERE company_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'migrate', v_company_name, v_duplicate_id, v_keeper_id, 'company_consumables', v_rows_affected, NOW());
            END IF;

            -- company_distributor_pricing
            UPDATE company_distributor_pricing SET company_id = v_keeper_id WHERE company_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'migrate', v_company_name, v_duplicate_id, v_keeper_id, 'company_distributor_pricing', v_rows_affected, NOW());
            END IF;

            -- company_machine
            UPDATE company_machine SET company_id = v_keeper_id WHERE company_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'migrate', v_company_name, v_duplicate_id, v_keeper_id, 'company_machine', v_rows_affected, NOW());
            END IF;

            -- company_product_catalog
            UPDATE company_product_catalog SET company_id = v_keeper_id WHERE company_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'migrate', v_company_name, v_duplicate_id, v_keeper_id, 'company_product_catalog', v_rows_affected, NOW());
            END IF;

            -- company_product_history
            UPDATE company_product_history SET company_id = v_keeper_id WHERE company_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'migrate', v_company_name, v_duplicate_id, v_keeper_id, 'company_product_history', v_rows_affected, NOW());
            END IF;

            -- company_tools
            UPDATE company_tools SET company_id = v_keeper_id WHERE company_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'migrate', v_company_name, v_duplicate_id, v_keeper_id, 'company_tools', v_rows_affected, NOW());
            END IF;

            -- contact_interactions
            UPDATE contact_interactions SET company_id = v_keeper_id WHERE company_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'migrate', v_company_name, v_duplicate_id, v_keeper_id, 'contact_interactions', v_rows_affected, NOW());
            END IF;

            -- contacts (CRITICAL)
            UPDATE contacts SET company_id = v_keeper_id WHERE company_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'migrate', v_company_name, v_duplicate_id, v_keeper_id, 'contacts', v_rows_affected, NOW());
            END IF;

            -- customer_pricing_overrides
            UPDATE customer_pricing_overrides SET company_id = v_keeper_id WHERE company_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'migrate', v_company_name, v_duplicate_id, v_keeper_id, 'customer_pricing_overrides', v_rows_affected, NOW());
            END IF;

            -- distributor_orders
            UPDATE distributor_orders SET company_id = v_keeper_id WHERE company_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'migrate', v_company_name, v_duplicate_id, v_keeper_id, 'distributor_orders', v_rows_affected, NOW());
            END IF;

            -- distributor_users
            UPDATE distributor_users SET company_id = v_keeper_id WHERE company_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'migrate', v_company_name, v_duplicate_id, v_keeper_id, 'distributor_users', v_rows_affected, NOW());
            END IF;

            -- engagement_events
            UPDATE engagement_events SET company_id = v_keeper_id WHERE company_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'migrate', v_company_name, v_duplicate_id, v_keeper_id, 'engagement_events', v_rows_affected, NOW());
            END IF;

            -- invoices (CRITICAL)
            UPDATE invoices SET company_id = v_keeper_id WHERE company_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'migrate', v_company_name, v_duplicate_id, v_keeper_id, 'invoices', v_rows_affected, NOW());
            END IF;

            -- orders (CRITICAL)
            UPDATE orders SET company_id = v_keeper_id WHERE company_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'migrate', v_company_name, v_duplicate_id, v_keeper_id, 'orders', v_rows_affected, NOW());
            END IF;

            -- outbox
            UPDATE outbox SET company_id = v_keeper_id WHERE company_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'migrate', v_company_name, v_duplicate_id, v_keeper_id, 'outbox', v_rows_affected, NOW());
            END IF;

            -- quote_requests
            UPDATE quote_requests SET company_id = v_keeper_id WHERE company_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'migrate', v_company_name, v_duplicate_id, v_keeper_id, 'quote_requests', v_rows_affected, NOW());
            END IF;

            -- quotes (CRITICAL)
            UPDATE quotes SET company_id = v_keeper_id WHERE company_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'migrate', v_company_name, v_duplicate_id, v_keeper_id, 'quotes', v_rows_affected, NOW());
            END IF;

            -- rental_agreements
            UPDATE rental_agreements SET company_id = v_keeper_id WHERE company_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'migrate', v_company_name, v_duplicate_id, v_keeper_id, 'rental_agreements', v_rows_affected, NOW());
            END IF;

            -- reorder_tokens
            UPDATE reorder_tokens SET company_id = v_keeper_id WHERE company_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'migrate', v_company_name, v_duplicate_id, v_keeper_id, 'reorder_tokens', v_rows_affected, NOW());
            END IF;

            -- shipping_addresses
            UPDATE shipping_addresses SET company_id = v_keeper_id WHERE company_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'migrate', v_company_name, v_duplicate_id, v_keeper_id, 'shipping_addresses', v_rows_affected, NOW());
            END IF;

            -- shipping_manifests
            UPDATE shipping_manifests SET company_id = v_keeper_id WHERE company_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'migrate', v_company_name, v_duplicate_id, v_keeper_id, 'shipping_manifests', v_rows_affected, NOW());
            END IF;

            -- subscriptions
            UPDATE subscriptions SET company_id = v_keeper_id WHERE company_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'migrate', v_company_name, v_duplicate_id, v_keeper_id, 'subscriptions', v_rows_affected, NOW());
            END IF;

            -- tasks
            UPDATE tasks SET company_id = v_keeper_id WHERE company_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'migrate', v_company_name, v_duplicate_id, v_keeper_id, 'tasks', v_rows_affected, NOW());
            END IF;

            -- trial_intents
            UPDATE trial_intents SET company_id = v_keeper_id WHERE company_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'migrate', v_company_name, v_duplicate_id, v_keeper_id, 'trial_intents', v_rows_affected, NOW());
            END IF;

            -- activity_tracking (may have company references in multiple columns)
            UPDATE activity_tracking SET prospect_company_id = v_keeper_id WHERE prospect_company_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'migrate', v_company_name, v_duplicate_id, v_keeper_id, 'activity_tracking.prospect_company_id', v_rows_affected, NOW());
            END IF;

            UPDATE activity_tracking SET converted_to_company_id = v_keeper_id WHERE converted_to_company_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'migrate', v_company_name, v_duplicate_id, v_keeper_id, 'activity_tracking.converted_to_company_id', v_rows_affected, NOW());
            END IF;

            -- Merge company data fields (keep most complete data)
            UPDATE companies
            SET
                sage_customer_code = COALESCE(sage_customer_code, (SELECT sage_customer_code FROM companies WHERE company_id = v_duplicate_id)),
                website = COALESCE(website, (SELECT website FROM companies WHERE company_id = v_duplicate_id)),
                account_owner = COALESCE(account_owner, (SELECT account_owner FROM companies WHERE company_id = v_duplicate_id)),
                billing_address_line_1 = COALESCE(billing_address_line_1, (SELECT billing_address_line_1 FROM companies WHERE company_id = v_duplicate_id)),
                billing_address_line_2 = COALESCE(billing_address_line_2, (SELECT billing_address_line_2 FROM companies WHERE company_id = v_duplicate_id)),
                billing_city = COALESCE(billing_city, (SELECT billing_city FROM companies WHERE company_id = v_duplicate_id)),
                billing_postal_code = COALESCE(billing_postal_code, (SELECT billing_postal_code FROM companies WHERE company_id = v_duplicate_id)),
                billing_country = COALESCE(billing_country, (SELECT billing_country FROM companies WHERE company_id = v_duplicate_id)),
                phone = COALESCE(phone, (SELECT phone FROM companies WHERE company_id = v_duplicate_id)),
                stripe_customer_id = COALESCE(stripe_customer_id, (SELECT stripe_customer_id FROM companies WHERE company_id = v_duplicate_id)),
                vat_number = COALESCE(vat_number, (SELECT vat_number FROM companies WHERE company_id = v_duplicate_id)),
                updated_at = NOW()
            WHERE company_id = v_keeper_id;

            -- Delete the duplicate company (CASCADE will clean up remaining refs)
            DELETE FROM companies WHERE company_id = v_duplicate_id;
            INSERT INTO company_dedup_log VALUES (gen_random_uuid(), 'delete', v_company_name, v_duplicate_id, v_keeper_id, 'companies', 1, NOW());

        END LOOP;
    END LOOP;

    RAISE NOTICE 'Company deduplication complete!';
END $$;

-- ============================================================================
-- STEP 5: CONTACT DEDUPLICATION - ANALYSIS
-- ============================================================================

-- Identify and score duplicate contacts (same email + same company)
WITH contact_groups AS (
    SELECT
        email,
        company_id,
        COUNT(*) as dup_count
    FROM contacts
    WHERE email IS NOT NULL AND email != ''
    GROUP BY email, company_id
    HAVING COUNT(*) > 1
),
contact_scores AS (
    SELECT
        c.contact_id,
        c.email,
        c.company_id,
        c.full_name,
        c.created_at,
        -- Calculate score
        COALESCE((SELECT COUNT(*) FROM invoices WHERE contact_id = c.contact_id) * 100, 0) +
        COALESCE((SELECT COUNT(*) FROM contact_interactions WHERE contact_id = c.contact_id) * 20, 0) +
        COALESCE((SELECT COUNT(*) FROM engagement_events WHERE contact_id = c.contact_id) * 10, 0) +
        CASE WHEN c.full_name IS NOT NULL AND LENGTH(c.full_name) > 3 THEN 15 ELSE 0 END +
        CASE WHEN c.phone IS NOT NULL THEN 8 ELSE 0 END +
        CASE WHEN c.role IS NOT NULL THEN 5 ELSE 0 END +
        CASE WHEN c.marketing_status IS NOT NULL THEN 5 ELSE 0 END +
        EXTRACT(EPOCH FROM (NOW() - c.created_at)) / 86400 * 0.1 as score
    FROM contacts c
    WHERE (c.email, c.company_id) IN (SELECT email, company_id FROM contact_groups)
)
INSERT INTO contact_dedup_analysis (
    email,
    keeper_contact_id,
    duplicate_contact_ids,
    keeper_company_id,
    keeper_score,
    duplicate_scores
)
SELECT
    email,
    (array_agg(contact_id ORDER BY score DESC))[1] as keeper_contact_id,
    array_agg(contact_id ORDER BY score DESC) as duplicate_contact_ids,
    company_id as keeper_company_id,
    (array_agg(score ORDER BY score DESC))[1] as keeper_score,
    jsonb_agg(jsonb_build_object(
        'contact_id', contact_id,
        'score', score,
        'full_name', full_name,
        'created_at', created_at
    ) ORDER BY score DESC) as duplicate_scores
FROM contact_scores
GROUP BY email, company_id;

-- ============================================================================
-- STEP 6: CONTACT DEDUPLICATION - MERGE EXECUTION
-- ============================================================================

DO $$
DECLARE
    analysis_row RECORD;
    v_keeper_id UUID;
    v_duplicate_id UUID;
    v_email TEXT;
    v_rows_affected INTEGER;
    duplicate_idx INTEGER;
BEGIN
    -- Loop through each duplicate contact group
    FOR analysis_row IN
        SELECT * FROM contact_dedup_analysis
    LOOP
        v_keeper_id := analysis_row.keeper_contact_id;
        v_email := analysis_row.email;

        -- Loop through each duplicate (skip first element which is the keeper)
        FOR duplicate_idx IN 2..array_length(analysis_row.duplicate_contact_ids, 1)
        LOOP
            v_duplicate_id := analysis_row.duplicate_contact_ids[duplicate_idx];

            RAISE NOTICE 'Merging contact: % (%) into keeper: %', v_email, v_duplicate_id, v_keeper_id;

            -- Migrate NO ACTION constraints FIRST

            -- invoices (NO ACTION)
            UPDATE invoices SET contact_id = v_keeper_id WHERE contact_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO contact_dedup_log VALUES (gen_random_uuid(), 'migrate', v_email, v_duplicate_id, v_keeper_id, 'invoices', v_rows_affected, NOW());
            END IF;

            -- quote_requests (NO ACTION)
            UPDATE quote_requests SET contact_id = v_keeper_id WHERE contact_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO contact_dedup_log VALUES (gen_random_uuid(), 'migrate', v_email, v_duplicate_id, v_keeper_id, 'quote_requests', v_rows_affected, NOW());
            END IF;

            -- subscriptions (NO ACTION)
            UPDATE subscriptions SET contact_id = v_keeper_id WHERE contact_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO contact_dedup_log VALUES (gen_random_uuid(), 'migrate', v_email, v_duplicate_id, v_keeper_id, 'subscriptions', v_rows_affected, NOW());
            END IF;

            -- trial_intents (NO ACTION)
            UPDATE trial_intents SET contact_id = v_keeper_id WHERE contact_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO contact_dedup_log VALUES (gen_random_uuid(), 'migrate', v_email, v_duplicate_id, v_keeper_id, 'trial_intents', v_rows_affected, NOW());
            END IF;

            -- Migrate CASCADE/SET NULL tables

            -- contact_interactions
            UPDATE contact_interactions SET contact_id = v_keeper_id WHERE contact_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO contact_dedup_log VALUES (gen_random_uuid(), 'migrate', v_email, v_duplicate_id, v_keeper_id, 'contact_interactions', v_rows_affected, NOW());
            END IF;

            -- engagement_events
            UPDATE engagement_events SET contact_id = v_keeper_id WHERE contact_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO contact_dedup_log VALUES (gen_random_uuid(), 'migrate', v_email, v_duplicate_id, v_keeper_id, 'engagement_events', v_rows_affected, NOW());
            END IF;

            -- quotes
            UPDATE quotes SET contact_id = v_keeper_id WHERE contact_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO contact_dedup_log VALUES (gen_random_uuid(), 'migrate', v_email, v_duplicate_id, v_keeper_id, 'quotes', v_rows_affected, NOW());
            END IF;

            -- rental_agreements
            UPDATE rental_agreements SET contact_id = v_keeper_id WHERE contact_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO contact_dedup_log VALUES (gen_random_uuid(), 'migrate', v_email, v_duplicate_id, v_keeper_id, 'rental_agreements', v_rows_affected, NOW());
            END IF;

            -- activity_tracking
            UPDATE activity_tracking SET prospect_contact_id = v_keeper_id WHERE prospect_contact_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO contact_dedup_log VALUES (gen_random_uuid(), 'migrate', v_email, v_duplicate_id, v_keeper_id, 'activity_tracking.prospect_contact_id', v_rows_affected, NOW());
            END IF;

            UPDATE activity_tracking SET customer_contact_id = v_keeper_id WHERE customer_contact_id = v_duplicate_id;
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected > 0 THEN
                INSERT INTO contact_dedup_log VALUES (gen_random_uuid(), 'migrate', v_email, v_duplicate_id, v_keeper_id, 'activity_tracking.customer_contact_id', v_rows_affected, NOW());
            END IF;

            -- Merge contact data fields
            UPDATE contacts
            SET
                full_name = COALESCE(full_name, (SELECT full_name FROM contacts WHERE contact_id = v_duplicate_id)),
                first_name = COALESCE(first_name, (SELECT first_name FROM contacts WHERE contact_id = v_duplicate_id)),
                last_name = COALESCE(last_name, (SELECT last_name FROM contacts WHERE contact_id = v_duplicate_id)),
                phone = COALESCE(phone, (SELECT phone FROM contacts WHERE contact_id = v_duplicate_id)),
                role = COALESCE(role, (SELECT role FROM contacts WHERE contact_id = v_duplicate_id)),
                marketing_status = COALESCE(marketing_status, (SELECT marketing_status FROM contacts WHERE contact_id = v_duplicate_id)),
                zoho_contact_id = COALESCE(zoho_contact_id, (SELECT zoho_contact_id FROM contacts WHERE contact_id = v_duplicate_id)),
                updated_at = NOW()
            WHERE contact_id = v_keeper_id;

            -- Delete the duplicate contact
            DELETE FROM contacts WHERE contact_id = v_duplicate_id;
            INSERT INTO contact_dedup_log VALUES (gen_random_uuid(), 'delete', v_email, v_duplicate_id, v_keeper_id, 'contacts', 1, NOW());

        END LOOP;
    END LOOP;

    RAISE NOTICE 'Contact deduplication complete!';
END $$;

-- ============================================================================
-- STEP 7: POST-DEDUPLICATION VALIDATION
-- ============================================================================

DO $$
DECLARE
    v_duplicate_companies INTEGER;
    v_duplicate_contacts INTEGER;
    v_orphaned_invoices INTEGER;
    v_orphaned_contacts INTEGER;
BEGIN
    -- Check for remaining duplicate companies
    SELECT COUNT(*) INTO v_duplicate_companies
    FROM (
        SELECT LOWER(TRIM(company_name))
        FROM companies
        GROUP BY LOWER(TRIM(company_name))
        HAVING COUNT(*) > 1
    ) dups;

    -- Check for remaining duplicate contacts
    SELECT COUNT(*) INTO v_duplicate_contacts
    FROM (
        SELECT email, company_id
        FROM contacts
        WHERE email IS NOT NULL AND email != ''
        GROUP BY email, company_id
        HAVING COUNT(*) > 1
    ) dups;

    -- Check for orphaned invoices
    SELECT COUNT(*) INTO v_orphaned_invoices
    FROM invoices i
    WHERE NOT EXISTS (SELECT 1 FROM companies WHERE company_id = i.company_id);

    -- Check for orphaned contacts
    SELECT COUNT(*) INTO v_orphaned_contacts
    FROM contacts c
    WHERE NOT EXISTS (SELECT 1 FROM companies WHERE company_id = c.company_id);

    RAISE NOTICE '=== DEDUPLICATION VALIDATION ===';
    RAISE NOTICE 'Duplicate companies remaining: %', v_duplicate_companies;
    RAISE NOTICE 'Duplicate contacts remaining: %', v_duplicate_contacts;
    RAISE NOTICE 'Orphaned invoices: %', v_orphaned_invoices;
    RAISE NOTICE 'Orphaned contacts: %', v_orphaned_contacts;

    IF v_orphaned_invoices > 0 OR v_orphaned_contacts > 0 THEN
        RAISE EXCEPTION 'Validation failed: Found orphaned records!';
    END IF;

    RAISE NOTICE 'Validation PASSED - No orphaned records found!';
END $$;

-- ============================================================================
-- STEP 8: SUMMARY REPORT
-- ============================================================================

DO $$
DECLARE
    v_companies_removed INTEGER;
    v_contacts_removed INTEGER;
    v_total_migrations INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_companies_removed FROM company_dedup_log WHERE action_type = 'delete';
    SELECT COUNT(*) INTO v_contacts_removed FROM contact_dedup_log WHERE action_type = 'delete';
    SELECT COUNT(*) INTO v_total_migrations FROM company_dedup_log WHERE action_type = 'migrate';

    RAISE NOTICE '';
    RAISE NOTICE '=== DEDUPLICATION SUMMARY ===';
    RAISE NOTICE 'Companies deduplicated: %', v_companies_removed;
    RAISE NOTICE 'Contacts deduplicated: %', v_contacts_removed;
    RAISE NOTICE 'Total table migrations: %', v_total_migrations;
    RAISE NOTICE '';
    RAISE NOTICE 'Backup tables created:';
    RAISE NOTICE '  - companies_backup_20260126';
    RAISE NOTICE '  - contacts_backup_20260126';
    RAISE NOTICE '  - invoices_backup_20260126';
    RAISE NOTICE '';
    RAISE NOTICE 'Audit tables created:';
    RAISE NOTICE '  - company_dedup_analysis';
    RAISE NOTICE '  - company_dedup_log';
    RAISE NOTICE '  - contact_dedup_analysis';
    RAISE NOTICE '  - contact_dedup_log';
    RAISE NOTICE '';
    RAISE NOTICE 'Deduplication completed successfully!';
END $$;

COMMIT;
