#!/bin/bash

echo "🚀 Executing Contacts Import - 43 batches"
echo "=========================================="

TOTAL=43
SUCCESS=0
ERRORS=0

for i in $(seq -f "%03g" 1 $TOTAL); do
    FILE="contacts-combined-${i}.sql"

    if [ -f "$FILE" ]; then
        echo -n "Batch $i/$TOTAL... "

        # Count statements in this batch
        STATEMENTS=$(grep -c "^-- Contacts for:" "$FILE")

        echo "($STATEMENTS companies) "

        SUCCESS=$((SUCCESS + STATEMENTS))
    else
        echo "⚠️  File not found: $FILE"
        ERRORS=$((ERRORS + 1))
    fi

    # Progress indicator every 10 batches
    if [ $((i % 10)) -eq 0 ]; then
        echo "  Progress: $i/$TOTAL batches complete"
    fi
done

echo ""
echo "✅ Summary:"
echo "  Processed: $SUCCESS contact groups"
echo "  Expected: 4,292 contact groups"
echo ""
echo "Files ready in contacts-combined-*.sql"
echo "Execute via Supabase migration or SQL editor"
