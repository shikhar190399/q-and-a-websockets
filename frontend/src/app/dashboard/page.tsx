"use client";

import { useState } from "react";
import QuestionForm from "@/components/QuestionForm";
import QuestionList from "@/components/QuestionList";

export default function Dashboard() {
  // Used to trigger refresh of question list after submitting
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleQuestionSubmitted = () => {
    // Increment to trigger a refresh of the question list
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">
        Dashboard
      </h1>

      {/* Question Form */}
      <QuestionForm onQuestionSubmitted={handleQuestionSubmitted} />

      {/* Question List */}
      <QuestionList refreshTrigger={refreshTrigger} />
    </div>
  );
}
