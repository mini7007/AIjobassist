import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCoverLetter } from "@/actions/cover-letter";
import CoverLetterPreview from "../_components/cover-letter-preview";

export default async function EditCoverLetterPage({ params }) {
  const { id } = await params;
  let coverLetter = null;
  try {
    coverLetter = await getCoverLetter(id);
  } catch (error) {
    console.error("CoverLetter detail load failed:", error);
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-2">
        <Link href="/ai-cover-letter">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Cover Letters
          </Button>
        </Link>

        <h1 className="text-6xl font-bold gradient-title mb-6">
          {coverLetter?.jobTitle} at {coverLetter?.companyName}
        </h1>
      </div>

      {!coverLetter ? (
        <div className="p-6 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
          <strong>Notice:</strong> Could not load the requested cover letter. The
          backend may be unavailable or the item does not exist.
        </div>
      ) : (
        <CoverLetterPreview content={coverLetter?.content} />
      )}
    </div>
  );
}