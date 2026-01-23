# Quick Diagnostics

## Check Environment Variables

```bash
# Windows CMD
echo %GEMINI_API_KEY%
echo %NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY%
echo %DATABASE_URL%

# PowerShell
$env:GEMINI_API_KEY
$env:NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
$env:DATABASE_URL
```

## Check API Endpoint Status

Visit in your browser:

```
http://localhost:3001/api/dev/status
```

Expected response:

```json
{
  "GEMINI_API_KEY": "present", // or "missing"
  "DATABASE_URL": "file:./prisma/dev.db",
  "DATABASE_STATUS": "connected" // or "error"
}
```

## Check Database

```bash
# Test Prisma connection
npx prisma db execute --stdin

# List all tables
npx prisma db execute --stdin < SELECT name FROM sqlite_master WHERE type='table';

# Check migrations
npx prisma migrate status
```

## View Server Logs

The server outputs logs like:

```
✓ Compiled in 673ms
✓ Ready in 2.2s
```

If you see errors, look for:

- `Error:` - Something went wrong
- `WARN:` - Warning that might cause issues
- `INFO:` - Informational message

## Browser Console Diagnostics

Press `F12` and go to Console tab. Look for:

**Good signs:**

- No errors
- No hydration warnings
- API calls succeed (green status codes)

**Bad signs:**

- Red errors
- "Hydration mismatch"
- Network failures (red requests)

## Test Cover Letter Generation

1. Open browser DevTools (F12)
2. Go to Network tab
3. Go to Cover Letter page
4. Fill form and click Generate
5. Watch the Network tab:
   - Should see a POST request to the server action
   - Should return status 200 (success)
   - If you see error, click it and see Response tab for details

## Check if GEMINI_API_KEY Works

```bash
# Test the API key directly
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{"contents": [{"parts": [{"text": "Hello"}]}]}'
```

Or in Node.js:

```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("YOUR_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const result = await model.generateContent("Hello");
console.log(result.response.text());
```

## Test Each Feature

### Resume Page

```
1. Go to http://localhost:3001/resume
2. Check for yellow warning (if DB not available)
3. Try adding a work entry
4. Click "Improve with AI"
5. Should show error if GEMINI_API_KEY missing, or improve text if present
```

### Cover Letter Page

```
1. Go to http://localhost:3001/ai-cover-letter
2. Fill: Company Name, Job Title, Job Description
3. Click "Generate"
4. Check browser console for errors
5. Check Network tab to see API call
```

### Interview Page

```
1. Go to http://localhost:3001/interview
2. Click "Start New Quiz"
3. Select industry and sub-industry
4. Click "Generate Quiz"
5. Should generate 10 questions or show error
```

### Dashboard Page

```
1. Go to http://localhost:3001/dashboard
2. Should show industry insights
3. Check for yellow warning if insights not available
```

## Common Issues Checklist

- [ ] Is GEMINI_API_KEY set?

  ```bash
  echo $GEMINI_API_KEY  # or %GEMINI_API_KEY% on Windows
  ```

- [ ] Is DATABASE_URL correct?

  ```bash
  echo $DATABASE_URL  # should show file:./prisma/dev.db or postgresql://...
  ```

- [ ] Are all dependencies installed?

  ```bash
  npm ls @google/generative-ai
  npm ls @prisma/client
  npm ls @clerk/nextjs
  ```

- [ ] Is dev server running?

  ```bash
  # Should see: http://localhost:3001
  # and: ✓ Ready in Xs
  ```

- [ ] Do database tables exist?

  ```bash
  npx prisma db execute --stdin < SELECT * FROM sqlite_master WHERE type='table';
  ```

- [ ] Is Clerk configured?
  ```
  Check if you can sign in successfully
  Check if user appears in Clerk dashboard at clerk.com
  ```

## Reset Everything (if needed)

```bash
# Clear dependencies
rm -r node_modules
rm package-lock.json

# Reinstall
npm install

# Reset database (deletes all data!)
npx prisma migrate reset

# Clear Next.js cache
rm -r .next

# Restart server
npm run dev
```

## Request Format for Cover Letter Generation

The server expects:

```json
{
  "companyName": "Google",
  "jobTitle": "Senior Software Engineer",
  "jobDescription": "We're looking for...",
  "userId": "user_123" // automatically from Clerk
}
```

Response on success:

```json
{
  "id": "cl_xxx",
  "content": "# Cover Letter\n...",
  "companyName": "Google",
  "jobTitle": "Senior Software Engineer",
  "status": "completed",
  "createdAt": "2025-01-23T..."
}
```

Response on error:

```json
{
  "message": "AI service not configured (GEMINI_API_KEY). Please check your environment variables."
}
```

## Performance Check

If features are slow:

1. Check if GEMINI_API_KEY requests are taking time
2. Check if database queries are slow
3. Use Network tab in DevTools to see timing

Expected times:

- Cover letter generation: 10-30 seconds
- Resume improvement: 5-15 seconds
- Quiz generation: 15-30 seconds
- Resume save: 1-3 seconds

If slower:

- Check internet connection
- Check if API is rate limited
- Check if running on low-power machine

## Error Log Locations

- **Browser Console:** Press F12 → Console tab
- **Server Terminal:** Where you ran `npm run dev`
- **Network Errors:** F12 → Network tab → look for red requests
- **API Logs:** F12 → Network tab → click request → Response tab

## Quick Test URL

Go to: `http://localhost:3001/api/dev/status`

This shows:

- Environment variable presence
- Database connection status
- Useful for quick debugging
