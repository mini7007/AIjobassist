"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getEffectiveUserId } from "@/lib/auth-helper";
import OpenAI from "openai";
import { retryWithBackoff, generateTemplateResponse } from "@/lib/ai-utils";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateCoverLetter(data) {
  const userId = await getEffectiveUserId();
  if (!userId) throw new Error("Unauthorized");

  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY not configured. Set OPENAI_API_KEY in your environment to enable AI cover letter generation.",
    );
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    Write a professional cover letter for a ${data.jobTitle} position at ${
      data.companyName
    }.
    
    About the candidate:
    - Industry: ${user.industry}
    - Years of Experience: ${user.experience}
    - Skills: ${user.skills?.join(", ")}
    - Professional Background: ${user.bio}
    
    Job Description:
    ${data.jobDescription}
    
    Requirements:
    1. Use a professional, enthusiastic tone
    2. Highlight relevant skills and experience
    3. Show understanding of the company's needs
    4. Keep it concise (max 400 words)
    5. Use proper business letter formatting in markdown
    6. Include specific examples of achievements
    7. Relate candidate's background to job requirements
    
    Format the letter in markdown.
  `;

  try {
    console.log("Starting cover letter generation...");
    console.log("API Key present:", !!process.env.OPENAI_API_KEY);

    let content;

    try {
      // Try to call OpenAI with retry logic
      const response = await retryWithBackoff(
        () =>
          openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are an expert professional cover letter writer.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        3, // max retries
        1000, // initial delay
      );
      console.log("AI Generation successful");
      content = response.choices[0].message.content.trim();
    } catch (apiError) {
      // If API fails (quota, rate limit, etc.), use template
      console.warn(
        "API call failed, using template response:",
        apiError?.message,
      );
      if (apiError?.status === 429 || apiError?.code === "insufficient_quota") {
        console.log("Quota exceeded, generating template response...");
        content = generateTemplateResponse("coverLetter", {
          jobTitle: data.jobTitle,
          companyName: data.companyName,
          industry: user.industry,
          experience: user.experience,
          skills: user.skills,
          candidateName: user.name,
        });
      } else {
        throw apiError;
      }
    }

    const coverLetter = await db.coverLetter.create({
      data: {
        content,
        jobDescription: data.jobDescription,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        status: "completed",
        userId: user.id,
      },
    });

    return coverLetter;
  } catch (error) {
    console.error("Error generating cover letter:", error);
    console.error("Error type:", error?.constructor?.name);
    console.error("Error code:", error?.code);
    console.error("Error status:", error?.status);
    if (error?.code === "P1001" || error?.code === "P2021") {
      throw new Error(
        "Database not configured or unreachable: " +
          (error.message || String(error)),
      );
    }
    throw new Error(
      "Failed to generate cover letter: " + (error.message || String(error)),
    );
  }
}

export async function getCoverLetters() {
  const userId = await getEffectiveUserId();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    return await db.coverLetter.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching cover letters:", error);
    if (error?.code === "P1001" || error?.code === "P2021") {
      throw new Error(
        "Database not configured or unreachable. Make sure migrations are applied.",
      );
    }
    throw error;
  }
}

export async function getCoverLetter(id) {
  const userId = await getEffectiveUserId();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    return await db.coverLetter.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });
  } catch (error) {
    console.error("Error fetching cover letter:", error);
    if (error?.code === "P1001" || error?.code === "P2021") {
      throw new Error(
        "Database not configured or unreachable. Make sure migrations are applied.",
      );
    }
    throw error;
  }
}

export async function deleteCoverLetter(id) {
  const userId = await getEffectiveUserId();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    return await db.coverLetter.delete({
      where: {
        id,
        userId: user.id,
      },
    });
  } catch (error) {
    console.error("Error deleting cover letter:", error);
    if (error?.code === "P1001" || error?.code === "P2021") {
      throw new Error(
        "Database not configured or unreachable. Make sure migrations are applied.",
      );
    }
    throw error;
  }
}
