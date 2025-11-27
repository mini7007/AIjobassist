

<h1 align="center">💼 JobGeniusAI – AI Career Coach 🤖</h1>

![Demo App](https://github.com/DevGoyalG/JobGeniusAI/blob/main/JobGeniusAI.png)

## 🌟 Highlights:

- 🚀 Tech stack: Next.js, Vite, Tailwind CSS & Shadcn UI
- 🧠 LLM Integration (Gemini AI) for smart recommendations
- 📄 AI Resume & Cover Letter Builder
- 🎯 Personalized Interview Preparation
- 📊 Industry Insights Module
- 🔒 Authentication & Authorization (Clerk)
- 💾 Database Management (Neon PostgreSQL)
- 💻 Modern, Responsive UI Design
- 🎭 Client & Server Components with seamless integration
- 🌐 Deployed for high performance on Vercel

## ✨ Features

- **AI-Powered Resume Builder**: Generate tailored resumes based on your skills and experience.
- **Cover Letter Generator**: Create personalized cover letters for job applications.
- **Interview Preparation**: Access common interview questions and tips.
- **Industry Insights**: Stay updated with the latest trends in your desired field.
- **User Authentication**: Secure sign-in/sign-up using Clerk.
- **Responsive Design**: Seamless experience across devices.

## Setup .env file

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Clerk Redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Database
DATABASE_URL=

# Gemini API
GEMINI_API_KEY=
```

## 🧩 Getting Started

1. Clone the repository

```shell
git clone
cd
```

2. Install dependencies:

```shell
npm install
```

3. Set up your environment variables as shown above
4. Run the development server:

```shell
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This application can be easily deployed to Vercel:

```shell
npm run build
npm run start
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Local database & migrations (recommended to enable full functionality)

If you want the resume / cover letter / interview flows to work locally you must configure a working database and run Prisma migrations. The easiest way is to run a local Postgres using Docker and then apply migrations:

1. Start a local Postgres (Docker):

```cmd
docker run --name jobgenius-postgres -e POSTGRES_USER=jobgenius -e POSTGRES_PASSWORD=pass -e POSTGRES_DB=jobgenius_local -p 5432:5432 -d postgres:15
```

2. Create a `.env` file (use `.env.example` as a starting point) and update DATABASE_URL:

```
DATABASE_URL=postgresql://jobgenius:pass@localhost:5432/jobgenius_local
```

3. Run prisma generate and apply migrations:

```cmd
npx prisma generate
npx prisma migrate dev --name init
```

4. Start the dev server and sign in using Clerk (configure Clerk with your local origin and redirect URLs). When the database is ready and Clerk is configured, all features (resume, cover letters, interview quizzes, dashboard insights) will work locally.

If you prefer not to configure a DB or AI key, the app will still render pages but features that require the database or Gemini will show a helpful notice.

## 🚀 Technologies Used

- **Next.js & Vite**: Fast, modern frameworks for frontend and full-stack development
- **Tailwind CSS & Shadcn UI**: Utility-first styling and pre-built UI components
- **Clerk**: Secure authentication and user management system
- **Neon**: Scalable PostgreSQL database solution with serverless support
- **Gemini AI**: Google’s LLM for generating smart, context-aware career guidance
- **Vercel**: Deployment platform ensuring high performance and global scalability

## 📚 Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com/docs)
- [Gemini API Documentation](https://ai.google.dev/gemini-api)
- [Neon Documentation](https://neon.tech/docs)

## 🤝 Connect with Me

<a href="https://github.com/mini7007" target="_blank">
  <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
</a>
&nbsp;
<a href="https://www.linkedin.com/in/mohan-sharma-aa76a0200/" target="_blank">
  <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/>
</a>
&nbsp;
<a href="#" target="_blank">
  <img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram"/>
</a>
&nbsp;
<a href="#" target="_blank">
  <img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" alt="Twitter"/>
</a>

---

<p align="center">
  <b>Thank you for visiting! Happy Learning 🚀</b>
</p>
