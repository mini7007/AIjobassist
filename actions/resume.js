"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getEffectiveUserId } from "@/lib/auth-helper";
import OpenAI from "openai";
import { revalidatePath } from "next/cache";
import { retryWithBackoff, generateTemplateResponse } from "@/lib/ai-utils";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function saveResume(content) {
  const userId = await getEffectiveUserId();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const resume = await db.resume.upsert({
      where: {
        userId: user.id,
      },
      update: {
        content,
      },
      create: {
        userId: user.id,
        content,
      },
    });

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error saving resume:", error);
    // Provide a clearer error if DB is not configured / migrations missing
    if (error?.code === "P1001" || error?.code === "P2021") {
      throw new Error(
        "Database not configured or migrations not applied: " +
          (error.message || String(error)),
      );
    }
    throw new Error(
      "Failed to save resume: " + (error.message || String(error)),
    );
  }
}

export async function getResume() {
  const userId = await getEffectiveUserId();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.resume.findUnique({
    where: {
      userId: user.id,
    },
  });
}

export async function improveWithAI({ current, type }) {
  const userId = await getEffectiveUserId();
  if (!userId) throw new Error("Unauthorized");

  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "AI service not configured (OPENAI_API_KEY). Please check your environment variables. AI resume improvements not available.",
    );
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${user.industry} professional.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${current}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords
    
    Format the response as a single paragraph without any additional text or explanations.
  `;

  try {
    console.log("Starting AI resume improvement...");
    console.log("API Key present:", !!process.env.OPENAI_API_KEY);
    console.log("Type:", type);

    let improvedContent;

    try {
      // Try to call OpenAI with retry logic
      const response = await retryWithBackoff(
        () =>
          openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are an expert resume writer and career coach.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        3,
        1000,
      );
      console.log("AI Generation successful");
      improvedContent = response.choices[0].message.content.trim();
    } catch (apiError) {
      // If API fails, use template
      console.warn(
        "API call failed, using template response:",
        apiError?.message,
      );
      if (apiError?.status === 429 || apiError?.code === "insufficient_quota") {
        console.log("Quota exceeded, generating template response...");
        improvedContent = generateTemplateResponse("resumeImprovement", {
          skills: "",
          experience: "",
        });
      } else {
        throw apiError;
      }
    }

    return improvedContent;
  } catch (error) {
    console.error("Error improving content:", error);
    console.error("Error type:", error?.constructor?.name);
    console.error("Error code:", error?.code);
    console.error("Error status:", error?.status);
    if (error?.code === "P1001" || error?.code === "P2021") {
      throw new Error(
        "Database not available: " + (error.message || String(error)),
      );
    }
    if (error?.message && error.message.toLowerCase().includes("api key")) {
      throw new Error(
        "AI service not configured (OPENAI_API_KEY). Please check your environment variables. " +
          (error.message || String(error)),
      );
    }
    throw new Error(
      "Failed to improve content with AI. Make sure OPENAI_API_KEY is configured. " +
        (error.message || String(error)),
    );
  }
}
