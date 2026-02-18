# Network Setup for Mobile App

## Problem
The mobile app can't connect to `http://localhost:3000` because:
- **iOS Simulator**: `localhost` refers to the simulator, not your Mac
- **Android Emulator**: `localhost` refers to the emulator, not your computer
- **Physical Device**: `localhost` doesn't exist on the device

## Solution

### Option 1: Use Your Computer's IP Address (Recommended)

1. **Find your computer's IP address:**

   **On macOS:**
   ```bash
   ipconfig getifaddr en0
   # or
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

   **On Windows:**
   ```bash
   ipconfig
   # Look for "IPv4 Address" under your active network adapter
   ```

   **On Linux:**
   ```bash
   hostname -I | awk '{print $1}'
   ```

2. **Update `.env` file:**
   ```bash
   # Replace localhost with your IP address
   EXPO_PUBLIC_ADMIN_API_URL=http://192.168.1.100:3000
   ```

3. **Restart Expo:**
   ```bash
   # Stop the current Expo server (Ctrl+C)
   pnpm dev
   ```

### Option 2: Use Android Emulator Special Address

If you're using **Android Emulator only**, you can use:
```bash
EXPO_PUBLIC_ADMIN_API_URL=http://10.0.2.2:3000
```

`10.0.2.2` is a special alias to your host machine's `localhost` in Android emulator.

### Option 3: Use Expo Tunnel (For Physical Devices)

If you're testing on a physical device over different networks:

1. **Start Expo with tunnel:**
   ```bash
   pnpm dev --tunnel
   ```

2. **Deploy admin app to a public URL** (Vercel, Netlify, etc.)

3. **Update `.env`:**
   ```bash
   EXPO_PUBLIC_ADMIN_API_URL=https://your-admin-app.vercel.app
   ```

## Quick Setup Script

Create a file `apps/mobile/get-ip.sh`:

```bash
#!/bin/bash

# Get local IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ipconfig getifaddr en0)
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    IP=$(hostname -I | awk '{print $1}')
else
    echo "Please manually find your IP address"
    exit 1
fi

echo "Your local IP address is: $IP"
echo ""
echo "Update your .env file with:"
echo "EXPO_PUBLIC_ADMIN_API_URL=http://$IP:3000"
```

Make it executable and run:
```bash
chmod +x apps/mobile/get-ip.sh
./apps/mobile/get-ip.sh
```

## Verification

1. **Check admin app is accessible:**
   ```bash
   # Replace with your IP
   curl http://192.168.1.100:3000/api/payments/webhook
   ```

   Should return:
   ```json
   {"message":"PayUnit webhook endpoint","status":"active"}
   ```

2. **Test from mobile app:**
   - Open the app
   - Try to enroll in a paid course
   - Check console logs for connection errors

## Common Issues

### "Network request failed"
- ✅ Check admin app is running: `cd apps/admin && pnpm dev`
- ✅ Verify IP address is correct
- ✅ Ensure both devices are on the same network
- ✅ Check firewall isn't blocking port 3000

### "Connection refused"
- ✅ Admin app not running
- ✅ Wrong port number
- ✅ Firewall blocking connections

### "Timeout"
- ✅ Devices on different networks
- ✅ VPN interfering with connection
- ✅ Router blocking local network traffic

## Production Setup

For production, use your deployed admin app URL:

```bash
# In production .env
EXPO_PUBLIC_ADMIN_API_URL=https://admin.yourdomain.com
```

## Testing Checklist

- [ ] Found your computer's IP address
- [ ] Updated `EXPO_PUBLIC_ADMIN_API_URL` in `.env`
- [ ] Restarted Expo dev server
- [ ] Admin app is running
- [ ] Both devices on same network
- [ ] Tested API endpoint with curl
- [ ] Tested payment flow in mobile app

## Environment-Specific Configuration

You can create multiple `.env` files:

```bash
# .env.local (for local development)
EXPO_PUBLIC_ADMIN_API_URL=http://192.168.1.100:3000

# .env.staging (for staging)
EXPO_PUBLIC_ADMIN_API_URL=https://staging-admin.yourdomain.com

# .env.production (for production)
EXPO_PUBLIC_ADMIN_API_URL=https://admin.yourdomain.com
```

Then use:
```bash
# Load specific environment
cp .env.local .env
pnpm dev
```
