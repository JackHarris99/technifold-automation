#!/bin/bash

# Import companies first
echo "Importing companies..."

awk 'BEGIN{RS="-- Batch"; ORS=""} NR>1 {print "-- Batch" $0 > "temp-batch.sql"; system("echo \"Executing batch " NR-1 "\""); close("temp-batch.sql")}' import-companies.sql

# Count results
echo "Checking import results..."
echo "Total companies in database:"
echo "SELECT COUNT(*), type FROM companies GROUP BY type;" | psql "$DATABASE_URL"

echo ""
echo "Ready to import contacts? (This will take longer)"
echo "Run: import-contacts.sql"
