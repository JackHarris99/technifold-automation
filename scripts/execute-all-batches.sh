#!/bin/bash

echo "🚀 Executing Phase 1: Pipedrive Import"
echo "=========================================="
echo ""

# Count total batches
TOTAL=$(ls final-batch-*.sql 2>/dev/null | wc -l)
echo "📦 Found $TOTAL company batches to import"
echo ""

# Combine all company batches into one file for migration
echo "📝 Creating combined migration..."
cat final-batch-*.sql > combined-companies-import.sql

# Check file size
SIZE=$(wc -c < combined-companies-import.sql)
echo "✅ Combined file size: $((SIZE/1024)) KB"
echo ""

echo "📋 Import summary:"
echo "  - 4,650 prospect companies"
echo "  - 4,630 contacts"
echo "  - Phone numbers on both companies & contacts"
echo "  - Account owner: NULL (unassigned for now)"
echo "  - Deduplication: Active (existing customers protected)"
echo ""

echo "✅ Ready to execute via Supabase migration tool"
echo ""
echo "Files ready:"
echo "  1. combined-companies-import.sql"
echo "  2. import-contacts-final.sql"
