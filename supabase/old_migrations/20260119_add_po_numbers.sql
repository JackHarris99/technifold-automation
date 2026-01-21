-- Add PO number fields to order/invoice tables

-- Add to distributor_orders
ALTER TABLE distributor_orders
ADD COLUMN IF NOT EXISTS po_number TEXT;

-- Add to invoices
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS po_number TEXT;

-- Add indexes for searching by PO number
CREATE INDEX IF NOT EXISTS idx_distributor_orders_po_number ON distributor_orders(po_number) WHERE po_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_po_number ON invoices(po_number) WHERE po_number IS NOT NULL;

COMMENT ON COLUMN distributor_orders.po_number IS 'Optional customer purchase order number for reference';
COMMENT ON COLUMN invoices.po_number IS 'Optional customer purchase order number for reference';
