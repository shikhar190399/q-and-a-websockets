"use client";

import { useEffect, useState } from "react";
import { Question } from "@/lib/types";
import { getQuestions } from "@/lib/api";
import QuestionCard from "./QuestionCard";

interface QuestionListProps {
  refreshTrigger?: number;
}

export default function QuestionList({ refreshTrigger }: QuestionListProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [internalRefresh, setInternalRefresh] = useState(0);

  // Sort questions: Escalated first, then by timestamp (newest first)
  const sortQuestions = (qs: Question[]): Question[] => {
    return [...qs].sort((a, b) => {
      // Escalated always on top
      if (a.status === "Escalated" && b.status !== "Escalated") return -1;
      if (b.status === "Escalated" && a.status !== "Escalated") return 1;
      
      // Then sort by timestamp (newest first)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  };

  const fetchQuestions = async () => {
    try {
      const data = await getQuestions();
      setQuestions(sortQuestions(data));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh when answer is submitted
  const handleAnswered = () => {
    setInternalRefresh((prev) => prev + 1);
  };

  // Fetch on mount and when refreshTrigger or internalRefresh changes
  useEffect(() => {
    fetchQuestions();
  }, [refreshTrigger, internalRefresh]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-slate-500 text-center">Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-slate-500 text-center">
          No questions yet. Be the first to ask!
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-800 mb-4">
        Questions ({questions.length})
      </h2>
      
      {questions.map((question) => (
        <QuestionCard 
          key={question.question_id} 
          question={question} 
          onAnswered={handleAnswered}
        />
      ))}
    </div>
  );
}
