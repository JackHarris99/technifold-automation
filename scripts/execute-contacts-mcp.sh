#!/bin/bash

echo "🚀 Executing Contacts Import via Supabase"
echo "==========================================="
echo ""

TOTAL=43
SUCCESS=0
ERRORS=0

for i in $(seq -f "%03g" 1 $TOTAL); do
    FILE="contacts-combined-${i}.sql"

    if [ -f "$FILE" ]; then
        echo -n "Batch $i/$TOTAL... "

        # Execute via npx supabase db execute
        if npx supabase db execute --file "$FILE" --project-ref $(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d'/' -f3 | cut -d'.' -f1) 2>&1 | grep -q "Error"; then
            echo "❌ ERROR"
            ERRORS=$((ERRORS + 1))
        else
            echo "✅ OK"
            SUCCESS=$((SUCCESS + 1))
        fi
    else
        echo "⚠️  File not found: $FILE"
        ERRORS=$((ERRORS + 1))
    fi

    # Progress indicator every 10 batches
    NUM=$((10#$i))
    if [ $((NUM % 10)) -eq 0 ]; then
        echo "  Progress: $i/$TOTAL batches complete ($SUCCESS succeeded, $ERRORS errors)"
    fi
done

echo ""
echo "✅ Summary:"
echo "  Succeeded: $SUCCESS batches"
echo "  Errors: $ERRORS batches"
