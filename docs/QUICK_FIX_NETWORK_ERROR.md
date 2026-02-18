# Quick Fix: Network Request Failed Error

## The Problem
```
Error initializing payment: [TypeError: Network request failed]
```

This happens because the mobile app is trying to connect to `http://localhost:3000`, but `localhost` doesn't work when running on a device/emulator.

## Quick Fix (3 Steps)

### Step 1: Find Your Computer's IP Address

**On macOS:**
```bash
ipconfig getifaddr en0
```

**On Windows:**
```bash
ipconfig
# Look for "IPv4 Address" (e.g., 192.168.1.100)
```

**On Linux:**
```bash
hostname -I | awk '{print $1}'
```

**Or use the helper script:**
```bash
cd apps/mobile
chmod +x get-ip.sh
./get-ip.sh
```

### Step 2: Update Mobile App `.env`

Open `apps/mobile/.env` and change:

```bash
# ❌ This doesn't work on devices/emulators
EXPO_PUBLIC_ADMIN_API_URL=http://localhost:3000

# ✅ Use your computer's IP address instead
EXPO_PUBLIC_ADMIN_API_URL=http://192.168.1.100:3000
```

Replace `192.168.1.100` with YOUR actual IP address from Step 1.

### Step 3: Restart Everything

```bash
# Stop Expo (Ctrl+C in the terminal)

# Restart Expo
cd apps/mobile
pnpm dev

# Make sure admin app is also running
cd apps/admin
pnpm dev
```

## Verify It Works

Test the connection:
```bash
# Replace with your IP
curl http://192.168.1.100:3000/api/
Check Both Devices on Same Network
- Your computer and phone/emulator must be on the same WiFi network
- Turn off VPN if you have one running

### Check Firewall
Your firewall might be blocking port 3000. Temporarily disable it or add an exception.

### Check Admin App Logs
Look for any errors in the admin app terminal when the mobile app tries to connect.

## For Production

When deploying to production, use your deployed admin app URL:

```bash
EXPO_PUBLIC_ADMIN_API_URL=https://your-admin-app.vercel.app
```

---

**TL;DR:**
1. Find your IP: `ipconfig getifaddr en0` (macOS)
2. Update `.env`: `EXPO_PUBLIC_ADMIN_API_URL=http://YOUR_IP:3000`
3. Restart Expo: `pnpm dev`
