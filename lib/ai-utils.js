/**
 * Utility functions for handling OpenAI API calls with retry logic
 * and graceful degradation for quota/rate limit issues
 */

/**
 * Retry logic with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delayMs - Initial delay in milliseconds
 * @returns {Promise} Result of function execution
 */
export async function retryWithBackoff(fn, maxRetries = 3, delayMs = 1000) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if error is retryable (rate limit or server error)
      const isRetryable =
        error?.status === 429 || // Rate limit
        error?.status === 500 || // Server error
        error?.status === 503; // Service unavailable

      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      const waitTime = delayMs * Math.pow(2, attempt);
      console.log(
        `Retry attempt ${attempt + 1}/${maxRetries} after ${waitTime}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}

/**
 * Generate a template response when API quota is exceeded
 * This provides a basic but functional response
 */
export function generateTemplateResponse(type, data) {
  switch (type) {
    case "coverLetter":
      return `[AI Service Temporarily Unavailable - Using Template]

Dear Hiring Manager,

I am writing to express my strong interest in the ${data.jobTitle} position at ${data.companyName}.

With my background in ${data.industry} and ${data.experience} years of experience, I am confident that my skills and expertise align well with your requirements. Throughout my career, I have developed strong capabilities in ${data.skills?.slice(0, 2)?.join(" and ") || "various technical domains"}.

I am particularly drawn to this opportunity because of ${data.companyName}'s reputation for innovation and excellence. I am excited about the prospect of contributing to your team and helping drive success.

Thank you for considering my application. I look forward to the opportunity to discuss how my background, skills, and enthusiasm can benefit your organization.

Best regards,
${data.candidateName || "Candidate"}`;

    case "resumeImprovement":
      return `Leveraged advanced technical skills in ${data.skills?.slice(0, 2)?.join(" and ") || "technology"} to drive business outcomes, resulting in measurable improvements in project delivery and team performance across ${data.experience} years of experience.`;

    case "interviewQuestions":
      return {
        questions: [
          {
            question: `Describe your experience with ${data.skills?.[0] || "the required technologies"}.`,
            options: [
              "5+ years of professional experience",
              "2-5 years of professional experience",
              "Less than 2 years of experience",
              "No professional experience",
            ],
            correctAnswer: "5+ years of professional experience",
            explanation: "This question assesses your depth of experience.",
          },
          {
            question: `What is your approach to problem-solving in ${data.industry} projects?`,
            options: [
              "Systematic analysis followed by implementation",
              "Quick trial and error approach",
              "Asking for help immediately",
              "Avoiding complex problems",
            ],
            correctAnswer: "Systematic analysis followed by implementation",
            explanation:
              "Professional problem-solving requires a structured approach.",
          },
          {
            question: "How do you stay updated with industry trends?",
            options: [
              "Regular reading of industry publications and online courses",
              "Only when required by work",
              "Not really concerned about trends",
              "Rely on colleagues for information",
            ],
            correctAnswer:
              "Regular reading of industry publications and online courses",
            explanation: "Continuous learning is essential in tech fields.",
          },
          {
            question: "Describe a challenging project you completed.",
            options: [
              "Detailed explanation with specific metrics and learnings",
              "Vague description with few details",
              "Never worked on challenging projects",
              "Let others describe my projects",
            ],
            correctAnswer:
              "Detailed explanation with specific metrics and learnings",
            explanation:
              "Good candidates can articulate their achievements clearly.",
          },
          {
            question: "How do you handle working with diverse teams?",
            options: [
              "Actively seek different perspectives and collaborate effectively",
              "Prefer working alone",
              "Follow others' decisions",
              "Focus only on individual tasks",
            ],
            correctAnswer:
              "Actively seek different perspectives and collaborate effectively",
            explanation: "Teamwork and collaboration are critical skills.",
          },
          {
            question: `What interests you about ${data.industry}?`,
            options: [
              "Passion for innovation and solving real-world problems",
              "Just need a job",
              "High salary expectations",
              "Heard it was easy",
            ],
            correctAnswer:
              "Passion for innovation and solving real-world problems",
            explanation: "Genuine interest shows in an interview.",
          },
          {
            question: "Where do you see yourself in 5 years?",
            options: [
              "Growing as a specialist or team leader in my field",
              "Not sure",
              "Somewhere else",
              "Retired",
            ],
            correctAnswer: "Growing as a specialist or team leader in my field",
            explanation: "Career vision shows ambition and direction.",
          },
          {
            question: "How do you handle failure?",
            options: [
              "Analyze, learn, and implement improvements",
              "Blame external factors",
              "Give up",
              "Pretend it didn't happen",
            ],
            correctAnswer: "Analyze, learn, and implement improvements",
            explanation:
              "Resilience and learning from failure are important traits.",
          },
          {
            question: "What is your greatest strength?",
            options: [
              "Problem-solving with specific examples",
              "Everything",
              "Nothing in particular",
              "My good looks",
            ],
            correctAnswer: "Problem-solving with specific examples",
            explanation: "Self-awareness and concrete examples are valued.",
          },
          {
            question: "Why should we hire you?",
            options: [
              "Specific skills match, proven track record, and cultural fit",
              "I need the job",
              "No particular reason",
              "I'm just checking applications",
            ],
            correctAnswer:
              "Specific skills match, proven track record, and cultural fit",
            explanation:
              "This shows you've researched and understand value alignment.",
          },
        ],
      };

    default:
      return null;
  }
}
