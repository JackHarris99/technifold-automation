0) [
  {
    "extname": "pg_graphql",
    "extversion": "1.5.11"
  },
  {
    "extname": "pg_stat_statements",
    "extversion": "1.11"
  },
  {
    "extname": "pgcrypto",
    "extversion": "1.3"
  },
  {
    "extname": "plpgsql",
    "extversion": "1.0"
  },
  {
    "extname": "supabase_vault",
    "extversion": "0.3.1"
  },
  {
    "extname": "uuid-ossp",
    "extversion": "1.1"
  }
]

1) ERROR:  42P01: relation "public.%I" does not exist
LINE 7:   (select count(*) from public."%I")   -- this placeholder won't work directly

1 (B) ) ERROR:  22023: unrecognized format() type specifier " "
HINT:  For a single "%" use "%%".
CONTEXT:  PL/pgSQL function inline_code_block line 12 at EXECUTE

2) [
  {
    "table_name": "asset_models",
    "column_name": "model_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "column_comment": null
  },
  {
    "table_name": "asset_models",
    "column_name": "level",
    "data_type": "smallint",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "asset_models",
    "column_name": "parent_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "asset_models",
    "column_name": "slug",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "asset_models",
    "column_name": "display_name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "asset_models",
    "column_name": "brand",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "asset_models",
    "column_name": "model",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "asset_models",
    "column_name": "specs",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'{}'::jsonb",
    "column_comment": null
  },
  {
    "table_name": "asset_models",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "asset_models",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "campaigns",
    "column_name": "campaign_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "column_comment": null
  },
  {
    "table_name": "campaigns",
    "column_name": "campaign_key",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "campaigns",
    "column_name": "name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "campaigns",
    "column_name": "status",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": "'draft'::text",
    "column_comment": null
  },
  {
    "table_name": "campaigns",
    "column_name": "target_level",
    "data_type": "smallint",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "campaigns",
    "column_name": "target_model_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "campaigns",
    "column_name": "offer_key",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "campaigns",
    "column_name": "created_by",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "campaigns",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "catalog_products",
    "column_name": "product_code",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "catalog_products",
    "column_name": "description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "catalog_products",
    "column_name": "category",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "companies",
    "column_name": "company_id",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "companies",
    "column_name": "company_name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "companies",
    "column_name": "website",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "companies",
    "column_name": "country",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "companies",
    "column_name": "type",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": "'customer'::text",
    "column_comment": null
  },
  {
    "table_name": "companies",
    "column_name": "source",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": "'sage_import'::text",
    "column_comment": null
  },
  {
    "table_name": "companies",
    "column_name": "account_opened_at",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "companies",
    "column_name": "first_invoice_at",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "companies",
    "column_name": "last_invoice_at",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "companies",
    "column_name": "vat_number",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "companies",
    "column_name": "eori_number",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "companies",
    "column_name": "company_reg_number",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "companies",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "companies",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "companies",
    "column_name": "portal_token",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": "gen_random_uuid()",
    "column_comment": null
  },
  {
    "table_name": "companies",
    "column_name": "company_uuid",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "companies",
    "column_name": "category",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "companies",
    "column_name": "stripe_customer_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "companies",
    "column_name": "zoho_account_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "companies",
    "column_name": "account_owner",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": "Sales rep assigned to this account (rep_a, rep_b, rep_c)"
  },
  {
    "table_name": "company_beliefs",
    "column_name": "belief_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "column_comment": null
  },
  {
    "table_name": "company_beliefs",
    "column_name": "company_id",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "company_beliefs",
    "column_name": "model_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "company_beliefs",
    "column_name": "confidence",
    "data_type": "smallint",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "company_beliefs",
    "column_name": "source",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "company_beliefs",
    "column_name": "contact_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "company_beliefs",
    "column_name": "evidence",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'{}'::jsonb",
    "column_comment": null
  },
  {
    "table_name": "company_beliefs",
    "column_name": "noted_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "company_beliefs",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "company_machine",
    "column_name": "company_machine_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "column_comment": null
  },
  {
    "table_name": "company_machine",
    "column_name": "company_id",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "company_machine",
    "column_name": "machine_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "company_machine",
    "column_name": "source",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": "'self_report'::text",
    "column_comment": null
  },
  {
    "table_name": "company_machine",
    "column_name": "confirmed",
    "data_type": "boolean",
    "is_nullable": "NO",
    "column_default": "false",
    "column_comment": null
  },
  {
    "table_name": "company_machine",
    "column_name": "confidence_score",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "company_machine",
    "column_name": "notes",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "company_machine",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "company_machine",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "company_tool",
    "column_name": "company_id",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "company_tool",
    "column_name": "tool_code",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "company_tool",
    "column_name": "first_seen_at",
    "data_type": "date",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "company_tool",
    "column_name": "last_seen_at",
    "data_type": "date",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "company_tool",
    "column_name": "total_units",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "contact_interests",
    "column_name": "contact_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "contact_interests",
    "column_name": "interest_code",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "contacts",
    "column_name": "contact_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "column_comment": null
  },
  {
    "table_name": "contacts",
    "column_name": "company_id",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "contacts",
    "column_name": "first_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "contacts",
    "column_name": "last_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "contacts",
    "column_name": "full_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "contacts",
    "column_name": "email",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "contacts",
    "column_name": "phone",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "contacts",
    "column_name": "role",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "contacts",
    "column_name": "source",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": "'sage_import'::text",
    "column_comment": null
  },
  {
    "table_name": "contacts",
    "column_name": "status",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": "'active'::text",
    "column_comment": null
  },
  {
    "table_name": "contacts",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "contacts",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "contacts",
    "column_name": "company_uuid",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "contacts",
    "column_name": "token",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "contacts",
    "column_name": "marketing_status",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "contacts",
    "column_name": "gdpr_consent_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "email_events",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "column_comment": null
  },
  {
    "table_name": "email_events",
    "column_name": "company_id",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "email_events",
    "column_name": "contact_email",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "email_events",
    "column_name": "event_type",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "email_events",
    "column_name": "campaign_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "email_events",
    "column_name": "provider_message_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "email_events",
    "column_name": "meta",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "email_events",
    "column_name": "occurred_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "email_events",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "engagement_events",
    "column_name": "event_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "column_comment": null
  },
  {
    "table_name": "engagement_events",
    "column_name": "company_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "engagement_events",
    "column_name": "contact_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "engagement_events",
    "column_name": "occurred_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "engagement_events",
    "column_name": "event_type",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "engagement_events",
    "column_name": "source",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "engagement_events",
    "column_name": "url",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "engagement_events",
    "column_name": "meta",
    "data_type": "jsonb",
    "is_nullable": "NO",
    "column_default": "'{}'::jsonb",
    "column_comment": null
  },
  {
    "table_name": "engagement_events",
    "column_name": "source_event_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "engagement_events",
    "column_name": "event_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "engagement_events",
    "column_name": "campaign_key",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "engagement_events",
    "column_name": "offer_key",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "engagement_events",
    "column_name": "value",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "engagement_events",
    "column_name": "currency",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "import_rejects_companies",
    "column_name": "customer_code",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "import_rejects_companies",
    "column_name": "reason",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "import_rejects_companies",
    "column_name": "snapshot",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "import_rejects_companies",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "interest_lookup",
    "column_name": "interest_code",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "interest_lookup",
    "column_name": "label",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "machine_solution",
    "column_name": "machine_solution_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "column_comment": null
  },
  {
    "table_name": "machine_solution",
    "column_name": "machine_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "machine_solution",
    "column_name": "solution_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "machine_solution",
    "column_name": "relevance_rank",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "1",
    "column_comment": null
  },
  {
    "table_name": "machine_solution",
    "column_name": "notes",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "machine_solution_problem",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "column_comment": null
  },
  {
    "table_name": "machine_solution_problem",
    "column_name": "machine_solution_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "machine_solution_problem",
    "column_name": "problem_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "machine_solution_problem",
    "column_name": "pitch_headline",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "machine_solution_problem",
    "column_name": "pitch_detail",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "machine_solution_problem",
    "column_name": "action_cta",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "machine_solution_problem",
    "column_name": "relevance_rank",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "machine_solution_problem",
    "column_name": "is_primary_pitch",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false",
    "column_comment": null
  },
  {
    "table_name": "machine_solution_problem",
    "column_name": "sku_code",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "machines",
    "column_name": "machine_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "column_comment": null
  },
  {
    "table_name": "machines",
    "column_name": "brand",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "machines",
    "column_name": "model",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "machines",
    "column_name": "display_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "machines",
    "column_name": "type",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "machines",
    "column_name": "shaft_size_mm",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "machines",
    "column_name": "country",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "machines",
    "column_name": "oem_url",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "machines",
    "column_name": "description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "machines",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "machines",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "machines",
    "column_name": "slug",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "machines",
    "column_name": "type_canonical",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "manual_people_company_map",
    "column_name": "org_name_norm",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "manual_people_company_map",
    "column_name": "target_company_id",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "order_items",
    "column_name": "order_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "order_items",
    "column_name": "product_code",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "order_items",
    "column_name": "description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "order_items",
    "column_name": "qty",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "order_items",
    "column_name": "unit_price",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "order_items",
    "column_name": "line_total",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "orders",
    "column_name": "order_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "column_comment": null
  },
  {
    "table_name": "orders",
    "column_name": "company_id",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "orders",
    "column_name": "currency",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": "'GBP'::text",
    "column_comment": null
  },
  {
    "table_name": "orders",
    "column_name": "payment_channel",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "orders",
    "column_name": "payment_status",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": "'unpaid'::text",
    "column_comment": null
  },
  {
    "table_name": "orders",
    "column_name": "fulfillment_status",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": "'hold_unpaid'::text",
    "column_comment": null
  },
  {
    "table_name": "orders",
    "column_name": "subtotal",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": "0",
    "column_comment": null
  },
  {
    "table_name": "orders",
    "column_name": "shipping_amount",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": "0",
    "column_comment": null
  },
  {
    "table_name": "orders",
    "column_name": "tax_amount",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": "0",
    "column_comment": null
  },
  {
    "table_name": "orders",
    "column_name": "total_amount",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": "0",
    "column_comment": null
  },
  {
    "table_name": "orders",
    "column_name": "shipping_country",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "orders",
    "column_name": "shipping_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "orders",
    "column_name": "shipping_company",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "orders",
    "column_name": "shipping_address1",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "orders",
    "column_name": "shipping_address2",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "orders",
    "column_name": "shipping_city",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "orders",
    "column_name": "shipping_postcode",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "orders",
    "column_name": "stripe_checkout_session_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "orders",
    "column_name": "stripe_payment_intent_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "orders",
    "column_name": "books_customer_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "orders",
    "column_name": "books_invoice_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "orders",
    "column_name": "books_payment_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "orders",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "orders",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "outbox",
    "column_name": "job_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "column_comment": null
  },
  {
    "table_name": "outbox",
    "column_name": "job_type",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "outbox",
    "column_name": "status",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": "'pending'::text",
    "column_comment": null
  },
  {
    "table_name": "outbox",
    "column_name": "attempts",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": "0",
    "column_comment": null
  },
  {
    "table_name": "outbox",
    "column_name": "max_attempts",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": "3",
    "column_comment": null
  },
  {
    "table_name": "outbox",
    "column_name": "payload",
    "data_type": "jsonb",
    "is_nullable": "NO",
    "column_default": "'{}'::jsonb",
    "column_comment": null
  },
  {
    "table_name": "outbox",
    "column_name": "company_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "outbox",
    "column_name": "order_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "outbox",
    "column_name": "last_error",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "outbox",
    "column_name": "locked_until",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "outbox",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "outbox",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "outbox",
    "column_name": "completed_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "problems",
    "column_name": "problem_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "column_comment": null
  },
  {
    "table_name": "problems",
    "column_name": "title",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "problems",
    "column_name": "slug",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "problems",
    "column_name": "description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "problems",
    "column_name": "is_hero",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false",
    "column_comment": null
  },
  {
    "table_name": "problems",
    "column_name": "seo_keywords",
    "data_type": "ARRAY",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "problems",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "product_skus",
    "column_name": "sku_code",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "product_skus",
    "column_name": "sku_name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "product_skus",
    "column_name": "sku_description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "product_skus",
    "column_name": "setup_notes_general",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "product_skus",
    "column_name": "recommended_settings",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "product_skus",
    "column_name": "media_urls",
    "data_type": "ARRAY",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "product_skus",
    "column_name": "consumable_skus",
    "data_type": "ARRAY",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "product_skus",
    "column_name": "active",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "true",
    "column_comment": null
  },
  {
    "table_name": "product_skus",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "product_skus",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "products",
    "column_name": "product_code",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "products",
    "column_name": "description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "products",
    "column_name": "type",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": "'part'::text",
    "column_comment": null
  },
  {
    "table_name": "products",
    "column_name": "category",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "products",
    "column_name": "active",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "true",
    "column_comment": null
  },
  {
    "table_name": "products",
    "column_name": "is_marketable",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false",
    "column_comment": null
  },
  {
    "table_name": "products",
    "column_name": "is_reminder_eligible",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false",
    "column_comment": null
  },
  {
    "table_name": "products",
    "column_name": "price",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "products",
    "column_name": "currency",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": "'GBP'::text",
    "column_comment": null
  },
  {
    "table_name": "products",
    "column_name": "site_visibility",
    "data_type": "ARRAY",
    "is_nullable": "YES",
    "column_default": "'{technifold}'::text[]",
    "column_comment": null
  },
  {
    "table_name": "products",
    "column_name": "extra",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'{}'::jsonb",
    "column_comment": null
  },
  {
    "table_name": "review_unresolved_people",
    "column_name": "person_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "review_unresolved_people",
    "column_name": "person_organisation",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "review_unresolved_people",
    "column_name": "email_primary",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "review_unresolved_people",
    "column_name": "phone_primary",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "review_unresolved_people",
    "column_name": "person_country_of_address",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "review_unresolved_people",
    "column_name": "org_name_norm",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "review_unresolved_people",
    "column_name": "email_domain",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "sales",
    "column_name": "sale_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "column_comment": null
  },
  {
    "table_name": "sales",
    "column_name": "company_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "sales",
    "column_name": "invoice_number",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "sales",
    "column_name": "product_code",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "sales",
    "column_name": "quantity",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "sales",
    "column_name": "txn_date",
    "data_type": "date",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "send_queue",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "column_comment": null
  },
  {
    "table_name": "send_queue",
    "column_name": "company_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "send_queue",
    "column_name": "portal_token",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "send_queue",
    "column_name": "cadence",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "send_queue",
    "column_name": "payload",
    "data_type": "jsonb",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "send_queue",
    "column_name": "scheduled_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "send_queue",
    "column_name": "sent_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "send_queue",
    "column_name": "status",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": "'queued'::text",
    "column_comment": null
  },
  {
    "table_name": "send_queue",
    "column_name": "error",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "shipping_overrides",
    "column_name": "product_code",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "shipping_overrides",
    "column_name": "extra_fee",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "shipping_overrides",
    "column_name": "rule",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "shipping_zones",
    "column_name": "country",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "shipping_zones",
    "column_name": "zone",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "shipping_zones",
    "column_name": "base_rate",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "shipping_zones",
    "column_name": "free_threshold",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "solution_problem",
    "column_name": "solution_problem_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "column_comment": null
  },
  {
    "table_name": "solution_problem",
    "column_name": "solution_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "solution_problem",
    "column_name": "problem_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "solution_problem",
    "column_name": "pitch_headline",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "solution_problem",
    "column_name": "pitch_detail",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "solution_problem",
    "column_name": "action_cta",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": "'Send me details for my machine'::text",
    "column_comment": null
  },
  {
    "table_name": "solution_problem",
    "column_name": "relevance_rank",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "1",
    "column_comment": null
  },
  {
    "table_name": "solution_problem",
    "column_name": "marketing_mode",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": "'problem_to_solution'::text",
    "column_comment": null
  },
  {
    "table_name": "solutions",
    "column_name": "solution_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "column_comment": null
  },
  {
    "table_name": "solutions",
    "column_name": "name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "solutions",
    "column_name": "core_benefit",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "solutions",
    "column_name": "long_description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "solutions",
    "column_name": "media_urls",
    "data_type": "ARRAY",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "solutions",
    "column_name": "active",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "true",
    "column_comment": null
  },
  {
    "table_name": "solutions",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "stg_companies",
    "column_name": "company_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_companies",
    "column_name": "company_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_companies",
    "column_name": "website",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_companies",
    "column_name": "country",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_companies",
    "column_name": "category",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_companies",
    "column_name": "type",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_companies",
    "column_name": "source",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_companies",
    "column_name": "vat_number",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_companies",
    "column_name": "eori_number",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_companies",
    "column_name": "company_reg_number",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_companies",
    "column_name": "account_opened_at",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_companies",
    "column_name": "first_invoice_at",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_companies",
    "column_name": "last_invoice_at",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_contacts",
    "column_name": "company_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_contacts",
    "column_name": "full_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_contacts",
    "column_name": "email",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_contacts",
    "column_name": "phone",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_contacts",
    "column_name": "source",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_contacts",
    "column_name": "status",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_contacts",
    "column_name": "marketing_status",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_contacts",
    "column_name": "gdpr_consent_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_contacts",
    "column_name": "role",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_contacts",
    "column_name": "first_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_contacts",
    "column_name": "last_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_customers_raw",
    "column_name": "customer_code",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_customers_raw",
    "column_name": "company_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_customers_raw",
    "column_name": "contact_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_customers_raw",
    "column_name": "phone",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_customers_raw",
    "column_name": "vat_number",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_customers_raw",
    "column_name": "eori_number",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_customers_raw",
    "column_name": "company_reg_number",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_customers_raw",
    "column_name": "email_primary",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_customers_raw",
    "column_name": "email_secondary",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_customers_raw",
    "column_name": "email_tertiary",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_customers_raw",
    "column_name": "website",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_customers_raw",
    "column_name": "account_opened",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_customers_raw",
    "column_name": "first_invoice",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_customers_raw",
    "column_name": "last_invoice",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_customers_raw",
    "column_name": "customer_type",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_pipedrive_orgs",
    "column_name": "organisation_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_pipedrive_orgs",
    "column_name": "organisation_labels",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_pipedrive_orgs",
    "column_name": "organisation_address",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_pipedrive_orgs",
    "column_name": "uploaded_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "stg_pipedrive_people",
    "column_name": "person_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_pipedrive_people",
    "column_name": "person_labels",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_pipedrive_people",
    "column_name": "person_organisation",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_pipedrive_people",
    "column_name": "person_email_work",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_pipedrive_people",
    "column_name": "person_email_home",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_pipedrive_people",
    "column_name": "person_email_other",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_pipedrive_people",
    "column_name": "person_phone_work",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_pipedrive_people",
    "column_name": "person_phone_home",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_pipedrive_people",
    "column_name": "person_phone_mobile",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_pipedrive_people",
    "column_name": "person_phone_other",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_pipedrive_people",
    "column_name": "person_country_of_address",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_pipedrive_people",
    "column_name": "uploaded_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "column_comment": null
  },
  {
    "table_name": "stg_products_detailed_raw",
    "column_name": "product_code",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_products_detailed_raw",
    "column_name": "description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_products_detailed_raw",
    "column_name": "sales_price",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_products_detailed_raw",
    "column_name": "cost_price",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_products_detailed_raw",
    "column_name": "product_group",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_products_detailed_raw",
    "column_name": "product_group_detail",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_sales_raw",
    "column_name": "customer_code",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_sales_raw",
    "column_name": "invoice_number",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_sales_raw",
    "column_name": "purchase_date",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_sales_raw",
    "column_name": "product_code",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_sales_raw",
    "column_name": "product_quantity",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_tool_consumable_raw",
    "column_name": "tool_code",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "stg_tool_consumable_raw",
    "column_name": "consumable_code",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "tool_consumable_map",
    "column_name": "tool_code",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "tool_consumable_map",
    "column_name": "consumable_code",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_campaign_interactions",
    "column_name": "occurred_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_campaign_interactions",
    "column_name": "company_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_campaign_interactions",
    "column_name": "contact_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_campaign_interactions",
    "column_name": "event_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_campaign_interactions",
    "column_name": "campaign_key",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_campaign_interactions",
    "column_name": "offer_key",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_campaign_interactions",
    "column_name": "url",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_campaign_interactions",
    "column_name": "meta",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_campaign_interactions",
    "column_name": "value",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_campaign_interactions",
    "column_name": "currency",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_company_interest_summary",
    "column_name": "company_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_company_interest_summary",
    "column_name": "interest_codes",
    "data_type": "ARRAY",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_company_interest_summary",
    "column_name": "has_technifold_interest",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_company_interest_summary",
    "column_name": "has_creasestream_interest",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_company_interest_summary",
    "column_name": "has_technicrease_interest",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_knowledge_confirmation_queue",
    "column_name": "belief_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_knowledge_confirmation_queue",
    "column_name": "company_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_knowledge_confirmation_queue",
    "column_name": "company_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_knowledge_confirmation_queue",
    "column_name": "model_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_knowledge_confirmation_queue",
    "column_name": "model_display_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_knowledge_confirmation_queue",
    "column_name": "model_level",
    "data_type": "smallint",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_knowledge_confirmation_queue",
    "column_name": "confidence",
    "data_type": "smallint",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_knowledge_confirmation_queue",
    "column_name": "source",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_knowledge_confirmation_queue",
    "column_name": "contact_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_knowledge_confirmation_queue",
    "column_name": "evidence",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_knowledge_confirmation_queue",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_knowledge_confirmation_queue",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_machine_solution_problem_full",
    "column_name": "machine_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_machine_solution_problem_full",
    "column_name": "machine_brand",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_machine_solution_problem_full",
    "column_name": "machine_model",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_machine_solution_problem_full",
    "column_name": "machine_display_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_machine_solution_problem_full",
    "column_name": "machine_type",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_machine_solution_problem_full",
    "column_name": "machine_slug",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_machine_solution_problem_full",
    "column_name": "solution_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_machine_solution_problem_full",
    "column_name": "solution_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_machine_solution_problem_full",
    "column_name": "solution_core_benefit",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_machine_solution_problem_full",
    "column_name": "solution_long_description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_machine_solution_problem_full",
    "column_name": "solution_media_urls",
    "data_type": "ARRAY",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_machine_solution_problem_full",
    "column_name": "problem_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_machine_solution_problem_full",
    "column_name": "problem_title",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_machine_solution_problem_full",
    "column_name": "problem_description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_machine_solution_problem_full",
    "column_name": "pitch_headline",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_machine_solution_problem_full",
    "column_name": "pitch_detail",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_machine_solution_problem_full",
    "column_name": "action_cta",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_machine_solution_problem_full",
    "column_name": "pitch_relevance_rank",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_machine_solution_problem_full",
    "column_name": "machine_solution_rank",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "v_machine_solution_problem_full",
    "column_name": "machine_solution_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_by_past_consumables",
    "column_name": "company_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_by_past_consumables",
    "column_name": "consumable_code",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_by_past_consumables",
    "column_name": "consumable_description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_by_past_consumables",
    "column_name": "price",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_by_past_consumables",
    "column_name": "last_purchased_at",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_by_past_consumables",
    "column_name": "lifetime_units",
    "data_type": "bigint",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_by_tools",
    "column_name": "company_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_by_tools",
    "column_name": "tool_code",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_by_tools",
    "column_name": "consumable_code",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_by_tools",
    "column_name": "consumable_description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_by_tools",
    "column_name": "price",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_by_tools",
    "column_name": "last_purchased_at",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_company_consumable_needs",
    "column_name": "company_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_company_consumable_needs",
    "column_name": "consumable_code",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_company_consumable_needs",
    "column_name": "consumable_description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_company_consumable_needs",
    "column_name": "price",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_company_consumable_needs",
    "column_name": "last_purchased_at",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_company_consumable_payload",
    "column_name": "company_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_company_consumable_payload",
    "column_name": "company_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_company_consumable_payload",
    "column_name": "reorder_items",
    "data_type": "json",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_company_consumable_payload",
    "column_name": "by_tool_tabs",
    "data_type": "json",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_due_consumable_reminders_180",
    "column_name": "company_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_due_consumable_reminders_180",
    "column_name": "consumable_code",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_due_consumable_reminders_180",
    "column_name": "consumable_description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_due_consumable_reminders_180",
    "column_name": "price",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_due_consumable_reminders_180",
    "column_name": "last_purchased_at",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_due_consumable_reminders_365",
    "column_name": "company_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_due_consumable_reminders_365",
    "column_name": "consumable_code",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_due_consumable_reminders_365",
    "column_name": "consumable_description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_due_consumable_reminders_365",
    "column_name": "price",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_due_consumable_reminders_365",
    "column_name": "last_purchased_at",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_due_consumable_reminders_90",
    "column_name": "company_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_due_consumable_reminders_90",
    "column_name": "consumable_code",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_due_consumable_reminders_90",
    "column_name": "consumable_description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_due_consumable_reminders_90",
    "column_name": "price",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  },
  {
    "table_name": "vw_due_consumable_reminders_90",
    "column_name": "last_purchased_at",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null,
    "column_comment": null
  }
]

3) [
  {
    "table_name": "asset_models",
    "constraint_name": "2200_71350_10_not_null",
    "check_clause": "updated_at IS NOT NULL"
  },
  {
    "table_name": "asset_models",
    "constraint_name": "2200_71350_1_not_null",
    "check_clause": "model_id IS NOT NULL"
  },
  {
    "table_name": "asset_models",
    "constraint_name": "2200_71350_2_not_null",
    "check_clause": "level IS NOT NULL"
  },
  {
    "table_name": "asset_models",
    "constraint_name": "2200_71350_4_not_null",
    "check_clause": "slug IS NOT NULL"
  },
  {
    "table_name": "asset_models",
    "constraint_name": "2200_71350_5_not_null",
    "check_clause": "display_name IS NOT NULL"
  },
  {
    "table_name": "asset_models",
    "constraint_name": "2200_71350_9_not_null",
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_name": "asset_models",
    "constraint_name": "asset_models_level_check",
    "check_clause": "((level >= 1) AND (level <= 3))"
  },
  {
    "table_name": "campaigns",
    "constraint_name": "2200_71442_1_not_null",
    "check_clause": "campaign_id IS NOT NULL"
  },
  {
    "table_name": "campaigns",
    "constraint_name": "2200_71442_2_not_null",
    "check_clause": "campaign_key IS NOT NULL"
  },
  {
    "table_name": "campaigns",
    "constraint_name": "2200_71442_3_not_null",
    "check_clause": "name IS NOT NULL"
  },
  {
    "table_name": "campaigns",
    "constraint_name": "2200_71442_4_not_null",
    "check_clause": "status IS NOT NULL"
  },
  {
    "table_name": "campaigns",
    "constraint_name": "2200_71442_9_not_null",
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_name": "campaigns",
    "constraint_name": "campaigns_status_check",
    "check_clause": "(status = ANY (ARRAY['draft'::text, 'active'::text, 'paused'::text, 'archived'::text]))"
  },
  {
    "table_name": "companies",
    "constraint_name": "2200_17316_16_not_null",
    "check_clause": "company_uuid IS NOT NULL"
  },
  {
    "table_name": "companies",
    "constraint_name": "2200_17316_1_not_null",
    "check_clause": "company_id IS NOT NULL"
  },
  {
    "table_name": "companies",
    "constraint_name": "2200_17316_2_not_null",
    "check_clause": "company_name IS NOT NULL"
  },
  {
    "table_name": "companies",
    "constraint_name": "companies_category_check",
    "check_clause": "(category = ANY (ARRAY['customer'::text, 'prospect'::text, 'supplier'::text, 'press'::text, 'partner'::text, 'internal'::text]))"
  },
  {
    "table_name": "companies",
    "constraint_name": "companies_type_check",
    "check_clause": "(type = ANY (ARRAY['customer'::text, 'prospect'::text, 'distributor'::text]))"
  },
  {
    "table_name": "company_beliefs",
    "constraint_name": "2200_71392_1_not_null",
    "check_clause": "belief_id IS NOT NULL"
  },
  {
    "table_name": "company_beliefs",
    "constraint_name": "2200_71392_2_not_null",
    "check_clause": "company_id IS NOT NULL"
  },
  {
    "table_name": "company_beliefs",
    "constraint_name": "2200_71392_3_not_null",
    "check_clause": "model_id IS NOT NULL"
  },
  {
    "table_name": "company_beliefs",
    "constraint_name": "2200_71392_4_not_null",
    "check_clause": "confidence IS NOT NULL"
  },
  {
    "table_name": "company_beliefs",
    "constraint_name": "2200_71392_5_not_null",
    "check_clause": "source IS NOT NULL"
  },
  {
    "table_name": "company_beliefs",
    "constraint_name": "2200_71392_8_not_null",
    "check_clause": "noted_at IS NOT NULL"
  },
  {
    "table_name": "company_beliefs",
    "constraint_name": "2200_71392_9_not_null",
    "check_clause": "updated_at IS NOT NULL"
  },
  {
    "table_name": "company_beliefs",
    "constraint_name": "company_beliefs_confidence_check",
    "check_clause": "((confidence >= 1) AND (confidence <= 4))"
  },
  {
    "table_name": "company_machine",
    "constraint_name": "2200_77701_1_not_null",
    "check_clause": "company_machine_id IS NOT NULL"
  },
  {
    "table_name": "company_machine",
    "constraint_name": "2200_77701_2_not_null",
    "check_clause": "company_id IS NOT NULL"
  },
  {
    "table_name": "company_machine",
    "constraint_name": "2200_77701_3_not_null",
    "check_clause": "machine_id IS NOT NULL"
  },
  {
    "table_name": "company_machine",
    "constraint_name": "2200_77701_4_not_null",
    "check_clause": "source IS NOT NULL"
  },
  {
    "table_name": "company_machine",
    "constraint_name": "2200_77701_5_not_null",
    "check_clause": "confirmed IS NOT NULL"
  },
  {
    "table_name": "company_machine",
    "constraint_name": "2200_77701_8_not_null",
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_name": "company_machine",
    "constraint_name": "2200_77701_9_not_null",
    "check_clause": "updated_at IS NOT NULL"
  },
  {
    "table_name": "company_machine",
    "constraint_name": "company_machine_confidence_score_check",
    "check_clause": "((confidence_score >= 1) AND (confidence_score <= 5))"
  },
  {
    "table_name": "company_machine",
    "constraint_name": "company_machine_source_check",
    "check_clause": "(source = ANY (ARRAY['self_report'::text, 'sales_confirmed'::text, 'inferred'::text, 'zoho_import'::text]))"
  },
  {
    "table_name": "company_tool",
    "constraint_name": "2200_18116_1_not_null",
    "check_clause": "company_id IS NOT NULL"
  },
  {
    "table_name": "company_tool",
    "constraint_name": "2200_18116_2_not_null",
    "check_clause": "tool_code IS NOT NULL"
  },
  {
    "table_name": "company_tool",
    "constraint_name": "2200_18116_3_not_null",
    "check_clause": "first_seen_at IS NOT NULL"
  },
  {
    "table_name": "company_tool",
    "constraint_name": "2200_18116_4_not_null",
    "check_clause": "last_seen_at IS NOT NULL"
  },
  {
    "table_name": "company_tool",
    "constraint_name": "2200_18116_5_not_null",
    "check_clause": "total_units IS NOT NULL"
  },
  {
    "table_name": "contact_interests",
    "constraint_name": "2200_45155_1_not_null",
    "check_clause": "contact_id IS NOT NULL"
  },
  {
    "table_name": "contact_interests",
    "constraint_name": "2200_45155_2_not_null",
    "check_clause": "interest_code IS NOT NULL"
  },
  {
    "table_name": "contacts",
    "constraint_name": "2200_17328_13_not_null",
    "check_clause": "company_uuid IS NOT NULL"
  },
  {
    "table_name": "contacts",
    "constraint_name": "2200_17328_1_not_null",
    "check_clause": "contact_id IS NOT NULL"
  },
  {
    "table_name": "contacts",
    "constraint_name": "2200_17328_2_not_null",
    "check_clause": "company_id IS NOT NULL"
  },
  {
    "table_name": "contacts",
    "constraint_name": "contacts_marketing_status_check",
    "check_clause": "(marketing_status = ANY (ARRAY['subscribed'::text, 'unsubscribed'::text, 'pending'::text]))"
  },
  {
    "table_name": "contacts",
    "constraint_name": "contacts_status_check",
    "check_clause": "(status = ANY (ARRAY['active'::text, 'former'::text, 'unknown'::text]))"
  },
  {
    "table_name": "contacts",
    "constraint_name": "email_or_phone_chk",
    "check_clause": "((email IS NOT NULL) OR (phone IS NOT NULL))"
  },
  {
    "table_name": "email_events",
    "constraint_name": "2200_41618_1_not_null",
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_name": "email_events",
    "constraint_name": "2200_41618_2_not_null",
    "check_clause": "company_id IS NOT NULL"
  },
  {
    "table_name": "email_events",
    "constraint_name": "2200_41618_3_not_null",
    "check_clause": "contact_email IS NOT NULL"
  },
  {
    "table_name": "email_events",
    "constraint_name": "2200_41618_4_not_null",
    "check_clause": "event_type IS NOT NULL"
  },
  {
    "table_name": "email_events",
    "constraint_name": "2200_41618_8_not_null",
    "check_clause": "occurred_at IS NOT NULL"
  },
  {
    "table_name": "email_events",
    "constraint_name": "2200_41618_9_not_null",
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_name": "email_events",
    "constraint_name": "email_events_event_type_check",
    "check_clause": "(event_type = ANY (ARRAY['sent'::text, 'open'::text, 'click'::text, 'bounce'::text, 'unsubscribe'::text]))"
  },
  {
    "table_name": "engagement_events",
    "constraint_name": "2200_45216_1_not_null",
    "check_clause": "event_id IS NOT NULL"
  },
  {
    "table_name": "engagement_events",
    "constraint_name": "2200_45216_4_not_null",
    "check_clause": "occurred_at IS NOT NULL"
  },
  {
    "table_name": "engagement_events",
    "constraint_name": "2200_45216_5_not_null",
    "check_clause": "event_type IS NOT NULL"
  },
  {
    "table_name": "engagement_events",
    "constraint_name": "2200_45216_8_not_null",
    "check_clause": "meta IS NOT NULL"
  },
  {
    "table_name": "interest_lookup",
    "constraint_name": "2200_45148_1_not_null",
    "check_clause": "interest_code IS NOT NULL"
  },
  {
    "table_name": "machine_solution",
    "constraint_name": "2200_77039_1_not_null",
    "check_clause": "machine_solution_id IS NOT NULL"
  },
  {
    "table_name": "machine_solution",
    "constraint_name": "2200_77039_2_not_null",
    "check_clause": "machine_id IS NOT NULL"
  },
  {
    "table_name": "machine_solution",
    "constraint_name": "2200_77039_3_not_null",
    "check_clause": "solution_id IS NOT NULL"
  },
  {
    "table_name": "machine_solution_problem",
    "constraint_name": "2200_77244_1_not_null",
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_name": "machine_solution_problem",
    "constraint_name": "2200_77244_2_not_null",
    "check_clause": "machine_solution_id IS NOT NULL"
  },
  {
    "table_name": "machine_solution_problem",
    "constraint_name": "2200_77244_3_not_null",
    "check_clause": "problem_id IS NOT NULL"
  },
  {
    "table_name": "machines",
    "constraint_name": "2200_74258_1_not_null",
    "check_clause": "machine_id IS NOT NULL"
  },
  {
    "table_name": "machines",
    "constraint_name": "2200_74258_2_not_null",
    "check_clause": "brand IS NOT NULL"
  },
  {
    "table_name": "machines",
    "constraint_name": "2200_74258_5_not_null",
    "check_clause": "type IS NOT NULL"
  },
  {
    "table_name": "manual_people_company_map",
    "constraint_name": "2200_47126_1_not_null",
    "check_clause": "org_name_norm IS NOT NULL"
  },
  {
    "table_name": "manual_people_company_map",
    "constraint_name": "2200_47126_2_not_null",
    "check_clause": "target_company_id IS NOT NULL"
  },
  {
    "table_name": "order_items",
    "constraint_name": "2200_41580_1_not_null",
    "check_clause": "order_id IS NOT NULL"
  },
  {
    "table_name": "order_items",
    "constraint_name": "2200_41580_2_not_null",
    "check_clause": "product_code IS NOT NULL"
  },
  {
    "table_name": "order_items",
    "constraint_name": "2200_41580_4_not_null",
    "check_clause": "qty IS NOT NULL"
  },
  {
    "table_name": "order_items",
    "constraint_name": "2200_41580_5_not_null",
    "check_clause": "unit_price IS NOT NULL"
  },
  {
    "table_name": "order_items",
    "constraint_name": "2200_41580_6_not_null",
    "check_clause": "line_total IS NOT NULL"
  },
  {
    "table_name": "order_items",
    "constraint_name": "order_items_qty_check",
    "check_clause": "(qty > 0)"
  },
  {
    "table_name": "orders",
    "constraint_name": "2200_41560_10_not_null",
    "check_clause": "total_amount IS NOT NULL"
  },
  {
    "table_name": "orders",
    "constraint_name": "2200_41560_1_not_null",
    "check_clause": "order_id IS NOT NULL"
  },
  {
    "table_name": "orders",
    "constraint_name": "2200_41560_23_not_null",
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_name": "orders",
    "constraint_name": "2200_41560_24_not_null",
    "check_clause": "updated_at IS NOT NULL"
  },
  {
    "table_name": "orders",
    "constraint_name": "2200_41560_2_not_null",
    "check_clause": "company_id IS NOT NULL"
  },
  {
    "table_name": "orders",
    "constraint_name": "2200_41560_3_not_null",
    "check_clause": "currency IS NOT NULL"
  },
  {
    "table_name": "orders",
    "constraint_name": "2200_41560_4_not_null",
    "check_clause": "payment_channel IS NOT NULL"
  },
  {
    "table_name": "orders",
    "constraint_name": "2200_41560_5_not_null",
    "check_clause": "payment_status IS NOT NULL"
  },
  {
    "table_name": "orders",
    "constraint_name": "2200_41560_6_not_null",
    "check_clause": "fulfillment_status IS NOT NULL"
  },
  {
    "table_name": "orders",
    "constraint_name": "2200_41560_7_not_null",
    "check_clause": "subtotal IS NOT NULL"
  },
  {
    "table_name": "orders",
    "constraint_name": "2200_41560_8_not_null",
    "check_clause": "shipping_amount IS NOT NULL"
  },
  {
    "table_name": "orders",
    "constraint_name": "2200_41560_9_not_null",
    "check_clause": "tax_amount IS NOT NULL"
  },
  {
    "table_name": "orders",
    "constraint_name": "orders_fulfillment_status_check",
    "check_clause": "(fulfillment_status = ANY (ARRAY['new'::text, 'hold_unpaid'::text, 'ready_to_pick'::text, 'shipped'::text, 'cancelled'::text]))"
  },
  {
    "table_name": "orders",
    "constraint_name": "orders_payment_channel_check",
    "check_clause": "(payment_channel = ANY (ARRAY['stripe'::text, 'invoice'::text]))"
  },
  {
    "table_name": "orders",
    "constraint_name": "orders_payment_status_check",
    "check_clause": "(payment_status = ANY (ARRAY['unpaid'::text, 'paid'::text, 'failed'::text, 'refunded'::text]))"
  },
  {
    "table_name": "outbox",
    "constraint_name": "2200_71576_11_not_null",
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_name": "outbox",
    "constraint_name": "2200_71576_12_not_null",
    "check_clause": "updated_at IS NOT NULL"
  },
  {
    "table_name": "outbox",
    "constraint_name": "2200_71576_1_not_null",
    "check_clause": "job_id IS NOT NULL"
  },
  {
    "table_name": "outbox",
    "constraint_name": "2200_71576_2_not_null",
    "check_clause": "job_type IS NOT NULL"
  },
  {
    "table_name": "outbox",
    "constraint_name": "2200_71576_3_not_null",
    "check_clause": "status IS NOT NULL"
  },
  {
    "table_name": "outbox",
    "constraint_name": "2200_71576_4_not_null",
    "check_clause": "attempts IS NOT NULL"
  },
  {
    "table_name": "outbox",
    "constraint_name": "2200_71576_5_not_null",
    "check_clause": "max_attempts IS NOT NULL"
  },
  {
    "table_name": "outbox",
    "constraint_name": "2200_71576_6_not_null",
    "check_clause": "payload IS NOT NULL"
  },
  {
    "table_name": "outbox",
    "constraint_name": "outbox_status_check",
    "check_clause": "(status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text]))"
  },
  {
    "table_name": "problems",
    "constraint_name": "2200_75415_1_not_null",
    "check_clause": "problem_id IS NOT NULL"
  },
  {
    "table_name": "problems",
    "constraint_name": "2200_75415_2_not_null",
    "check_clause": "title IS NOT NULL"
  },
  {
    "table_name": "product_skus",
    "constraint_name": "2200_79990_1_not_null",
    "check_clause": "sku_code IS NOT NULL"
  },
  {
    "table_name": "product_skus",
    "constraint_name": "2200_79990_2_not_null",
    "check_clause": "sku_name IS NOT NULL"
  },
  {
    "table_name": "products",
    "constraint_name": "2200_17702_1_not_null",
    "check_clause": "product_code IS NOT NULL"
  },
  {
    "table_name": "products",
    "constraint_name": "products_type_check",
    "check_clause": "(type = ANY (ARRAY['tool'::text, 'consumable'::text, 'machine'::text, 'part'::text]))"
  },
  {
    "table_name": "sales",
    "constraint_name": "2200_17982_1_not_null",
    "check_clause": "sale_id IS NOT NULL"
  },
  {
    "table_name": "sales",
    "constraint_name": "2200_17982_5_not_null",
    "check_clause": "quantity IS NOT NULL"
  },
  {
    "table_name": "sales",
    "constraint_name": "2200_17982_6_not_null",
    "check_clause": "txn_date IS NOT NULL"
  },
  {
    "table_name": "send_queue",
    "constraint_name": "2200_19250_1_not_null",
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_name": "send_queue",
    "constraint_name": "2200_19250_3_not_null",
    "check_clause": "portal_token IS NOT NULL"
  },
  {
    "table_name": "send_queue",
    "constraint_name": "2200_19250_4_not_null",
    "check_clause": "cadence IS NOT NULL"
  },
  {
    "table_name": "send_queue",
    "constraint_name": "2200_19250_5_not_null",
    "check_clause": "payload IS NOT NULL"
  },
  {
    "table_name": "send_queue",
    "constraint_name": "2200_19250_6_not_null",
    "check_clause": "scheduled_at IS NOT NULL"
  },
  {
    "table_name": "send_queue",
    "constraint_name": "2200_19250_8_not_null",
    "check_clause": "status IS NOT NULL"
  },
  {
    "table_name": "shipping_overrides",
    "constraint_name": "2200_41657_1_not_null",
    "check_clause": "product_code IS NOT NULL"
  },
  {
    "table_name": "shipping_overrides",
    "constraint_name": "2200_41657_2_not_null",
    "check_clause": "extra_fee IS NOT NULL"
  },
  {
    "table_name": "shipping_zones",
    "constraint_name": "2200_41650_1_not_null",
    "check_clause": "country IS NOT NULL"
  },
  {
    "table_name": "shipping_zones",
    "constraint_name": "2200_41650_2_not_null",
    "check_clause": "zone IS NOT NULL"
  },
  {
    "table_name": "shipping_zones",
    "constraint_name": "2200_41650_3_not_null",
    "check_clause": "base_rate IS NOT NULL"
  },
  {
    "table_name": "solution_problem",
    "constraint_name": "2200_77078_1_not_null",
    "check_clause": "solution_problem_id IS NOT NULL"
  },
  {
    "table_name": "solution_problem",
    "constraint_name": "2200_77078_2_not_null",
    "check_clause": "solution_id IS NOT NULL"
  },
  {
    "table_name": "solution_problem",
    "constraint_name": "2200_77078_3_not_null",
    "check_clause": "problem_id IS NOT NULL"
  },
  {
    "table_name": "solution_problem",
    "constraint_name": "2200_77078_4_not_null",
    "check_clause": "pitch_headline IS NOT NULL"
  },
  {
    "table_name": "solution_problem",
    "constraint_name": "2200_77078_5_not_null",
    "check_clause": "pitch_detail IS NOT NULL"
  },
  {
    "table_name": "solution_problem",
    "constraint_name": "solution_problem_marketing_mode_check",
    "check_clause": "(marketing_mode = ANY (ARRAY['problem_to_solution'::text, 'capability_to_outcome'::text]))"
  },
  {
    "table_name": "solutions",
    "constraint_name": "2200_75448_1_not_null",
    "check_clause": "solution_id IS NOT NULL"
  },
  {
    "table_name": "solutions",
    "constraint_name": "2200_75448_2_not_null",
    "check_clause": "name IS NOT NULL"
  },
  {
    "table_name": "tool_consumable_map",
    "constraint_name": "2200_18183_1_not_null",
    "check_clause": "tool_code IS NOT NULL"
  },
  {
    "table_name": "tool_consumable_map",
    "constraint_name": "2200_18183_2_not_null",
    "check_clause": "consumable_code IS NOT NULL"
  }
]

4) [
  {
    "table_name": "asset_models",
    "index_name": "asset_models_pkey",
    "index_def": "CREATE UNIQUE INDEX asset_models_pkey ON public.asset_models USING btree (model_id)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "asset_models",
    "index_name": "asset_models_slug_key",
    "index_def": "CREATE UNIQUE INDEX asset_models_slug_key ON public.asset_models USING btree (slug)",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "asset_models",
    "index_name": "idx_asset_models_level",
    "index_def": "CREATE INDEX idx_asset_models_level ON public.asset_models USING btree (level)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "asset_models",
    "index_name": "idx_asset_models_level_parent",
    "index_def": "CREATE INDEX idx_asset_models_level_parent ON public.asset_models USING btree (level, parent_id)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "asset_models",
    "index_name": "idx_asset_models_parent",
    "index_def": "CREATE INDEX idx_asset_models_parent ON public.asset_models USING btree (parent_id)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "campaigns",
    "index_name": "campaigns_campaign_key_key",
    "index_def": "CREATE UNIQUE INDEX campaigns_campaign_key_key ON public.campaigns USING btree (campaign_key)",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "campaigns",
    "index_name": "campaigns_pkey",
    "index_def": "CREATE UNIQUE INDEX campaigns_pkey ON public.campaigns USING btree (campaign_id)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "companies",
    "index_name": "companies_pkey",
    "index_def": "CREATE UNIQUE INDEX companies_pkey ON public.companies USING btree (company_id)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "companies",
    "index_name": "idx_companies_category",
    "index_def": "CREATE INDEX idx_companies_category ON public.companies USING btree (category)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "companies",
    "index_name": "idx_companies_type",
    "index_def": "CREATE INDEX idx_companies_type ON public.companies USING btree (type)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "companies",
    "index_name": "uix_companies_portal_token",
    "index_def": "CREATE UNIQUE INDEX uix_companies_portal_token ON public.companies USING btree (portal_token)",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "companies",
    "index_name": "uq_companies_company_uuid",
    "index_def": "CREATE UNIQUE INDEX uq_companies_company_uuid ON public.companies USING btree (company_uuid)",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "company_beliefs",
    "index_name": "company_beliefs_pkey",
    "index_def": "CREATE UNIQUE INDEX company_beliefs_pkey ON public.company_beliefs USING btree (belief_id)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "company_beliefs",
    "index_name": "idx_beliefs_company",
    "index_def": "CREATE INDEX idx_beliefs_company ON public.company_beliefs USING btree (company_id)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "company_beliefs",
    "index_name": "idx_beliefs_conf",
    "index_def": "CREATE INDEX idx_beliefs_conf ON public.company_beliefs USING btree (confidence)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "company_beliefs",
    "index_name": "idx_beliefs_model",
    "index_def": "CREATE INDEX idx_beliefs_model ON public.company_beliefs USING btree (model_id)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "company_beliefs",
    "index_name": "idx_company_beliefs_company_updated",
    "index_def": "CREATE INDEX idx_company_beliefs_company_updated ON public.company_beliefs USING btree (company_id, updated_at DESC)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "company_beliefs",
    "index_name": "idx_company_beliefs_model_updated",
    "index_def": "CREATE INDEX idx_company_beliefs_model_updated ON public.company_beliefs USING btree (model_id, updated_at DESC)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "company_beliefs",
    "index_name": "uq_company_beliefs_company_model",
    "index_def": "CREATE UNIQUE INDEX uq_company_beliefs_company_model ON public.company_beliefs USING btree (company_id, model_id)",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "company_machine",
    "index_name": "company_machine_company_id_machine_id_key",
    "index_def": "CREATE UNIQUE INDEX company_machine_company_id_machine_id_key ON public.company_machine USING btree (company_id, machine_id)",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "company_machine",
    "index_name": "company_machine_pkey",
    "index_def": "CREATE UNIQUE INDEX company_machine_pkey ON public.company_machine USING btree (company_machine_id)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "company_machine",
    "index_name": "idx_company_machine_company",
    "index_def": "CREATE INDEX idx_company_machine_company ON public.company_machine USING btree (company_id)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "company_machine",
    "index_name": "idx_company_machine_confirmed",
    "index_def": "CREATE INDEX idx_company_machine_confirmed ON public.company_machine USING btree (confirmed) WHERE (confirmed = true)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "company_machine",
    "index_name": "idx_company_machine_machine",
    "index_def": "CREATE INDEX idx_company_machine_machine ON public.company_machine USING btree (machine_id)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "company_machine",
    "index_name": "idx_company_machine_source",
    "index_def": "CREATE INDEX idx_company_machine_source ON public.company_machine USING btree (source)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "company_tool",
    "index_name": "company_tool_pkey",
    "index_def": "CREATE UNIQUE INDEX company_tool_pkey ON public.company_tool USING btree (company_id, tool_code)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "company_tool",
    "index_name": "idx_company_tool_company",
    "index_def": "CREATE INDEX idx_company_tool_company ON public.company_tool USING btree (company_id)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "contact_interests",
    "index_name": "contact_interests_pkey",
    "index_def": "CREATE UNIQUE INDEX contact_interests_pkey ON public.contact_interests USING btree (contact_id, interest_code)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "contact_interests",
    "index_name": "idx_contact_interests_interest",
    "index_def": "CREATE INDEX idx_contact_interests_interest ON public.contact_interests USING btree (interest_code)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "contacts",
    "index_name": "contacts_pkey",
    "index_def": "CREATE UNIQUE INDEX contacts_pkey ON public.contacts USING btree (contact_id)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "contacts",
    "index_name": "idx_contacts_company",
    "index_def": "CREATE INDEX idx_contacts_company ON public.contacts USING btree (company_id)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "contacts",
    "index_name": "uix_contacts_token",
    "index_def": "CREATE UNIQUE INDEX uix_contacts_token ON public.contacts USING btree (token)",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "contacts",
    "index_name": "uq_contacts_company_email_exact",
    "index_def": "CREATE UNIQUE INDEX uq_contacts_company_email_exact ON public.contacts USING btree (company_id, email)",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "email_events",
    "index_name": "email_events_pkey",
    "index_def": "CREATE UNIQUE INDEX email_events_pkey ON public.email_events USING btree (id)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "engagement_events",
    "index_name": "engagement_events_pkey",
    "index_def": "CREATE UNIQUE INDEX engagement_events_pkey ON public.engagement_events USING btree (event_id)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "engagement_events",
    "index_name": "idx_engagement_events_company_time",
    "index_def": "CREATE INDEX idx_engagement_events_company_time ON public.engagement_events USING btree (company_id, occurred_at)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "engagement_events",
    "index_name": "idx_engagement_events_contact_time",
    "index_def": "CREATE INDEX idx_engagement_events_contact_time ON public.engagement_events USING btree (contact_id, occurred_at)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "engagement_events",
    "index_name": "idx_events_name_time",
    "index_def": "CREATE INDEX idx_events_name_time ON public.engagement_events USING btree (event_name, occurred_at DESC)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "engagement_events",
    "index_name": "uix_events_source_id",
    "index_def": "CREATE UNIQUE INDEX uix_events_source_id ON public.engagement_events USING btree (source, source_event_id) WHERE (source_event_id IS NOT NULL)",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "interest_lookup",
    "index_name": "interest_lookup_pkey",
    "index_def": "CREATE UNIQUE INDEX interest_lookup_pkey ON public.interest_lookup USING btree (interest_code)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "machine_solution",
    "index_name": "machine_solution_pkey",
    "index_def": "CREATE UNIQUE INDEX machine_solution_pkey ON public.machine_solution USING btree (machine_solution_id)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "machine_solution",
    "index_name": "machine_solution_unique_pair",
    "index_def": "CREATE UNIQUE INDEX machine_solution_unique_pair ON public.machine_solution USING btree (machine_id, solution_id)",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "machine_solution_problem",
    "index_name": "machine_solution_problem_pkey",
    "index_def": "CREATE UNIQUE INDEX machine_solution_problem_pkey ON public.machine_solution_problem USING btree (id)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "machine_solution_problem",
    "index_name": "machine_solution_problem_unique",
    "index_def": "CREATE UNIQUE INDEX machine_solution_problem_unique ON public.machine_solution_problem USING btree (machine_solution_id, problem_id)",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "machines",
    "index_name": "machines_pkey",
    "index_def": "CREATE UNIQUE INDEX machines_pkey ON public.machines USING btree (machine_id)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "machines",
    "index_name": "machines_slug_key",
    "index_def": "CREATE UNIQUE INDEX machines_slug_key ON public.machines USING btree (slug)",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "manual_people_company_map",
    "index_name": "manual_people_company_map_pkey",
    "index_def": "CREATE UNIQUE INDEX manual_people_company_map_pkey ON public.manual_people_company_map USING btree (org_name_norm)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "order_items",
    "index_name": "order_items_pkey",
    "index_def": "CREATE UNIQUE INDEX order_items_pkey ON public.order_items USING btree (order_id, product_code)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "orders",
    "index_name": "idx_orders_company",
    "index_def": "CREATE INDEX idx_orders_company ON public.orders USING btree (company_id, created_at DESC)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "orders",
    "index_name": "idx_orders_status",
    "index_def": "CREATE INDEX idx_orders_status ON public.orders USING btree (fulfillment_status, created_at DESC)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "orders",
    "index_name": "orders_pkey",
    "index_def": "CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (order_id)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "outbox",
    "index_name": "idx_outbox_company",
    "index_def": "CREATE INDEX idx_outbox_company ON public.outbox USING btree (company_id)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "outbox",
    "index_name": "idx_outbox_created",
    "index_def": "CREATE INDEX idx_outbox_created ON public.outbox USING btree (created_at DESC)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "outbox",
    "index_name": "idx_outbox_order",
    "index_def": "CREATE INDEX idx_outbox_order ON public.outbox USING btree (order_id)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "outbox",
    "index_name": "idx_outbox_pick",
    "index_def": "CREATE INDEX idx_outbox_pick ON public.outbox USING btree (status, locked_until, attempts)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "outbox",
    "index_name": "outbox_pkey",
    "index_def": "CREATE UNIQUE INDEX outbox_pkey ON public.outbox USING btree (job_id)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "problems",
    "index_name": "problems_pkey",
    "index_def": "CREATE UNIQUE INDEX problems_pkey ON public.problems USING btree (problem_id)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "problems",
    "index_name": "problems_slug_key",
    "index_def": "CREATE UNIQUE INDEX problems_slug_key ON public.problems USING btree (slug)",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "product_skus",
    "index_name": "product_skus_pkey",
    "index_def": "CREATE UNIQUE INDEX product_skus_pkey ON public.product_skus USING btree (sku_code)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "products",
    "index_name": "products_pkey",
    "index_def": "CREATE UNIQUE INDEX products_pkey ON public.products USING btree (product_code)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "sales",
    "index_name": "idx_sales_company_product_date",
    "index_def": "CREATE INDEX idx_sales_company_product_date ON public.sales USING btree (company_id, product_code, txn_date DESC)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "sales",
    "index_name": "sales_pkey",
    "index_def": "CREATE UNIQUE INDEX sales_pkey ON public.sales USING btree (sale_id)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "send_queue",
    "index_name": "idx_send_queue_status",
    "index_def": "CREATE INDEX idx_send_queue_status ON public.send_queue USING btree (status, scheduled_at)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "send_queue",
    "index_name": "send_queue_pkey",
    "index_def": "CREATE UNIQUE INDEX send_queue_pkey ON public.send_queue USING btree (id)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "shipping_overrides",
    "index_name": "shipping_overrides_pkey",
    "index_def": "CREATE UNIQUE INDEX shipping_overrides_pkey ON public.shipping_overrides USING btree (product_code)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "shipping_zones",
    "index_name": "shipping_zones_pkey",
    "index_def": "CREATE UNIQUE INDEX shipping_zones_pkey ON public.shipping_zones USING btree (country)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "solution_problem",
    "index_name": "solution_problem_pkey",
    "index_def": "CREATE UNIQUE INDEX solution_problem_pkey ON public.solution_problem USING btree (solution_problem_id)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "solution_problem",
    "index_name": "solution_problem_unique_pair",
    "index_def": "CREATE UNIQUE INDEX solution_problem_unique_pair ON public.solution_problem USING btree (solution_id, problem_id)",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "solutions",
    "index_name": "solutions_pkey",
    "index_def": "CREATE UNIQUE INDEX solutions_pkey ON public.solutions USING btree (solution_id)",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "tool_consumable_map",
    "index_name": "idx_tcm_consumable",
    "index_def": "CREATE INDEX idx_tcm_consumable ON public.tool_consumable_map USING btree (consumable_code)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "tool_consumable_map",
    "index_name": "idx_tcm_tool",
    "index_def": "CREATE INDEX idx_tcm_tool ON public.tool_consumable_map USING btree (tool_code)",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "tool_consumable_map",
    "index_name": "tool_consumable_map_pkey",
    "index_def": "CREATE UNIQUE INDEX tool_consumable_map_pkey ON public.tool_consumable_map USING btree (tool_code, consumable_code)",
    "is_unique": true,
    "is_primary": true
  }
]

5) [
  {
    "view_name": "catalog_products",
    "view_sql": " SELECT product_code,\n    description,\n    category\n   FROM products;"
  },
  {
    "view_name": "mv_by_tools",
    "view_sql": " SELECT company_id,\n    tool_code,\n    consumable_code,\n    consumable_description,\n    price,\n    last_purchased_at\n   FROM vw_by_tools;"
  },
  {
    "view_name": "mv_company_consumable_payload",
    "view_sql": " SELECT company_id,\n    company_name,\n    reorder_items,\n    by_tool_tabs\n   FROM vw_company_consumable_payload;"
  },
  {
    "view_name": "stg_companies",
    "view_sql": " WITH src AS (\n         SELECT stg_customers_raw.customer_code AS company_id,\n            stg_customers_raw.company_name,\n            stg_customers_raw.website,\n            NULL::text AS country,\n            'customer'::text AS category,\n                CASE\n                    WHEN lower(btrim(stg_customers_raw.customer_type)) = ANY (ARRAY['distributor'::text, 'dist'::text, 'dealer'::text]) THEN 'distributor'::text\n                    WHEN lower(btrim(stg_customers_raw.customer_type)) = 'prospect'::text THEN 'prospect'::text\n                    ELSE 'customer'::text\n                END AS type,\n            'sage_import'::text AS source,\n            stg_customers_raw.vat_number,\n            stg_customers_raw.eori_number,\n            stg_customers_raw.company_reg_number,\n            stg_customers_raw.account_opened,\n            stg_customers_raw.first_invoice,\n            stg_customers_raw.last_invoice,\n            stg_customers_raw.email_primary,\n            stg_customers_raw.email_secondary,\n            stg_customers_raw.email_tertiary\n           FROM stg_customers_raw\n        ), hosts AS (\n         SELECT s.company_id,\n            s.company_name,\n            s.website,\n            s.country,\n            s.category,\n            s.type,\n            s.source,\n            s.vat_number,\n            s.eori_number,\n            s.company_reg_number,\n            s.account_opened,\n            s.first_invoice,\n            s.last_invoice,\n            s.email_primary,\n            s.email_secondary,\n            s.email_tertiary,\n            lower(split_part(regexp_replace(COALESCE(s.website, ''::text), '^(https?://)?(www\\.)?'::text, ''::text, 'i'::text), '/'::text, 1)) AS host_web,\n            lower(split_part(COALESCE(s.email_primary, ''::text), '@'::text, 2)) AS host_e1,\n            lower(split_part(COALESCE(s.email_secondary, ''::text), '@'::text, 2)) AS host_e2,\n            lower(split_part(COALESCE(s.email_tertiary, ''::text), '@'::text, 2)) AS host_e3\n           FROM src s\n        ), chosen AS (\n         SELECT h.company_id,\n            h.company_name,\n            h.website,\n            h.country,\n            h.category,\n            h.type,\n            h.source,\n            h.vat_number,\n            h.eori_number,\n            h.company_reg_number,\n            h.account_opened,\n            h.first_invoice,\n            h.last_invoice,\n            h.email_primary,\n            h.email_secondary,\n            h.email_tertiary,\n            h.host_web,\n            h.host_e1,\n            h.host_e2,\n            h.host_e3,\n                CASE\n                    WHEN COALESCE(h.host_web, ''::text) <> ''::text AND (h.host_web <> ALL (ARRAY['gmail.com'::text, 'googlemail.com'::text, 'outlook.com'::text, 'hotmail.com'::text, 'live.com'::text, 'yahoo.com'::text, 'icloud.com'::text, 'aol.com'::text, 'proton.me'::text, 'protonmail.com'::text, 'gmx.com'::text])) THEN h.host_web\n                    WHEN COALESCE(h.host_e1, ''::text) <> ''::text AND (h.host_e1 <> ALL (ARRAY['gmail.com'::text, 'googlemail.com'::text, 'outlook.com'::text, 'hotmail.com'::text, 'live.com'::text, 'yahoo.com'::text, 'icloud.com'::text, 'aol.com'::text, 'proton.me'::text, 'protonmail.com'::text, 'gmx.com'::text])) THEN h.host_e1\n                    WHEN COALESCE(h.host_e2, ''::text) <> ''::text AND (h.host_e2 <> ALL (ARRAY['gmail.com'::text, 'googlemail.com'::text, 'outlook.com'::text, 'hotmail.com'::text, 'live.com'::text, 'yahoo.com'::text, 'icloud.com'::text, 'aol.com'::text, 'proton.me'::text, 'protonmail.com'::text, 'gmx.com'::text])) THEN h.host_e2\n                    WHEN COALESCE(h.host_e3, ''::text) <> ''::text AND (h.host_e3 <> ALL (ARRAY['gmail.com'::text, 'googlemail.com'::text, 'outlook.com'::text, 'hotmail.com'::text, 'live.com'::text, 'yahoo.com'::text, 'icloud.com'::text, 'aol.com'::text, 'proton.me'::text, 'protonmail.com'::text, 'gmx.com'::text])) THEN h.host_e3\n                    ELSE NULL::text\n                END AS chosen_host\n           FROM hosts h\n        ), named AS (\n         SELECT c.company_id,\n            c.company_name,\n            c.website,\n            c.country,\n            c.category,\n            c.type,\n            c.source,\n            c.vat_number,\n            c.eori_number,\n            c.company_reg_number,\n            c.account_opened,\n            c.first_invoice,\n            c.last_invoice,\n            c.email_primary,\n            c.email_secondary,\n            c.email_tertiary,\n            c.host_web,\n            c.host_e1,\n            c.host_e2,\n            c.host_e3,\n            c.chosen_host,\n            COALESCE(NULLIF(btrim(c.company_name), ''::text),\n                CASE\n                    WHEN c.chosen_host IS NULL THEN NULL::text\n                    ELSE initcap(replace(split_part(c.chosen_host, '.'::text, 1), '-'::text, ' '::text))\n                END) AS company_name_final\n           FROM chosen c\n        )\n SELECT company_id,\n    company_name_final AS company_name,\n    website,\n    country,\n    category,\n    type,\n    source,\n    vat_number,\n    eori_number,\n    company_reg_number,\n        CASE\n            WHEN account_opened ~ '^\\d{4}-\\d{2}-\\d{2}$'::text THEN to_date(account_opened, 'YYYY-MM-DD'::text)\n            WHEN account_opened ~ '^\\d{2}/\\d{2}/\\d{4}$'::text THEN to_date(account_opened, 'DD/MM/YYYY'::text)\n            WHEN account_opened ~ '^\\d{2}-\\d{2}-\\d{4}$'::text THEN to_date(account_opened, 'DD-MM-YYYY'::text)\n            ELSE NULL::date\n        END AS account_opened_at,\n        CASE\n            WHEN first_invoice ~ '^\\d{4}-\\d{2}-\\d{2}$'::text THEN to_date(first_invoice, 'YYYY-MM-DD'::text)\n            WHEN first_invoice ~ '^\\d{2}/\\d{2}/\\d{4}$'::text THEN to_date(first_invoice, 'DD/MM/YYYY'::text)\n            WHEN first_invoice ~ '^\\d{2}-\\d{2}-\\d{4}$'::text THEN to_date(first_invoice, 'DD-MM-YYYY'::text)\n            ELSE NULL::date\n        END AS first_invoice_at,\n        CASE\n            WHEN last_invoice ~ '^\\d{4}-\\d{2}-\\d{2}$'::text THEN to_date(last_invoice, 'YYYY-MM-DD'::text)\n            WHEN last_invoice ~ '^\\d{2}/\\d{2}/\\d{4}$'::text THEN to_date(last_invoice, 'DD/MM/YYYY'::text)\n            WHEN last_invoice ~ '^\\d{2}-\\d{2}-\\d{4}$'::text THEN to_date(last_invoice, 'DD-MM-YYYY'::text)\n            ELSE NULL::date\n        END AS last_invoice_at\n   FROM named;"
  },
  {
    "view_name": "stg_contacts",
    "view_sql": " WITH base AS (\n         SELECT stg_customers_raw.customer_code AS company_id,\n            stg_customers_raw.company_name,\n            stg_customers_raw.contact_name AS full_name,\n            stg_customers_raw.phone,\n            stg_customers_raw.email_primary,\n            stg_customers_raw.email_secondary,\n            stg_customers_raw.email_tertiary\n           FROM stg_customers_raw\n        ), emails AS (\n         SELECT base.company_id,\n            base.full_name,\n            base.phone,\n            1 AS rnk,\n            base.email_primary AS email\n           FROM base\n        UNION ALL\n         SELECT base.company_id,\n            base.full_name,\n            NULL::text,\n            2 AS rnk,\n            base.email_secondary AS email\n           FROM base\n        UNION ALL\n         SELECT base.company_id,\n            base.full_name,\n            NULL::text,\n            3 AS rnk,\n            base.email_tertiary AS email\n           FROM base\n        ), email_rows AS (\n         SELECT emails.company_id,\n            NULLIF(btrim(emails.full_name), ''::text) AS full_name,\n            NULLIF(btrim(emails.email), ''::text) AS email,\n                CASE\n                    WHEN emails.rnk = 1 THEN NULLIF(btrim(emails.phone), ''::text)\n                    ELSE NULL::text\n                END AS phone,\n            'sage_import'::text AS source,\n            'active'::text AS status,\n            NULL::text AS marketing_status,\n            NULL::timestamp with time zone AS gdpr_consent_at,\n            NULL::text AS role,\n            NULL::text AS first_name,\n            NULL::text AS last_name\n           FROM emails\n          WHERE emails.email IS NOT NULL AND btrim(emails.email) <> ''::text\n        ), phone_only AS (\n         SELECT base.company_id,\n            NULLIF(btrim(base.full_name), ''::text) AS full_name,\n            NULL::text AS email,\n            NULLIF(btrim(base.phone), ''::text) AS phone,\n            'sage_import'::text AS source,\n            'active'::text AS status,\n            NULL::text AS marketing_status,\n            NULL::timestamp with time zone AS gdpr_consent_at,\n            NULL::text AS role,\n            NULL::text AS first_name,\n            NULL::text AS last_name\n           FROM base\n          WHERE COALESCE(NULLIF(btrim(base.email_primary), ''::text), NULLIF(btrim(base.email_secondary), ''::text), NULLIF(btrim(base.email_tertiary), ''::text)) IS NULL AND NULLIF(btrim(base.phone), ''::text) IS NOT NULL\n        )\n SELECT email_rows.company_id,\n    email_rows.full_name,\n    email_rows.email,\n    email_rows.phone,\n    email_rows.source,\n    email_rows.status,\n    email_rows.marketing_status,\n    email_rows.gdpr_consent_at,\n    email_rows.role,\n    email_rows.first_name,\n    email_rows.last_name\n   FROM email_rows\nUNION ALL\n SELECT phone_only.company_id,\n    phone_only.full_name,\n    phone_only.email,\n    phone_only.phone,\n    phone_only.source,\n    phone_only.status,\n    phone_only.marketing_status,\n    phone_only.gdpr_consent_at,\n    phone_only.role,\n    phone_only.first_name,\n    phone_only.last_name\n   FROM phone_only;"
  },
  {
    "view_name": "v_campaign_interactions",
    "view_sql": " SELECT occurred_at,\n    company_id,\n    contact_id,\n    event_name,\n    campaign_key,\n    offer_key,\n    url,\n    meta,\n    value,\n    currency\n   FROM engagement_events e\n  WHERE campaign_key IS NOT NULL;"
  },
  {
    "view_name": "v_company_interest_summary",
    "view_sql": " SELECT co.company_id,\n    array_agg(DISTINCT ci.interest_code) FILTER (WHERE ci.interest_code IS NOT NULL) AS interest_codes,\n    bool_or(ci.interest_code = 'technifold'::text) AS has_technifold_interest,\n    bool_or(ci.interest_code = 'creasestream'::text) AS has_creasestream_interest,\n    bool_or(ci.interest_code = 'technicrease'::text) AS has_technicrease_interest\n   FROM companies co\n     LEFT JOIN contacts ct ON ct.company_id = co.company_id\n     LEFT JOIN contact_interests ci ON ci.contact_id = ct.contact_id\n  GROUP BY co.company_id;"
  },
  {
    "view_name": "v_knowledge_confirmation_queue",
    "view_sql": " SELECT cb.belief_id,\n    cb.company_id,\n    c.company_name,\n    cb.model_id,\n    am.display_name AS model_display_name,\n    am.level AS model_level,\n    cb.confidence,\n    cb.source,\n    cb.contact_id,\n    cb.evidence,\n    cb.noted_at AS created_at,\n    cb.updated_at\n   FROM company_beliefs cb\n     JOIN companies c ON c.company_id = cb.company_id\n     JOIN asset_models am ON am.model_id = cb.model_id\n  WHERE cb.confidence = ANY (ARRAY[1, 2]);"
  },
  {
    "view_name": "v_machine_solution_problem_full",
    "view_sql": " SELECT m.machine_id,\n    m.brand AS machine_brand,\n    m.model AS machine_model,\n    m.display_name AS machine_display_name,\n    m.type AS machine_type,\n    m.slug AS machine_slug,\n    s.solution_id,\n    s.name AS solution_name,\n    s.core_benefit AS solution_core_benefit,\n    s.long_description AS solution_long_description,\n    s.media_urls AS solution_media_urls,\n    p.problem_id,\n    p.title AS problem_title,\n    p.description AS problem_description,\n    sp.pitch_headline,\n    sp.pitch_detail,\n    sp.action_cta,\n    sp.relevance_rank AS pitch_relevance_rank,\n    ms.relevance_rank AS machine_solution_rank,\n    ms.machine_solution_id\n   FROM machines m\n     JOIN machine_solution ms ON m.machine_id = ms.machine_id\n     JOIN solutions s ON ms.solution_id = s.solution_id\n     JOIN machine_solution_problem msp ON ms.machine_solution_id = msp.machine_solution_id\n     JOIN problems p ON msp.problem_id = p.problem_id\n     JOIN solution_problem sp ON sp.solution_id = s.solution_id AND sp.problem_id = p.problem_id\n  WHERE s.active = true\n  ORDER BY m.machine_id, ms.relevance_rank, sp.relevance_rank;"
  },
  {
    "view_name": "vw_by_past_consumables",
    "view_sql": " SELECT s.company_id,\n    s.product_code AS consumable_code,\n    p.description AS consumable_description,\n    p.price,\n    max(s.txn_date) AS last_purchased_at,\n    sum(s.quantity) AS lifetime_units\n   FROM sales s\n     JOIN products p ON p.product_code = s.product_code AND p.type = 'consumable'::text\n  WHERE p.active\n  GROUP BY s.company_id, s.product_code, p.description, p.price;"
  },
  {
    "view_name": "vw_by_tools",
    "view_sql": " WITH owned_tools AS (\n         SELECT company_tool.company_id,\n            company_tool.tool_code\n           FROM company_tool\n        ), needs AS (\n         SELECT ot.company_id,\n            tcm.tool_code,\n            tcm.consumable_code\n           FROM owned_tools ot\n             JOIN tool_consumable_map tcm ON tcm.tool_code = ot.tool_code\n        )\n SELECT n.company_id,\n    n.tool_code,\n    n.consumable_code,\n    pc.description AS consumable_description,\n    pc.price,\n    ( SELECT max(s.txn_date) AS max\n           FROM sales s\n          WHERE s.company_id = n.company_id AND s.product_code = n.consumable_code) AS last_purchased_at\n   FROM needs n\n     JOIN products pc ON pc.product_code = n.consumable_code\n  WHERE pc.active AND pc.is_reminder_eligible;"
  },
  {
    "view_name": "vw_company_consumable_needs",
    "view_sql": " WITH owned_tools AS (\n         SELECT company_tool.company_id,\n            company_tool.tool_code\n           FROM company_tool\n        ), needs AS (\n         SELECT ot.company_id,\n            tcm.consumable_code\n           FROM owned_tools ot\n             JOIN tool_consumable_map tcm ON tcm.tool_code = ot.tool_code\n        )\n SELECT n.company_id,\n    n.consumable_code,\n    p.description AS consumable_description,\n    p.price,\n    ( SELECT max(s.txn_date) AS max\n           FROM sales s\n          WHERE s.company_id = n.company_id AND s.product_code = n.consumable_code) AS last_purchased_at\n   FROM needs n\n     JOIN products p ON p.product_code = n.consumable_code\n  WHERE p.active AND p.is_reminder_eligible;"
  },
  {
    "view_name": "vw_company_consumable_payload",
    "view_sql": " SELECT company_id,\n    company_name,\n    ( SELECT json_agg(json_build_object('consumable_code', reorder_data.product_code, 'description', reorder_data.description, 'price', reorder_data.price, 'category', reorder_data.category, 'last_purchased', reorder_data.last_purchased) ORDER BY reorder_data.last_purchased DESC NULLS LAST) AS json_agg\n           FROM ( SELECT DISTINCT s.product_code,\n                    p.description,\n                    p.price,\n                    p.category,\n                    max(s.txn_date) AS last_purchased\n                   FROM sales s\n                     JOIN products p ON s.product_code = p.product_code\n                  WHERE s.company_id = c.company_id AND p.type = 'consumable'::text\n                  GROUP BY s.product_code, p.description, p.price, p.category) reorder_data) AS reorder_items,\n    ( SELECT json_agg(json_build_object('tool_code', tool_data.tool_code, 'tool_desc', tool_data.tool_desc, 'items', tool_data.items) ORDER BY tool_data.tool_desc) AS json_agg\n           FROM ( SELECT t.product_code AS tool_code,\n                    t.description AS tool_desc,\n                    ( SELECT json_agg(json_build_object('consumable_code', consumable_data.consumable_code, 'description', consumable_data.description, 'price', consumable_data.price, 'category', consumable_data.category, 'last_purchased', consumable_data.last_purchased) ORDER BY consumable_data.description) AS json_agg\n                           FROM ( SELECT cons.product_code AS consumable_code,\n                                    cons.description,\n                                    cons.price,\n                                    cons.category,\n                                    max(s2.txn_date) AS last_purchased\n                                   FROM tool_consumable_map tcm\n                                     JOIN products cons ON tcm.consumable_code = cons.product_code\n                                     LEFT JOIN sales s2 ON s2.product_code = cons.product_code AND s2.company_id = c.company_id\n                                  WHERE tcm.tool_code = t.product_code AND cons.type = 'consumable'::text\n                                  GROUP BY cons.product_code, cons.description, cons.price, cons.category) consumable_data) AS items\n                   FROM ( SELECT DISTINCT tools.product_code,\n                            tools.description\n                           FROM sales s\n                             JOIN products tools ON s.product_code = tools.product_code\n                          WHERE s.company_id = c.company_id AND tools.type = 'tool'::text) t) tool_data\n          WHERE tool_data.items IS NOT NULL) AS by_tool_tabs\n   FROM companies c;"
  },
  {
    "view_name": "vw_due_consumable_reminders_180",
    "view_sql": " SELECT company_id,\n    consumable_code,\n    consumable_description,\n    price,\n    last_purchased_at\n   FROM ( SELECT vw_by_past_consumables.company_id,\n            vw_by_past_consumables.consumable_code,\n            vw_by_past_consumables.consumable_description,\n            vw_by_past_consumables.price,\n            vw_by_past_consumables.last_purchased_at\n           FROM vw_by_past_consumables\n          WHERE COALESCE(vw_by_past_consumables.last_purchased_at, '1900-01-01'::date) <= (CURRENT_DATE - '180 days'::interval)\n        UNION ALL\n         SELECT vw_by_tools.company_id,\n            vw_by_tools.consumable_code,\n            vw_by_tools.consumable_description,\n            vw_by_tools.price,\n            vw_by_tools.last_purchased_at\n           FROM vw_by_tools\n          WHERE vw_by_tools.last_purchased_at IS NULL) u;"
  },
  {
    "view_name": "vw_due_consumable_reminders_365",
    "view_sql": " SELECT company_id,\n    consumable_code,\n    consumable_description,\n    price,\n    last_purchased_at\n   FROM ( SELECT vw_by_past_consumables.company_id,\n            vw_by_past_consumables.consumable_code,\n            vw_by_past_consumables.consumable_description,\n            vw_by_past_consumables.price,\n            vw_by_past_consumables.last_purchased_at\n           FROM vw_by_past_consumables\n          WHERE COALESCE(vw_by_past_consumables.last_purchased_at, '1900-01-01'::date) <= (CURRENT_DATE - '365 days'::interval)\n        UNION ALL\n         SELECT vw_by_tools.company_id,\n            vw_by_tools.consumable_code,\n            vw_by_tools.consumable_description,\n            vw_by_tools.price,\n            vw_by_tools.last_purchased_at\n           FROM vw_by_tools\n          WHERE vw_by_tools.last_purchased_at IS NULL) u;"
  },
  {
    "view_name": "vw_due_consumable_reminders_90",
    "view_sql": " SELECT company_id,\n    consumable_code,\n    consumable_description,\n    price,\n    last_purchased_at\n   FROM ( SELECT vw_by_past_consumables.company_id,\n            vw_by_past_consumables.consumable_code,\n            vw_by_past_consumables.consumable_description,\n            vw_by_past_consumables.price,\n            vw_by_past_consumables.last_purchased_at\n           FROM vw_by_past_consumables\n          WHERE COALESCE(vw_by_past_consumables.last_purchased_at, '1900-01-01'::date) <= (CURRENT_DATE - '90 days'::interval)\n        UNION ALL\n         SELECT vw_by_tools.company_id,\n            vw_by_tools.consumable_code,\n            vw_by_tools.consumable_description,\n            vw_by_tools.price,\n            vw_by_tools.last_purchased_at\n           FROM vw_by_tools\n          WHERE vw_by_tools.last_purchased_at IS NULL) u;"
  }
]
6)[
  {
    "schema": "public",
    "function_name": "set_engagement_company_from_contact",
    "definition": "CREATE OR REPLACE FUNCTION public.set_engagement_company_from_contact()\n RETURNS trigger\n LANGUAGE plpgsql\nAS $function$\r\nbegin\r\n  if (NEW.company_id is null) and (NEW.contact_id is not null) then\r\n    select c.company_id into NEW.company_id\r\n    from public.contacts c\r\n    where c.contact_id = NEW.contact_id;\r\n  end if;\r\n\r\n  if NEW.company_id is null then\r\n    raise exception 'engagement_events.company_id cannot be null (provide company_id or a contact_id that maps to a company)';\r\n  end if;\r\n\r\n  return NEW;\r\nend;\r\n$function$\n"
  },
  {
    "schema": "public",
    "function_name": "set_updated_at",
    "definition": "CREATE OR REPLACE FUNCTION public.set_updated_at()\n RETURNS trigger\n LANGUAGE plpgsql\nAS $function$\r\nbegin new.updated_at := now(); return new; end $function$\n"
  },
  {
    "schema": "public",
    "function_name": "update_company_machine_updated_at",
    "definition": "CREATE OR REPLACE FUNCTION public.update_company_machine_updated_at()\n RETURNS trigger\n LANGUAGE plpgsql\nAS $function$\r\nBEGIN\r\n  NEW.updated_at = NOW();\r\n  RETURN NEW;\r\nEND;\r\n$function$\n"
  }
]

7) Success no rows returned

8) Success no rows returned

9) [
  {
    "table_name": "companies",
    "column_name": "account_owner",
    "exists": true
  },
  {
    "table_name": "company_machine",
    "column_name": "confidence_score",
    "exists": true
  },
  {
    "table_name": "company_machine",
    "column_name": "confirmed",
    "exists": true
  },
  {
    "table_name": "company_machine",
    "column_name": "source",
    "exists": true
  },
  {
    "table_name": "machine_solution_problem",
    "column_name": "problem_solution_copy",
    "exists": false
  },
  {
    "table_name": "machines",
    "column_name": "slug",
    "exists": true
  },
  {
    "table_name": "solution_problem",
    "column_name": "problem_solution_copy",
    "exists": false
  }
]

10) ERROR:  42703: column "updated_at" does not exist
LINE 15: select * from public.machine_solution_problem order by updated_at desc nulls last limit 3;
                                                                ^
11) ERROR:  42601: syntax error at or near "%"
LINE 14:   (select count(*) from public.%I) as row_count,
                                        ^

12) [
  {
    "pg_get_viewdef": " SELECT m.machine_id,\n    m.brand AS machine_brand,\n    m.model AS machine_model,\n    m.display_name AS machine_display_name,\n    m.type AS machine_type,\n    m.slug AS machine_slug,\n    s.solution_id,\n    s.name AS solution_name,\n    s.core_benefit AS solution_core_benefit,\n    s.long_description AS solution_long_description,\n    s.media_urls AS solution_media_urls,\n    p.problem_id,\n    p.title AS problem_title,\n    p.description AS problem_description,\n    sp.pitch_headline,\n    sp.pitch_detail,\n    sp.action_cta,\n    sp.relevance_rank AS pitch_relevance_rank,\n    ms.relevance_rank AS machine_solution_rank,\n    ms.machine_solution_id\n   FROM machines m\n     JOIN machine_solution ms ON m.machine_id = ms.machine_id\n     JOIN solutions s ON ms.solution_id = s.solution_id\n     JOIN machine_solution_problem msp ON ms.machine_solution_id = msp.machine_solution_id\n     JOIN problems p ON msp.problem_id = p.problem_id\n     JOIN solution_problem sp ON sp.solution_id = s.solution_id AND sp.problem_id = p.problem_id\n  WHERE s.active = true\n  ORDER BY m.machine_id, ms.relevance_rank, sp.relevance_rank;"
  }
]

13) Success no rows returned

14) A) [
  {
    "machine_id": "c6670cce-2a89-4ccc-acec-6d65f409067a",
    "brand": "Heidelberg Stahlfolder",
    "model": "Ti 40",
    "display_name": "Heidelberg Stahlfolder Ti 40",
    "type": "folding_machine",
    "shaft_size_mm": null,
    "country": null,
    "oem_url": null,
    "description": "Small-format buckle folder; Ti 40/4 style; flat pile feeder",
    "created_at": "2025-10-26 13:50:57.42104+00",
    "updated_at": "2025-10-26 13:50:57.42104+00",
    "slug": "heidelberg-stahlfolder-ti-40",
    "type_canonical": null
  },
  {
    "machine_id": "c5233253-09a1-44cb-9b00-6f912ffaf7e2",
    "brand": "Heidelberg Stahlfolder",
    "model": "Ti 52",
    "display_name": "Heidelberg Stahlfolder Ti 52",
    "type": "folding_machine",
    "shaft_size_mm": null,
    "country": null,
    "oem_url": null,
    "description": "B3/B2 buckle folder; very common in commercial print; often 4 or 6 plate, can have 2nd station",
    "created_at": "2025-10-26 13:50:57.42104+00",
    "updated_at": "2025-10-26 13:50:57.42104+00",
    "slug": "heidelberg-stahlfolder-ti-52",
    "type_canonical": null
  },
  {
    "machine_id": "c3891e49-c22d-4c72-9abf-83e45a1fd634",
    "brand": "Heidelberg Stahlfolder",
    "model": "T 52",
    "display_name": "Heidelberg Stahlfolder T 52",
    "type": "folding_machine",
    "shaft_size_mm": null,
    "country": null,
    "oem_url": null,
    "description": "Earlier T-series 52 cm folder; pharma/leaflet capable depending config",
    "created_at": "2025-10-26 13:50:57.42104+00",
    "updated_at": "2025-10-26 13:50:57.42104+00",
    "slug": "heidelberg-stahlfolder-t-52",
    "type_canonical": null
  }
]

B) [
  {
    "solution_id": "963b5378-e688-41a9-b502-5780afb835da",
    "name": "Section Score",
    "core_benefit": "Applies a deeper cleaner and perfectly aligned score that transforms folding consistency.",
    "long_description": "The Section Score replaces abrasive OEM steel scoring tools with a precision-engineered plastic ring system featuring four male and eight female options. It produces scores up to three times deeper eliminating edge tearing and weak folds. Colour-coded presets remove operator guesswork and keep folds 100% consistent.",
    "media_urls": [],
    "active": true,
    "created_at": "2025-10-27 02:49:23.855684+00"
  },
  {
    "solution_id": "50dbe653-fad4-4039-9180-6f17ed4a5129",
    "name": "Pharma Score",
    "core_benefit": "Delivers perfect crack-free folds on ultra-thin pharmaceutical and instruction leaflets.",
    "long_description": "The Pharma Score replaces OEM steel scoring tools with a six-setting plastic scoring system designed for lightweight multi-fold jobs. Its colour-coded male/female components produce three-times deeper cleaner scores that prevent tearing and keep tiny panels folding cleanly through multiple turns.",
    "media_urls": [],
    "active": true,
    "created_at": "2025-10-27 02:49:23.855684+00"
  },
  {
    "solution_id": "d02687cc-5768-4a13-9d70-b6757995bd5e",
    "name": "Quad Creaser",
    "core_benefit": "Eliminates spine and hinge cracking while improving cover flexibility and glue bond.",
    "long_description": "The Quad Creaser replaces OEM steel scoring modules on perfect binders with a patented rubber and nylon creasing system. It applies up to four deep fibre-stretching creases to the spine and hinge in one pass. This prevents flaking improves glue contact and keeps perfect-bound covers looking flawless on laminated UV-coated and digital stocks.",
    "media_urls": [],
    "active": true,
    "created_at": "2025-10-27 02:49:23.855684+00"
  }
]

C) [
  {
    "problem_id": "570e24c0-8931-478f-929c-9679be3b6dda",
    "title": "Need to crease and perforate in close proximity",
    "slug": "need-to-crease-and-perforate-in-close-proximity",
    "description": "Operators struggle to crease and perforate within millimetres on one pass using standard folding-machine tooling.",
    "is_hero": true,
    "seo_keywords": [
      "close proximity",
      "crease and perf",
      "inline finishing"
    ],
    "created_at": "2025-10-27 07:12:18.143125+00"
  },
  {
    "problem_id": "6e2b477d-12cd-4f03-9c23-ccf997c41a40",
    "title": "Poor-quality micro-perforating on folding machines",
    "slug": "poor-quality-micro-perforating-on-folding-machines",
    "description": "Standard folder perforators leave rough edges and paper dust that cause jams and poor presentation.",
    "is_hero": true,
    "seo_keywords": [
      "micro-perforating",
      "rough perf",
      "digital press issues"
    ],
    "created_at": "2025-10-27 07:12:18.143125+00"
  },
  {
    "problem_id": "fd757115-b61f-4484-a1a7-66c922b11ee5",
    "title": "Poor quality slitting solutions costing you time and money",
    "slug": "poor-quality-slitting-solutions-costing-you-time-and-money",
    "description": "Inaccurate or blunt slitting tools waste sheets increase rework and slow down finishing throughput.",
    "is_hero": true,
    "seo_keywords": [
      "slitting",
      "inline cutting",
      "folding productivity"
    ],
    "created_at": "2025-10-27 07:12:18.143125+00"
  }
]

D) [
  {
    "machine_solution_id": "44f28b65-4ed3-4b53-9c24-084948b6f2e8",
    "machine_id": "1f0488fe-e484-439a-bd69-b9d9114b25b1",
    "solution_id": "d02687cc-5768-4a13-9d70-b6757995bd5e",
    "relevance_rank": 1,
    "notes": null
  },
  {
    "machine_solution_id": "69af3c25-e19e-458a-9f1d-edc0160c2c5c",
    "machine_id": "01a3862e-fb2c-442e-b51f-39f0650cbc6e",
    "solution_id": "d02687cc-5768-4a13-9d70-b6757995bd5e",
    "relevance_rank": 1,
    "notes": null
  },
  {
    "machine_solution_id": "6fc43d30-95a6-4d8b-a80d-ab25c34a2e66",
    "machine_id": "cfff85df-0faf-4257-8bcb-4f3e8673f222",
    "solution_id": "d02687cc-5768-4a13-9d70-b6757995bd5e",
    "relevance_rank": 1,
    "notes": null
  }
]

E) [
  {
    "solution_problem_id": "5c967c19-4316-427a-8822-9bf4f5ad979d",
    "solution_id": "963b5378-e688-41a9-b502-5780afb835da",
    "problem_id": "5dd34890-e4e8-4c70-b904-be27400b4a7a",
    "pitch_headline": "Constantly adjusting roller pressures trying to get some kind of result — solved with Section Score",
    "pitch_detail": "Section Score is designed to fix: Constantly adjusting roller pressures trying to get some kind of result.",
    "action_cta": "Show me the upgrade",
    "relevance_rank": 1,
    "marketing_mode": "problem_to_solution"
  },
  {
    "solution_problem_id": "55a54b82-2672-4406-b8da-b9307b0743ec",
    "solution_id": "963b5378-e688-41a9-b502-5780afb835da",
    "problem_id": "0c459c4d-da0c-4d85-bdf2-d787a6eecc0a",
    "pitch_headline": "Impossible to get a deep score on section work — solved with Section Score",
    "pitch_detail": "Section Score is designed to fix: Impossible to get a deep score on section work.",
    "action_cta": "Show me the upgrade",
    "relevance_rank": 1,
    "marketing_mode": "problem_to_solution"
  },
  {
    "solution_problem_id": "01f36dca-8aff-4583-b879-230a3a7bb07a",
    "solution_id": "50dbe653-fad4-4039-9180-6f17ed4a5129",
    "problem_id": "3a0802d6-6dc0-488b-b37b-dad2364ec307",
    "pitch_headline": "Turning away pharmaceutical work — solved with Pharma Score",
    "pitch_detail": "Pharma Score is designed to fix: Turning away pharmaceutical work.",
    "action_cta": "Show me the upgrade",
    "relevance_rank": 1,
    "marketing_mode": "problem_to_solution"
  }
]

F) [
  {
    "id": "33f27718-4f0b-44f8-a1f8-21a193f0f3f1",
    "machine_solution_id": "44f28b65-4ed3-4b53-9c24-084948b6f2e8",
    "problem_id": "2c2d04ec-6fa1-4f2e-a622-9c8fe28419e7",
    "pitch_headline": "Fibre cracking ruining your book covers — solved with Quad Creaser",
    "pitch_detail": "Quad Creaser is designed to fix: Fibre cracking ruining your book covers.",
    "action_cta": "Show me the upgrade",
    "relevance_rank": 1,
    "is_primary_pitch": false,
    "sku_code": null
  },
  {
    "id": "4619c9e4-677b-4490-a058-fbe0a0d0ea77",
    "machine_solution_id": "44f28b65-4ed3-4b53-9c24-084948b6f2e8",
    "problem_id": "2df4b4f9-26df-4a29-8e19-1b541c53ac3c",
    "pitch_headline": "Can't stop laminate lifting after the cover feeder — solved with Quad Creaser",
    "pitch_detail": "Quad Creaser is designed to fix: Can't stop laminate lifting after the cover feeder.",
    "action_cta": "Show me the upgrade",
    "relevance_rank": 1,
    "is_primary_pitch": false,
    "sku_code": null
  },
  {
    "id": "60405e55-4442-4bce-956c-2ec86aad582f",
    "machine_solution_id": "44f28b65-4ed3-4b53-9c24-084948b6f2e8",
    "problem_id": "3f6a647e-395f-4fbc-8c9e-91d9baa20943",
    "pitch_headline": "Standard Cover Feeder settings just not up to the job — solved with Quad Creaser",
    "pitch_detail": "Quad Creaser is designed to fix: Standard Cover Feeder settings just not up to the job.",
    "action_cta": "Show me the upgrade",
    "relevance_rank": 1,
    "is_primary_pitch": false,
    "sku_code": null
  }
]

G) Success no rows returned (No data in this table yet)

H) [
  {
    "product_code": "SH-GB/15-FP-GRIP",
    "description": "Gripper Boss Support Rollers to fit Morgana - Top Rollers On",
    "type": "tool",
    "category": "Gripper Boss",
    "active": true,
    "is_marketable": false,
    "is_reminder_eligible": true,
    "price": "36",
    "currency": "GBP",
    "site_visibility": [
      "technifold"
    ],
    "extra": {}
  },
  {
    "product_code": "MPB-72",
    "description": "72 tpi Micro-Perforation Blade",
    "type": "consumable",
    "category": "Micro-Perforation Blade",
    "active": true,
    "is_marketable": false,
    "is_reminder_eligible": true,
    "price": "63",
    "currency": "GBP",
    "site_visibility": [
      "technifold"
    ],
    "extra": {}
  },
  {
    "product_code": "CP-AP-MF/40-FP",
    "description": "CP-Applicator to fit MBO 40mm shafts",
    "type": "tool",
    "category": "CP Applicator",
    "active": true,
    "is_marketable": true,
    "is_reminder_eligible": false,
    "price": "1436.4",
    "currency": "GBP",
    "site_visibility": [
      "technifold"
    ],
    "extra": {}
  }
]

15) [
  {
    "jsonb_agg": null
  }
]