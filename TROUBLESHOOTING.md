# JobGeniusAI Troubleshooting Guide

## 1. Hydration Mismatch Error

### What it means:

The error `Error: A tree hydrated but some attributes of the server rendered HTML didn't match the client properties` occurs when browser extensions (like BitWarden, Dashlane, etc.) inject attributes into HTML elements that don't match the server-rendered HTML.

### What we did to fix it:

Added `suppressHydrationWarning` attributes to:

- `<html>` tag (already present)
- `<head>` tag (newly added)
- `<body>` tag (newly added)

### How to verify:

1. Visit the landing page: `http://localhost:3001`
2. Open browser console (F12)
3. Look for hydration warnings - they should be gone or suppressed

### If the error persists:

1. **Disable browser extensions temporarily:**
   - Open DevTools → Settings → Extensions
   - Disable extensions that modify HTML (BitWarden, Dashlane, 1Password, etc.)
   - Refresh the page

2. **Try a different browser** or incognito/private window

3. **Clear browser cache:**
   - Ctrl+Shift+Delete → Clear browsing data → All time

---

## 2. Cover Letter Generation Not Working

### Common Causes:

1. **Missing GEMINI_API_KEY**
2. **Invalid API Key**
3. **Database not configured**
4. **Network/API rate limiting**

### How to diagnose:

1. Check if GEMINI_API_KEY is set in `.env.local`:

   ```bash
   echo %GEMINI_API_KEY%  # Windows CMD
   ```

2. Check the browser console (F12) for error messages

3. Check the server terminal for error logs

4. Visit the diagnostic endpoint:
   ```
   http://localhost:3001/api/dev/status
   ```
   Look for:
   - `GEMINI_API_KEY: "present"` (should show "present" if set)
   - `DATABASE_STATUS: "connected"` (should show the DB status)

### How to fix:

1. **Ensure GEMINI_API_KEY is set:**

   ```bash
   # In .env.local file, add:
   GEMINI_API_KEY=sk_your_actual_api_key_here
   ```

2. **Restart the dev server:**

   ```bash
   npm run dev
   ```

3. **Test cover letter generation:**
   - Go to "Cover Letter" page
   - Fill in:
     - Company Name: "Google"
     - Job Title: "Software Engineer"
     - Job Description: "We're looking for a talented engineer..."
   - Click "Generate Cover Letter"

### Expected behavior:

- You should see a loader animation
- After 10-30 seconds, you should be redirected to the generated cover letter
- The cover letter should appear in the cover letters list

### If it fails:

- An error toast will appear at the top right
- Check the browser console for the full error message
- Common errors:
  - "AI service not configured (GEMINI_API_KEY)" → Add API key to `.env.local`
  - "Database not configured" → Check database connection
  - "API rate limit exceeded" → Wait a few minutes and retry

---

## 3. AI Generation Features Not Working (Resume, Interview, Dashboard)

### Resume AI Enhancement:

**File:** `app/(main)/resume/_components/resume-builder.jsx`

1. Go to Resume Builder
2. Add a work experience entry with a description
3. You should see an "Improve with AI" button
4. Click it - it should enhance the text

**If it fails:**

- Check GEMINI_API_KEY is set
- Check the error message in the toast notification
- Check browser console (F12)

### Interview Quiz Generation:

**File:** `app/(main)/interview/page.jsx`

1. Go to "Interview Prep"
2. Click "Start New Quiz"
3. Select an industry/sub-industry
4. Click "Generate Quiz"
5. You should see 10 questions generated

**If it fails:**

- Check GEMINI_API_KEY is set
- Check if your industry is supported
- Look for error messages in browser console

### Dashboard Industry Insights:

**File:** `app/(main)/dashboard/page.jsx`

1. After onboarding, you should see industry insights
2. If not, you'll see a yellow warning with suggestions

**Common issues:**

- GEMINI_API_KEY not set → insights won't generate
- Database not available → insights stored but can't be retrieved
- First load may take 30+ seconds as it generates new insights

---

## 4. Database Connection Issues

### How to check database status:

1. Visit: `http://localhost:3001/api/dev/status`
2. Look for the `DATABASE_STATUS` field

### If using local SQLite:

```env
DATABASE_URL=file:./prisma/dev.db
```

### If using Neon PostgreSQL (Production):

```env
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]
```

### Run Prisma migrations:

```bash
# Check if migrations are up to date
npx prisma migrate status

# Apply missing migrations
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

---

## 5. Authentication Issues

### If you see "Unauthorized" errors:

1. Check if you're logged in (User avatar should appear in top right)
2. Try signing out and back in
3. Check browser cookies are enabled

### For local development with DEV_USER_ID:

Set in `.env.local`:

```env
DEV_USER_ID=your_test_user_id
```

This allows you to test without Clerk authentication.

---

## 6. Testing All Features

### Quick test script:

1. **Homepage:** Visit `http://localhost:3001` - should load without errors
2. **Sign In:** Click "Get Started" - should open Clerk modal
3. **Onboarding:** Complete the onboarding form
4. **Dashboard:** Should see industry insights
5. **Resume:** Go to "Build Resume" - add entries and try "Improve with AI"
6. **Cover Letter:** Go to "Cover Letter" - fill form and click generate
7. **Interview:** Go to "Interview Prep" - start quiz

### Expected outcomes:

- ✅ All pages load without hydration errors
- ✅ All AI features show loading states
- ✅ All AI features complete successfully or show clear error messages
- ✅ Database operations work (resume saves, etc.)

---

## 7. Environment Variables Checklist

### Required:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Google Gemini API (for AI features)
GEMINI_API_KEY=your_api_key_here

# Database (choose one)
# For local SQLite:
DATABASE_URL=file:./prisma/dev.db
# OR for Neon PostgreSQL:
DATABASE_URL=postgresql://user:pass@host/db

# Optional: Local development
DEV_USER_ID=dev_user_1  # Allows testing without Clerk
```

### To verify:

```bash
# Check if .env.local exists
test -f .env.local && echo "Found" || echo "Missing"

# See what's set (be careful with secrets!)
cat .env.local | grep GEMINI_API_KEY
```

---

## 8. Common Error Messages & Solutions

| Error                           | Cause                          | Solution                                 |
| ------------------------------- | ------------------------------ | ---------------------------------------- |
| "GEMINI_API_KEY not configured" | API key missing or not set     | Add to `.env.local`, restart server      |
| "Database not configured"       | DATABASE_URL missing/wrong     | Set correct DATABASE_URL in `.env.local` |
| "User not found"                | Clerk auth not working         | Sign out and back in, check Clerk config |
| "Hydration mismatch"            | Browser extensions interfering | Disable extensions or use incognito mode |
| "Cover letter id not found"     | Database table doesn't exist   | Run `npx prisma migrate deploy`          |
| "API rate limit exceeded"       | Too many API requests          | Wait 60+ seconds and retry               |

---

## 9. Getting Help

### Check logs:

1. **Server logs:** Look in the terminal where `npm run dev` is running
2. **Browser console:** F12 → Console tab
3. **Network tab:** F12 → Network tab - check failed requests
4. **Diagnostic API:** `http://localhost:3001/api/dev/status`

### Debug commands:

```bash
# Check Prisma schema
npx prisma db push --skip-generate

# Check database connection
npx prisma db execute --stdin < query.sql

# Generate Prisma client
npx prisma generate

# View database (if using SQLite)
# Install: npm install -g @journeyapps/sqlcipher
# Then: sqlite3 prisma/dev.db ".tables"
```

---

## 10. Quick Start Checklist

- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Create `.env.local` with all required variables
- [ ] Run `npx prisma migrate deploy` (if needed)
- [ ] Run `npm run dev`
- [ ] Test homepage loads
- [ ] Test sign in/onboarding
- [ ] Test each AI feature (resume, cover letter, interview)
- [ ] Check for any error messages in console

---

**Last Updated:** January 23, 2026

For more help, check:

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Google Generative AI API](https://ai.google.dev)
