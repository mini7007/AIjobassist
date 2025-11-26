export const dynamic = "force-dynamic";

import { getIndustryInsights } from "@/actions/dashboard";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import DashboardView from "./_components/dashboard-view";

export default async function DashboardPage() {
  let isOnboarded = false;
  try {
    const res = await getUserOnboardingStatus();
    isOnboarded = res?.isOnboarded;
  } catch (error) {
    console.error("DashboardPage: failed to load onboarding status:", error);
  }

  // If not onboarded, redirect to onboarding page
  // Skip this check if already on the onboarding page
  if (!isOnboarded) {
    redirect("/onboarding");
  }

  let insights = null;
  try {
    insights = await getIndustryInsights();
  } catch (error) {
    console.error("DashboardPage: failed to load insights:", error);
  }

  if (!insights) {
    return (
      <div className="container mx-auto p-6">
        <div className="p-6 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
          <strong>Notice:</strong> Industry insights are not available because the
          backend or database is not configured. The dashboard UI will be
          available once a database and AI key are set up.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <DashboardView insights={insights} />
    </div>
  );
}