/**
 * Add removed_at column to distributor_order_items
 * Allows tracking when items are removed from orders during approval
 */

-- Add removed_at column
ALTER TABLE distributor_order_items
ADD COLUMN IF NOT EXISTS removed_at TIMESTAMPTZ;

-- Add comment explaining the column
COMMENT ON COLUMN distributor_order_items.removed_at IS 'Timestamp when the item was removed from the order during approval. Only set when status = "removed".';

-- Add comment documenting the 'removed' status value
COMMENT ON COLUMN distributor_order_items.status IS 'Item status: pending_review, in_stock, back_order, fulfilled, or removed';
