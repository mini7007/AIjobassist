export const dynamic = "force-dynamic";

import { getResume } from "@/actions/resume";
import ResumeBuilder from "./_components/resume-builder";

export default async function ResumePage() {
  let resume = null;
  try {
    resume = await getResume();
  } catch (error) {
    console.error("ResumePage: failed to load resume:", error);
  }

  return (
    <div className="container mx-auto py-6">
      {resume === null && (
        <div className="p-6 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 mb-6">
          <strong>Warning:</strong> Resume backend not available or database is not
          configured. The builder will still work but saving will fail until a
          working database and Clerk authentication are configured.
        </div>
      )}

      <ResumeBuilder initialContent={resume?.content} />
    </div>
  );
}