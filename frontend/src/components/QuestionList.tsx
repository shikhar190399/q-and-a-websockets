"use client";

import { useEffect, useState, useCallback } from "react";
import { Question } from "@/lib/types";
import { getQuestions } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { useWebSocket } from "@/hooks/useWebSocket";
import QuestionCard from "./QuestionCard";

interface QuestionListProps {
  refreshTrigger?: number;
}

export default function QuestionList({ refreshTrigger }: QuestionListProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [internalRefresh, setInternalRefresh] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is logged in (admin) - re-check periodically
  useEffect(() => {
    const checkAdmin = () => {
      setIsAdmin(isLoggedIn());
    };
    
    // Check on mount
    checkAdmin();
    
    // Re-check every 2 seconds (in case user logs in/out in another tab)
    const interval = setInterval(checkAdmin, 2000);
    
    return () => clearInterval(interval);
  }, []);

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

  const fetchQuestions = useCallback(async () => {
    try {
      const data = await getQuestions();
      setQuestions(sortQuestions(data));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle WebSocket messages for real-time updates
  const handleWebSocketMessage = useCallback((message: { type: string; data: unknown }) => {
    const questionData = message.data as Partial<Question> & { question_id: number };
    
    // Validate question data has at least question_id
    if (!questionData || !questionData.question_id) {
      console.warn("Invalid question data received from WebSocket:", questionData);
      fetchQuestions();
      return;
    }
    
    switch (message.type) {
      case "NEW_QUESTION":
        // New questions should have all fields
        if (!questionData.timestamp || typeof questionData.timestamp !== "string") {
          console.warn("New question missing timestamp, refreshing from API");
          fetchQuestions();
          return;
        }
        setQuestions((prev) => sortQuestions([questionData as Question, ...prev]));
        break;
        
      case "QUESTION_ANSWERED":
      case "QUESTION_UPDATED":
        // Partial updates - merge with existing question data
        setQuestions((prev) => {
          const existingQuestion = prev.find((q) => q.question_id === questionData.question_id);
          
          if (!existingQuestion) {
            // Question not in list yet, refresh from API
            fetchQuestions();
            return prev;
          }
          
          // Merge partial update with existing question
          const updatedQuestion: Question = {
            ...existingQuestion,
            ...questionData,
            // Ensure timestamp is preserved from existing question if not in update
            timestamp: questionData.timestamp || existingQuestion.timestamp,
          };
          
          const updated = prev.map((q) =>
            q.question_id === questionData.question_id ? updatedQuestion : q
          );
          return sortQuestions(updated);
        });
        break;
    }
  }, [fetchQuestions]);

  // Subscribe to WebSocket
  useWebSocket(handleWebSocketMessage);

  // Refresh when something is updated locally
  const handleUpdated = () => {
    setInternalRefresh((prev) => prev + 1);
  };

  // Fetch on mount and when refreshTrigger or internalRefresh changes
  useEffect(() => {
    fetchQuestions();
  }, [refreshTrigger, internalRefresh, fetchQuestions]);

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-800">
          Questions ({questions.length})
        </h2>
        <span className="text-xs text-green-600 flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Live
        </span>
      </div>
      
      {questions.map((question) => (
        <QuestionCard 
          key={question.question_id} 
          question={question} 
          isAdmin={isAdmin}
          onUpdated={handleUpdated}
        />
      ))}
    </div>
  );
}
