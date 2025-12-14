"use client";

import QuestionForm from "@/components/QuestionForm";
import QuestionList from "@/components/QuestionList";

export default function Dashboard() {
  // Removed refreshTrigger - WebSocket handles all updates to prevent page blink

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">
        Dashboard
      </h1>

      {/* Question Form */}
      <QuestionForm />

      {/* Question List */}
      <QuestionList />
    </div>
  );
}
