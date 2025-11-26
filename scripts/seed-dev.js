#!/usr/bin/env node
import { db } from "../lib/prisma.js";

async function main() {
  const devId = process.env.DEV_USER_ID || "dev_user_1";

  console.log("Seeding dev data for user:", devId);

  // Create or update user
  const user = await db.user.upsert({
    where: { clerkUserId: devId },
    update: {},
    create: {
      clerkUserId: devId,
      email: "dev@example.com",
      name: "Dev Local",
      imageUrl: null,
      industry: "software-development",
      bio: "Experienced full-stack developer",
      experience: 5,
      skills: JSON.stringify(["JavaScript", "React", "Node.js"]),
    },
  });

  console.log("User upserted:", user.id);

  // Create resume
  await db.resume.upsert({
    where: { userId: user.id },
    update: { content: "## Professional Summary\n\nExperienced developer..." },
    create: {
      userId: user.id,
      content: "## Professional Summary\n\nExperienced developer...",
    },
  });

  // Create one cover letter
  await db.coverLetter.create({
    data: {
      userId: user.id,
      content: "Dear hiring manager, I am excited about...",
      jobDescription: "Build awesome web apps",
      companyName: "ACME Corp",
      jobTitle: "Frontend Engineer",
      status: "completed",
    },
  });

  // Create one assessment
  await db.assessment.create({
    data: {
      userId: user.id,
      quizScore: 80,
      questions: JSON.stringify([
        {
          question: "Q1",
          answer: "A",
          userAnswer: "A",
          isCorrect: true,
          explanation: "OK",
        },
      ]),
      category: "Technical",
    },
  });

  // Create industry insight if not exists
  const insight = await db.industryInsight.upsert({
    where: { industry: "software-development" },
    update: {},
    create: {
      industry: "software-development",
      salaryRanges: JSON.stringify([
        {
          role: "Frontend Engineer",
          min: 60000,
          max: 120000,
          median: 85000,
          location: "US",
        },
      ]),
      growthRate: 5.5,
      demandLevel: "HIGH",
      topSkills: JSON.stringify(["React", "TypeScript", "CSS"]),
      marketOutlook: "POSITIVE",
      keyTrends: JSON.stringify(["Remote work", "AI integration"]),
      recommendedSkills: JSON.stringify(["TypeScript", "Testing"]),
      nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
