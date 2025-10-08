#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     STRIPE CLI - CREATE TEST PAYOUT FOR RECONCILIATION    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if Stripe CLI is logged in
echo "🔐 Checking Stripe CLI authentication..."
if ! stripe config --list &>/dev/null; then
    echo "❌ Not logged in to Stripe CLI"
    echo ""
    echo "Please run: stripe login"
    echo "This will open your browser to authenticate"
    exit 1
fi

echo "✅ Authenticated to Stripe CLI"
echo ""

# Get current account info
echo "📊 Checking current Stripe test account..."
BALANCE_INFO=$(stripe balance retrieve 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ Failed to retrieve balance. Make sure you're in TEST MODE."
    echo ""
    echo "To switch to test mode:"
    echo "  stripe config --set test_mode true"
    exit 1
fi

echo "✅ Connected to Stripe test mode"
echo ""

# Check current balance
echo "💰 Current Balance:"
stripe balance retrieve --format=json 2>/dev/null | jq -r '.available[] | "   Available: \(.currency | ascii_upcase) \(.amount / 100)"'
stripe balance retrieve --format=json 2>/dev/null | jq -r '.pending[] | "   Pending: \(.currency | ascii_upcase) \(.amount / 100)"'
echo ""

# Create a test charge
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Creating Test Charge"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

CHARGE=$(stripe charges create \
  --amount=5000 \
  --currency=usd \
  --source=tok_bypassPending \
  --description="FinaclyAI Test Reconciliation Charge" \
  --format=json 2>/dev/null)

if [ $? -eq 0 ]; then
    CHARGE_ID=$(echo "$CHARGE" | jq -r '.id')
    CHARGE_AMOUNT=$(echo "$CHARGE" | jq -r '.amount / 100')
    echo "✅ Charge Created: $CHARGE_ID"
    echo "   Amount: USD $CHARGE_AMOUNT"
    echo "   Status: $(echo "$CHARGE" | jq -r '.status')"
else
    echo "❌ Failed to create charge"
    exit 1
fi

echo ""
echo "⏳ Waiting 2 seconds for charge to process..."
sleep 2

# Check balance again
echo ""
echo "💰 Updated Balance:"
stripe balance retrieve --format=json 2>/dev/null | jq -r '.available[] | "   Available: \(.currency | ascii_upcase) \(.amount / 100)"'
stripe balance retrieve --format=json 2>/dev/null | jq -r '.pending[] | "   Pending: \(.currency | ascii_upcase) \(.amount / 100)"'

# Get available balance amount
AVAILABLE=$(stripe balance retrieve --format=json 2>/dev/null | jq -r '.available[0].amount // 0')

echo ""

if [ "$AVAILABLE" -gt 1000 ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Creating Test Payout"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Create payout for half the available balance
    PAYOUT_AMOUNT=$((AVAILABLE / 2))
    
    PAYOUT=$(stripe payouts create \
      --amount=$PAYOUT_AMOUNT \
      --currency=usd \
      --description="FinaclyAI Test Reconciliation Payout" \
      --format=json 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        PAYOUT_ID=$(echo "$PAYOUT" | jq -r '.id')
        PAYOUT_USD=$(echo "$PAYOUT" | jq -r '.amount / 100')
        echo "✅ Payout Created: $PAYOUT_ID"
        echo "   Amount: USD $PAYOUT_USD"
        echo "   Status: $(echo "$PAYOUT" | jq -r '.status')"
        echo "   Arrival Date: $(echo "$PAYOUT" | jq -r '.arrival_date')"
        
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "✅ TEST DATA CREATED SUCCESSFULLY!"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "📋 Summary:"
        echo "   • Charge: $CHARGE_ID ($CHARGE_AMOUNT USD)"
        echo "   • Payout: $PAYOUT_ID ($PAYOUT_USD USD)"
        echo ""
        echo "🎯 Next Step: Test the reconciliation flow"
        echo ""
        echo "   npm run test:reconciliation"
        echo ""
        echo "This will:"
        echo "   1. Sync Stripe data (including your new payout)"
        echo "   2. Run the matching engine"
        echo "   3. Show how payouts are reconciled"
        echo "   4. Demonstrate exception detection and auto-fix"
        echo ""
    else
        echo "❌ Failed to create payout"
        echo ""
        echo "Note: Stripe test mode may have restrictions on instant payouts."
        echo "Your charge was created successfully and will show in reconciliation."
    fi
else
    echo "⚠️  Available balance too low for payout ($AVAILABLE minor units)"
    echo ""
    echo "The charge was created successfully!"
    echo "It will appear in your Stripe sync."
    echo ""
    echo "💡 Tip: In test mode, you can use 'tok_bypassPending' to bypass"
    echo "the pending period, or wait for the balance to settle."
    echo ""
    echo "You can still test reconciliation with:"
    echo "   npm run test:reconciliation"
fi

echo ""
echo "🎉 Ready to test reconciliation!"
echo ""

