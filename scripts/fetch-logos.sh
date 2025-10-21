#!/bin/bash

# Script to fetch company logos from Clearbit API
# Stores them locally in public/logos/

LOGOS_DIR="public/logos"
mkdir -p "$LOGOS_DIR"

# Ticker to domain mapping
declare -A DOMAINS=(
  ["AMD"]="amd.com"
  ["AAPL"]="apple.com"
  ["MSFT"]="microsoft.com"
  ["GOOGL"]="google.com"
  ["AMZN"]="amazon.com"
  ["META"]="meta.com"
  ["TSLA"]="tesla.com"
  ["NFLX"]="netflix.com"
  ["JPM"]="jpmorganchase.com"
  ["V"]="visa.com"
  ["JNJ"]="jnj.com"
  ["WMT"]="walmart.com"
  ["PG"]="pg.com"
  ["MA"]="mastercard.com"
  ["UNH"]="unitedhealthgroup.com"
)

echo "🎨 Fetching company logos from Clearbit..."
echo ""

SUCCESS=0
FAILED=0

for ticker in "${!DOMAINS[@]}"; do
  domain="${DOMAINS[$ticker]}"
  output_file="$LOGOS_DIR/${ticker}.png"
  
  echo -n "Fetching $ticker (${domain})... "
  
  if curl -f -s -o "$output_file" "https://logo.clearbit.com/${domain}?size=128"; then
    echo "✅ Success"
    ((SUCCESS++))
  else
    echo "❌ Failed"
    ((FAILED++))
    rm -f "$output_file"
  fi
  
  # Be nice to the API
  sleep 0.5
done

echo ""
echo "📊 Summary:"
echo "  ✅ Downloaded: $SUCCESS"
echo "  ❌ Failed: $FAILED"
echo ""
echo "Logos saved to: $LOGOS_DIR/"

