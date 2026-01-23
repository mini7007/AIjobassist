# Deployment Guide - JobGeniusAI to Vercel

## Quick Start

Your application is already optimized for Vercel deployment. Follow these steps:

### Step 1: Connect Repository to Vercel

1. **Go to** https://vercel.com
2. **Sign in** with GitHub (same account as repository owner)
3. **Click** "Add New Project"
4. **Select** your repository: `mini7007/AIjobassist`
5. **Click** "Import"

### Step 2: Configure Environment Variables

On the Vercel import page, add these environment variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx  # Use live key for production
CLERK_SECRET_KEY=sk_live_xxx                   # Use live key for production

# Google Gemini API
GEMINI_API_KEY=your_api_key_here

# Database - Use production database URL (NOT local sqlite)
DATABASE_URL=postgresql://user:password@host/database

# Inngest (if using)
INNGEST_EVENT_KEY=evt_xxx
INNGEST_SIGNING_KEY=signkey_xxx
```

### Step 3: Configure Build Settings

**Build Command:** `npm run build` (default)  
**Output Directory:** `.next` (default)  
**Install Command:** `npm install` (default)

These are already configured correctly in `package.json` and `next.config.mjs`.

### Step 4: Deploy

**Click** "Deploy"

Vercel will:

1. Clone your repository
2. Install dependencies
3. Run build process
4. Deploy to production

---

## Before Deployment Checklist

### Environment Variables Setup

**You MUST have:**

- [ ] Production Clerk keys (not test keys)
- [ ] Valid GEMINI_API_KEY
- [ ] Production database URL (PostgreSQL, not SQLite)
- [ ] Any other API keys (Inngest, etc.)

**DO NOT use:**

- ❌ `.env.local` values in production
- ❌ DEV_USER_ID in production
- ❌ Local SQLite database

### Code Quality Checks

```bash
# Run build locally to verify it works
npm run build

# Check for any TypeScript/ESLint errors
npm run lint

# Verify no console errors
npm run dev
# Visit http://localhost:3000 and check browser console
```

### Database Preparation

**Before deploying, ensure your production database has:**

```bash
# Apply all migrations to production database
npx prisma migrate deploy --skip-generate

# Verify migrations
npx prisma migrate status
```

---

## Deployment Step-by-Step

### Option 1: Deploy via Vercel Dashboard (Easiest)

```
1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import from GitHub: mini7007/AIjobassist
4. Add environment variables (see step 2 above)
5. Click "Deploy"
6. Wait for deployment to complete
```

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow prompts to configure deployment
# Vercel will ask if you want to link to existing project or create new one
```

### Option 3: Automatic Deployment (GitHub Integration)

```
1. Connect repository to Vercel once (via dashboard)
2. Every push to main branch triggers automatic deployment
3. Check deployment status at https://vercel.com/dashboard
```

---

## Environment Variables Details

### Clerk Setup (Production)

1. **Go to** https://dashboard.clerk.com
2. **Select your application**
3. **Go to** Developers → API Keys
4. **Copy** the **Production** keys (not test keys):
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
5. **Add** to Vercel environment variables

### Gemini API Key

1. **Go to** https://ai.google.dev
2. **Click** "Get API Key"
3. **Create** or use existing API key
4. **Copy** the key
5. **Add as** `GEMINI_API_KEY` in Vercel

### Database URL (Neon PostgreSQL)

If using Neon PostgreSQL:

```bash
# Format: postgresql://[user]:[password]@[host]/[database]
# Example: postgresql://user:pass@ep-xxx.us-east-1.neon.tech/jobgenius

# Get from Neon dashboard:
# 1. Go to https://console.neon.tech
# 2. Select your project
# 3. Click "Connection strings"
# 4. Copy Prisma connection string
# 5. Add as DATABASE_URL
```

---

## Post-Deployment

### Verify Deployment

1. **Check deployment status** at https://vercel.com/dashboard
2. **Visit your live URL** (e.g., https://jobgenious-ai.vercel.app)
3. **Test each feature:**
   - Homepage loads
   - Sign in works
   - Onboarding completes
   - Resume builder functions
   - Cover letter generates
   - Interview quiz works
   - Dashboard shows insights

### Monitor for Errors

**Vercel Logs:**

```
1. Go to https://vercel.com/dashboard
2. Click your project
3. Go to "Deployments"
4. Click latest deployment
5. Check "Logs" for any errors
```

**Vercel Analytics:**

- Already integrated via `@vercel/analytics`
- Dashboard at https://vercel.com/dashboard/analytics

**Errors in Production:**

- Check Vercel logs (see above)
- Check database connection
- Verify all environment variables are set
- Check Clerk dashboard for auth errors

---

## Troubleshooting Deployment Issues

### Build Fails

**Error: "prisma generate failed"**

```
Solution: Ensure @prisma/client is installed
Command: npm install @prisma/client
```

**Error: "GEMINI_API_KEY not found"**

```
Solution: Add GEMINI_API_KEY to Vercel environment variables
Go to Vercel dashboard → Settings → Environment Variables
```

**Error: "Database connection failed"**

```
Solution: Verify DATABASE_URL is correct
Check Neon dashboard for connection string
Ensure IP whitelist includes Vercel
```

### Runtime Errors After Deployment

**"Unauthorized" on pages:**

```
Solution: Verify Clerk keys are correct
Check if production Clerk keys are being used
Verify NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is public key
```

**"AI service not configured":**

```
Solution: GEMINI_API_KEY not set in production
Add to Vercel environment variables
Redeploy with: vercel --prod
```

**"Cannot find module":**

```
Solution: Missing dependency
Run: npm install
Check package.json for all dependencies
```

---

## Production Best Practices

### Security

- [ ] Use production API keys (not test keys)
- [ ] Set database password to be strong/random
- [ ] Enable Vercel Environment Protection
- [ ] Use HTTPS only (automatic with Vercel)
- [ ] Set Content Security Policy headers
- [ ] Review Clerk security settings

### Performance

- [ ] Enable image optimization (default)
- [ ] Enable caching headers (configured in `next.config.mjs`)
- [ ] Monitor bundle size at https://vercel.com/dashboard/analytics
- [ ] Check Core Web Vitals

### Monitoring

- [ ] Set up error tracking (Vercel built-in)
- [ ] Monitor API usage (Gemini dashboard)
- [ ] Monitor database usage (Neon dashboard)
- [ ] Set up alerts for deployment failures

### Backups

- [ ] Database backups (Neon automatic daily backups)
- [ ] Code backups (GitHub)
- [ ] Secret backups (document your keys safely)

---

## Deployment URLs

After deployment, your app will be available at:

```
https://jobgenius-ai.vercel.app          (default Vercel URL)
https://your-custom-domain.com            (if you add custom domain)
```

### Add Custom Domain

1. **Go to** Vercel dashboard → Project settings → Domains
2. **Add** your custom domain
3. **Follow** DNS configuration instructions
4. **Wait** for DNS propagation (up to 48 hours)

---

## Rollback to Previous Deployment

If deployment has issues:

1. **Go to** https://vercel.com/dashboard
2. **Select** your project
3. **Go to** Deployments
4. **Find** the last working deployment
5. **Click** "Promote to Production"

Or revert on GitHub:

```bash
git revert [commit-hash]
git push
# Vercel will automatically redeploy
```

---

## Continuous Deployment

After initial setup, every push to `main` branch will:

1. Trigger GitHub Actions (if configured)
2. Run tests/linting
3. Build the application
4. Deploy to Vercel automatically

No manual deployment needed!

---

## Environment Variables Summary

### Required (All)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
GEMINI_API_KEY=your_key_here
DATABASE_URL=postgresql://user:pass@host/db
```

### Optional

```env
INNGEST_EVENT_KEY=evt_xxx
INNGEST_SIGNING_KEY=signkey_xxx
```

### Development Only (NOT in production)

```env
DEV_USER_ID=dev_user_1
```

---

## Quick Reference Commands

```bash
# Build locally to test
npm run build

# Run production build locally
npm start

# Check for errors before deploying
npm run lint

# Deploy via CLI
vercel --prod

# View deployment logs
vercel logs --follow --prod

# Set environment variable via CLI
vercel env add GEMINI_API_KEY

# List all environment variables
vercel env ls
```

---

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Clerk Docs:** https://clerk.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Gemini API Docs:** https://ai.google.dev/docs

---

## Deployment Checklist (Final)

- [ ] All code committed to GitHub
- [ ] Tests pass locally (`npm run build` succeeds)
- [ ] No TypeScript errors
- [ ] All environment variables prepared
- [ ] Database migrations applied to production
- [ ] Clerk production keys obtained
- [ ] Gemini API key tested
- [ ] Vercel account created and linked
- [ ] Repository imported to Vercel
- [ ] Environment variables added to Vercel
- [ ] Build settings configured (should be automatic)
- [ ] Deploy triggered
- [ ] Deployment verification complete
- [ ] Post-deployment testing done

---

**Status:** Ready for Deployment ✅  
**Latest Commit:** `437a012` - All fixes complete  
**Deployment Target:** Vercel  
**Estimated Deploy Time:** 5-10 minutes
