#!/bin/bash

echo "🔍 Finding your local IP address..."
echo ""

# Get local IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ipconfig getifaddr en0 2>/dev/null)
    if [ -z "$IP" ]; then
        IP=$(ipconfig getifaddr en1 2>/dev/null)
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    IP=$(hostname -I | awk '{print $1}')
else
    echo "❌ Unsupported OS. Please manually find your IP address."
    echo ""
    echo "On Windows, run: ipconfig"
    echo "Look for 'IPv4 Address' under your active network adapter"
    exit 1
fi

if [ -z "$IP" ]; then
    echo "❌ Could not detect IP address automatically."
    echo ""
    echo "Please manually find your IP address:"
    echo "  macOS: System Preferences > Network"
    echo "  Linux: ip addr show"
    echo "  Windows: ipconfig"
    exit 1
fi

echo "✅ Your local IP address is: $IP"
echo ""
echo "📝 Update your .env file with:"
echo ""
echo "EXPO_PUBLIC_ADMIN_API_URL=http://$IP:3000"
echo ""
echo "Then restart your Expo dev server:"
echo "  pnpm dev"
echo ""
echo "🧪 Test the connection:"
echo "  curl http://$IP:3000/api/payments/webhook"
echo ""
