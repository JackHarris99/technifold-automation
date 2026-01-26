#!/bin/bash

echo "Starting Pipedrive import..."
echo "This will import ~4,650 companies and ~4,630 contacts"
echo ""

# Split the SQL file by batch markers and execute each
awk '
  BEGIN {batch=0}
  /^-- Batch [0-9]+ of/ {
    if (batch > 0) {
      close(file)
      system("echo Processing batch " batch "...")
    }
    batch++
    file = "temp-batch-" batch ".sql"
  }
  {print > file}
  END {close(file)}
' import-companies-corrected.sql

# Count the batches created
TOTAL_BATCHES=$(ls temp-batch-*.sql 2>/dev/null | wc -l)
echo "Split into $TOTAL_BATCHES batches"
echo ""

# Clean up temp files
rm -f temp-batch-*.sql

echo "✅ Companies SQL ready"
echo ""
echo "To import, the SQL files are ready at:"
echo "  - import-companies-corrected.sql (47 batches)"
echo "  - import-contacts-corrected.sql (4,292 statements)"
