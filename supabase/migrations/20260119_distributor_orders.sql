-- Distributor Orders System
-- Orders are created when distributors submit, invoices created after admin review

-- Distributor Orders table
CREATE TABLE IF NOT EXISTS distributor_orders (
    order_id TEXT PRIMARY KEY DEFAULT ('DORD-' || LPAD(NEXTVAL('order_sequence')::TEXT, 6, '0')),
    company_id TEXT NOT NULL REFERENCES companies(company_id),
    user_id TEXT NOT NULL REFERENCES distributor_users(user_id),
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,

    -- Order status
    status TEXT NOT NULL DEFAULT 'pending_review',
    -- pending_review: awaiting admin review
    -- partially_fulfilled: some items invoiced, some back-ordered
    -- fully_fulfilled: all items invoiced
    -- cancelled: order cancelled

    -- Financial
    subtotal DECIMAL(10,2) NOT NULL,
    predicted_shipping DECIMAL(10,2) NOT NULL,
    confirmed_shipping DECIMAL(10,2), -- Admin can override
    vat_amount DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'GBP',

    -- Addresses (original from distributor)
    billing_address_line_1 TEXT,
    billing_address_line_2 TEXT,
    billing_city TEXT,
    billing_state_province TEXT,
    billing_postal_code TEXT,
    billing_country TEXT,
    vat_number TEXT,

    shipping_address_id TEXT REFERENCES shipping_addresses(address_id),
    shipping_address_line_1 TEXT,
    shipping_address_line_2 TEXT,
    shipping_city TEXT,
    shipping_state_province TEXT,
    shipping_postal_code TEXT,
    shipping_country TEXT,

    -- Admin overrides
    admin_billing_address_line_1 TEXT,
    admin_billing_address_line_2 TEXT,
    admin_billing_city TEXT,
    admin_billing_state_province TEXT,
    admin_billing_postal_code TEXT,
    admin_billing_country TEXT,

    admin_shipping_address_line_1 TEXT,
    admin_shipping_address_line_2 TEXT,
    admin_shipping_city TEXT,
    admin_shipping_state_province TEXT,
    admin_shipping_postal_code TEXT,
    admin_shipping_country TEXT,

    shipping_override_reason TEXT,

    -- Metadata
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Distributor Order Items table
CREATE TABLE IF NOT EXISTS distributor_order_items (
    item_id TEXT PRIMARY KEY DEFAULT ('DITEM-' || LPAD(NEXTVAL('order_sequence')::TEXT, 6, '0')),
    order_id TEXT NOT NULL REFERENCES distributor_orders(order_id) ON DELETE CASCADE,
    product_code TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(10,2) NOT NULL,

    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending_review',
    -- pending_review: awaiting admin decision
    -- in_stock: approved for immediate invoice
    -- back_order: not available, will be invoiced later
    -- fulfilled: included in an invoice

    -- Back-order info
    back_order_date DATE,
    predicted_delivery_date DATE,
    back_order_notes TEXT,

    -- Invoice tracking
    fulfilled_invoice_id TEXT,
    fulfilled_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_distributor_orders_company ON distributor_orders(company_id);
CREATE INDEX idx_distributor_orders_status ON distributor_orders(status);
CREATE INDEX idx_distributor_orders_created ON distributor_orders(created_at DESC);
CREATE INDEX idx_distributor_order_items_order ON distributor_order_items(order_id);
CREATE INDEX idx_distributor_order_items_status ON distributor_order_items(status);

-- Create sequence if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS order_sequence START 1;

COMMENT ON TABLE distributor_orders IS 'Distributor orders awaiting admin review before invoice creation';
COMMENT ON TABLE distributor_order_items IS 'Line items for distributor orders with stock status tracking';
