import React from 'react';
import { getAssessments } from "@/actions/interview";
import StatsCards from './_components/stats-cards';
import PerformanceChart from './_components/performance-chart';
import QuizList from './_components/quiz-list';


const InterviewPage = async() => {

  let assessments = [];
  try {
    assessments = await getAssessments();
  } catch (error) {
    console.error("InterviewPage: failed to load assessments:", error);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title">
          Interview Preparation
        </h1>
      </div>
      <div className="space-y-6">
        {assessments.length === 0 ? (
          <div className="p-6 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
            <strong>Notice:</strong> Interview assessments are not available — the
            backend is not configured. You can still take quizzes, but saved
            results will not persist until the database is configured.
          </div>
        ) : (
          <>
            <StatsCards assessments={assessments} />
            <PerformanceChart assessments={assessments} />
            <QuizList assessments={assessments} />
          </>
        )}
      </div>
    </div>
  )
}

export default InterviewPage