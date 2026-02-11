/**
 * Add order_type to distributor_orders
 * Allows the table to handle both distributor orders and direct customer orders
 */

-- Add order_type column
ALTER TABLE distributor_orders
ADD COLUMN IF NOT EXISTS order_type TEXT NOT NULL DEFAULT 'distributor';

-- Add check constraint
ALTER TABLE distributor_orders
ADD CONSTRAINT order_type_check CHECK (order_type IN ('distributor', 'customer'));

-- Add index for filtering
CREATE INDEX IF NOT EXISTS idx_distributor_orders_order_type ON distributor_orders(order_type);

-- Update comment
COMMENT ON COLUMN distributor_orders.order_type IS 'Type of order: distributor (wholesale portal) or customer (direct reorder portal)';
