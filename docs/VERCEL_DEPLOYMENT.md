# Vercel Deployment Guide for Turborepo + pnpm

## Issue
When deploying the admin Next.js app to Vercel, you encounter pnpm fetch errors:
```
ERR_PNPM_META_FETCH_FAIL GET https://registry.npmjs.org/@eslint%2Fjs:
Value of "this" must be of type URLSearchParams
```

## Root Cause
This is a known compatibility issue between:
- pnpm's custom fetch implementation
- Vercel's Node.js environment
- Turborepo monorepo structure

## Solution

### Step 1: Configure Vercel Project Settings

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Click "Settings"

2. **Set Root Directory**
   - Go to "General" tab
   - Set **Root Directory**: Leave empty (use monorepo root)
   - Or set to `apps/admin` if deploying only admin app

3. **Set Build & Development Settings**
   - Go to "Build & Development Settings"
   - **Framework Preset**: Other
   - **Build Command**: `cd apps/admin && pnpm build`
   - **Output Directory**: `apps/admin/.next`
   - **Install Command**: `pnpm i

fetch-timeout=300000
strict-peer-dependencies=false
shamefully-hoist=true
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
public-hoist-pattern[]=@types/*
network-timeout=300000
side-effects-cache=false
```

#### `vercel.json` (root)
```json
{
  "buildCommand": "cd apps/admin && pnpm build",
  "installCommand": "pnpm install --no-frozen-lockfile",
  "framework": null,
  "outputDirectory": "apps/admin/.next",
  "env": {
    "ENABLE_EXPERIMENTAL_COREPACK": "1"
  }
}
```

#### `package.json` (root)
```json
{
  "packageManager": "pnpm@8.6.12",
  "engines": {
    "node": ">=18"
  }
}
```

### Step 3: Set Environment Variables

In Vercel Dashboard > Settings > Environment Variables, add:

**Supabase**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Bunny.net**:
- `BUNNY_API_KEY`
- `BUNNY_LIBRARY_ID`

**PayUnit**:
- `PAYUNIT_API_USERNAME`
- `PAYUNIT_API_PASSWORD`
- `PAYUNIT_SANDBOX_API_KEY`
- `PAYUNIT_API_KEY` (for production)
- `PAYUNIT_MODE` (set to `test` or `live`)

**App**:
- `NEXT_PUBLIC_APP_URL` (your Vercel deployment URL)

### Step 4: Deploy

1. **Push to Git**
   ```bash
   git add .
   git commit -m "Configure Vercel deployment"
   git push
   ```

2. **Trigger Deployment**
   - Vercel will automatically deploy on push
   - Or manually trigger from Vercel Dashboard

3. **Monitor Build**
   - Watch the build logs in Vercel Dashboard
   - Check for any errors

## Alternative: Deploy Without Turborepo

If you continue to have issues, you can deploy the admin app directly:

### Option A: Deploy from apps/admin subdirectory

1. **Vercel Settings**:
   - Root Directory: `apps/admin`
   - Framework: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

2. **Create `apps/admin/package.json`** with all dependencies (not workspace references)

### Option B: Use npm instead of pnpm

1. **Convert workspace dependencies**:
   - Replace `"@repo/types": "workspace:*"` with actual version
   - Or copy shared code into admin app

2. **Use npm**:
   - Delete `pnpm-lock.yaml`
   - Run `npm install`
   - Commit `package-lock.json`
   - Vercel will use npm automatically

## Troubleshooting

### Issue: Still getting fetch errors
**Solution**:
1. Try pnpm version `8.6.12` (most stable with Vercel)
2. Or try `7.33.7` (older but very stable)
3. Update `package.json`: `"packageManager": "pnpm@8.6.12"`

### Issue: Workspace dependencies not found
**Solution**:
1. Make sure `pnpm-workspace.yaml` is in root
2. Verify `turbo.json` has correct pipeline
3. Check that shared packages are built before admin app

### Issue: Build succeeds but runtime errors
**Solution**:
1. Check environment variables are set
2. Verify Supabase URLs are correct
3. Check PayUnit credentials
4. Test locally with production build: `pnpm build && pnpm start`

### Issue: Out of memory during build
**Solution**:
1. Upgrade Vercel plan (Pro has more memory)
2. Or optimize build:
   ```json
   // next.config.mjs
   experimental: {
     workerThreads: false,
     cpus: 1
   }
   ```

### Issue: Deployment timeout
**Solution**:
1. Reduce dependencies
2. Use `--no-frozen-lockfile` in install command
3. Enable build cache in Vercel settings

## Recommended pnpm Versions for Vercel

Based on community feedback:

1. **pnpm@8.6.12** ✅ Most stable (recommended)
2. **pnpm@7.33.7** ✅ Very stable (older)
3. **pnpm@8.15.0** ⚠️ Some issues
4. **pnpm@9.0.0** ❌ Known issues with Vercel

## Testing Locally

Before deploying, test the build locally:

```bash
# Clean install
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install

# Build admin app
cd apps/admin
pnpm build

# Test production build
pnpm start
```

## Vercel CLI Deployment

You can also deploy using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Monorepo Best Practices

1. **Keep dependencies in sync**: Use workspace protocol
2. **Build order**: Ensure shared packages build first
3. **Environment variables**: Set in Vercel, not in code
4. **Caching**: Enable Turborepo cache in Vercel
5. **Testing**: Test builds locally before deploying

## Additional Resources

- [Vercel Monorepo Guide](https://vercel.com/docs/concepts/monorepos)
- [Turborepo Deployment](https://turbo.build/repo/docs/handbook/deploying-with-docker)
- [pnpm on Vercel](https://pnpm.io/continuous-integration#vercel)

## Success Checklist

- [ ] `.npmrc` configured with correct settings
- [ ] `vercel.json` has correct build commands
- [ ] `package.json` has compatible pnpm version
- [ ] Environment variables set in Vercel
- [ ] Root directory configured correctly
- [ ] Node.js version set to 18.x
- [ ] Corepack enabled
- [ ] Build succeeds locally
- [ ] All dependencies installed
- [ ] Shared packages built before admin app

## Conclusion

The key to successful Vercel deployment with Turborepo + pnpm is:
1. Use a stable pnpm version (8.6.12)
2. Configure `.npmrc` properly
3. Set correct build commands
4. Enable Corepack
5. Set all environment variables

Once configured, deployments should work smoothly! 🎉
