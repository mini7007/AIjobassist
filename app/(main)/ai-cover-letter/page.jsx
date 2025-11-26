export const dynamic = "force-dynamic";
import { getCoverLetters } from "@/actions/cover-letter";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterList from "./_components/cover-letter-list";

export default async function CoverLetterPage() {
  let coverLetters = [];
  try {
    coverLetters = await getCoverLetters();
  } catch (error) {
    console.error("CoverLetterPage: failed to load cover letters:", error);
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title">My Cover Letters</h1>
        <Link href="/ai-cover-letter/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </Link>
      </div>

      {coverLetters.length === 0 ? (
        <div className="p-6 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
          <strong>Notice:</strong> Cover letter storage is not available.
          You can still create a new cover letter, but generating or saving
          will fail until the database and authentication are configured.
        </div>
      ) : (
        <CoverLetterList coverLetters={coverLetters} />
      )}
    </div>
  );
}