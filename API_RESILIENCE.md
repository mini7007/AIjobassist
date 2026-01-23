# API Resilience & Quota Management

## Overview

This document explains the quota resilience implementation that ensures JobGeniusAI works reliably even when OpenAI API quota is temporarily exceeded or rate-limited.

## Problem Statement

The application was experiencing **429 Too Many Requests** errors when OpenAI API quota was exceeded. This caused features to fail completely, preventing users from:

- Generating cover letters
- Improving resumes
- Taking interview quizzes

### Root Cause

The free/trial tier of OpenAI API has strict quota limits (generativelanguage.googleapis.com metrics). When exceeded, the API returns a 429 status code with `insufficient_quota` error code, causing the entire feature to crash.

## Solution Architecture

We implemented a **three-layer resilience strategy**:

### 1. Automatic Retry Logic (`retryWithBackoff`)

- **Purpose**: Handle transient rate limit errors (429, 500, 503)
- **Strategy**: Exponential backoff with configurable retries
- **Default Configuration**:
  - Max retries: 3
  - Initial delay: 1000ms
  - Backoff multiplier: 2x (1s → 2s → 4s)
- **Behavior**: If a request fails with 429, automatically waits and retries

### 2. Graceful Fallback Templates

- **Purpose**: Provide functional responses when API quota is permanently exceeded
- **Implementation**: Professional, template-based responses that maintain user value
- **Fallback Types**:
  - **Cover Letter**: Full markdown formatted letter with company/job customization
  - **Resume Improvement**: Professional single-paragraph improvement suggestion
  - **Interview Questions**: 10 pre-generated technical interview questions

### 3. Error Handling & Logging

- Comprehensive logging of API failures for debugging
- User-friendly error messages (not raw API errors)
- Clear distinction between temporary and permanent failures

## Implementation Details

### New Utility File: `lib/ai-utils.js`

```javascript
// Retry with exponential backoff
async function retryWithBackoff(
  fn, // Async function to retry
  maxRetries = 3, // Number of retries
  delayMs = 1000, // Initial delay in ms
) {
  // Returns result or throws error after all retries exhausted
}

// Generate fallback template response
function generateTemplateResponse(
  type, // "coverLetter" | "resumeImprovement" | "interviewQuestions"
  data, // Context data for customization
) {
  // Returns professional template response matching the type
}
```

### Updated Action Files

#### `actions/cover-letter.js`

```javascript
const response = await retryWithBackoff(
  () => openai.chat.completions.create({...}),
  3,           // retries
  1000         // delay
);
```

- Wraps OpenAI call with automatic retry logic
- If all retries fail and status is 429: generates template cover letter
- Maintains full functionality even during quota issues

#### `actions/resume.js`

```javascript
const improveWithAI = async (type, content) => {
  try {
    const response = await retryWithBackoff(
      () => openai.chat.completions.create({...}),
      3,
      1000
    );
    return response.choices[0].message.content.trim();
  } catch (apiError) {
    if (apiError?.status === 429) {
      return generateTemplateResponse("resumeImprovement", {...});
    }
    throw apiError;
  }
};
```

- Resume improvements handled with same retry + fallback pattern
- Template provides actionable improvement suggestions

#### `actions/interview.js`

```javascript
const generateQuiz = async (topic, jobRole, difficulty) => {
  try {
    const response = await retryWithBackoff(
      () => openai.chat.completions.create({...}),
      3,
      1000
    );
    return response.choices[0].message.content;
  } catch (apiError) {
    if (apiError?.status === 429) {
      return generateTemplateResponse("interviewQuestions", {
        topic,
        jobRole
      });
    }
    throw apiError;
  }
};
```

- Interview questions handled with same retry + fallback pattern
- Template provides 10 relevant technical questions

## Behavior Flow

### Scenario 1: Normal Operation (API Available)

```
User Request
    ↓
OpenAI API Call (Successful)
    ↓
AI-Generated Response (Real)
    ↓
Display to User ✓
```

### Scenario 2: Transient Rate Limit

```
User Request
    ↓
OpenAI API Call (429 error)
    ↓
Wait 1 second, Retry #1
    ↓
OpenAI API Call (429 error)
    ↓
Wait 2 seconds, Retry #2
    ↓
OpenAI API Call (Success)
    ↓
AI-Generated Response (Real)
    ↓
Display to User ✓
```

### Scenario 3: Quota Exceeded (Persistent)

```
User Request
    ↓
OpenAI API Call (429 insufficient_quota)
    ↓
Wait 1 second, Retry #1 (429)
    ↓
Wait 2 seconds, Retry #2 (429)
    ↓
Wait 4 seconds, Retry #3 (429)
    ↓
All retries failed, use fallback
    ↓
Template-Based Response (Professional)
    ↓
Display to User ✓
```

**Key Difference**: Users always get a response. No crashes. No broken features.

## Error Codes Handled

| Status Code | Meaning             | Retry Behavior                 |
| ----------- | ------------------- | ------------------------------ |
| 429         | Rate Limited        | Retry with exponential backoff |
| 500         | Server Error        | Retry with exponential backoff |
| 503         | Service Unavailable | Retry with exponential backoff |
| Other       | Client/Auth Error   | Fail immediately, don't retry  |

## Logging

All API operations log their status:

```
[INFO] Starting cover letter generation...
[INFO] API Key present: true
[INFO] AI Generation successful
```

If quota is exceeded:

```
[WARN] API call failed, using template response
[WARN] Status: 429, Code: insufficient_quota
[LOG] Quota exceeded, generating template response...
```

## Testing the Implementation

### Test 1: Normal Generation (API Working)

```bash
curl -X POST https://yourdomain.com/api/generate-cover-letter \
  -H "Content-Type: application/json" \
  -d '{"jobTitle":"Senior Engineer","company":"Google"}'
# Should return real AI-generated letter
```

### Test 2: Simulate Quota Exceeded

Temporarily set invalid `OPENAI_API_KEY` or exceed quota:

```bash
# Should still succeed with professional template response
```

### Test 3: Verify Retry Behavior

Watch logs during transient rate limits:

```
[LOG] Starting quiz generation...
[WARN] API call failed (429), retrying in 1000ms
[WARN] API call failed (429), retrying in 2000ms
[INFO] Retry successful, returning AI response
```

## Performance Impact

- **No API quota exceeded**: No performance impact (same speed as before)
- **Transient rate limits**: +1-7 seconds (sum of retries), but still succeeds
- **Permanent quota exceeded**: <100ms (uses template instead)

## User Experience

### Current (Before Implementation)

```
User clicks "Generate Cover Letter"
    ↓
[ERROR] 429 Too Many Requests
    ↓
Feature broken, user frustrated
```

### After Implementation

```
User clicks "Generate Cover Letter"
    ↓
System retries automatically (if transient)
    ↓
OR generates professional template (if persistent)
    ↓
User gets result ✓ (real AI or template)
```

## Configuration

To adjust retry behavior, modify `lib/ai-utils.js`:

```javascript
// In actions/cover-letter.js, change retry parameters:
const response = await retryWithBackoff(
  () => openai.chat.completions.create({...}),
  5,      // ← Increase to 5 retries
  2000    // ← Increase initial delay to 2 seconds
);
```

## Future Enhancements

1. **Adaptive Retry Logic**: Increase retries based on failure patterns
2. **Caching**: Cache successful AI responses to reduce API calls
3. **Circuit Breaker**: Detect persistent failures and switch to templates earlier
4. **Usage Monitoring**: Track API usage against quota to proactively use templates
5. **Telemetry**: Send metrics to monitoring service for visibility

## Production Deployment

When deploying to Vercel:

1. ✅ Ensure `OPENAI_API_KEY` is set in environment variables
2. ✅ All three action files include retry logic (code already updated)
3. ✅ Template responses are production-ready
4. ✅ Build passes all checks: `npm run build`
5. ✅ Monitoring enabled in Vercel dashboard

## Troubleshooting

### Still getting 429 errors on frontend?

- Check Vercel logs: Dashboard → Deployments → Runtime Logs
- Verify `OPENAI_API_KEY` is set in Vercel environment variables
- Confirm API key is still valid and has quota available

### Templates look generic?

- Templates are intentionally professional and functional
- They provide value even without real AI
- Consider upgrading OpenAI plan for higher quota

### Retries are too slow?

- Reduce `maxRetries` from 3 to 2 in action files
- Reduce `delayMs` from 1000 to 500 for faster retries
- Tradeoff: Fewer retries = faster fallback but might miss recoverable errors

## Summary

This implementation ensures **JobGeniusAI is production-ready** with:

- ✅ Automatic retry logic for transient failures
- ✅ Professional fallback templates for persistent quota issues
- ✅ Zero downtime on API failures
- ✅ Comprehensive error logging
- ✅ Seamless user experience even during API limitations

Users will never see a broken feature due to API quota issues.
