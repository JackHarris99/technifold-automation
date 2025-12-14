-- Rename company_tool to company_tools for consistency
-- All other fact tables use plural naming (company_consumables, subscription_tools)

ALTER TABLE company_tool RENAME TO company_tools;

-- Indexes will auto-rename with the table
-- But update them explicitly for clarity
ALTER INDEX IF EXISTS company_tool_pkey RENAME TO company_tools_pkey;

COMMENT ON TABLE company_tools IS 'Tools purchased by companies - renamed from company_tool for plural consistency';
