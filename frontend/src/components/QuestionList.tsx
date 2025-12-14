"use client";

import { useEffect, useState, useCallback } from "react";
import { Question } from "@/lib/types";
import { getQuestions } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import QuestionCard from "./QuestionCard";

interface QuestionListProps {
  refreshTrigger?: number;
}

export default function QuestionList({ refreshTrigger }: QuestionListProps) {
  // Question data state
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Pagination state
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Internal state
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

  // Sort questions: Escalated > Pending > Answered, then by timestamp (newest first)
  // Matches backend sorting logic exactly
  // Used only for WebSocket updates (backend handles sorting for paginated requests)
  const sortQuestions = (qs: Question[]): Question[] => {
    // Status priority: Escalated (1) > Pending (2) > Answered (3)
    const getStatusPriority = (status: string): number => {
      switch (status) {
        case "Escalated":
          return 1;
        case "Pending":
          return 2;
        case "Answered":
          return 3;
        default:
          return 4;
      }
    };

    return [...qs].sort((a, b) => {
      // First, sort by status priority
      const statusDiff = getStatusPriority(a.status) - getStatusPriority(b.status);
      if (statusDiff !== 0) {
        return statusDiff;
      }
      
      // If same status, sort by timestamp (newest first)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  };

  // Fetch initial page of questions
  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getQuestions(20); // Default limit: 20
      
      // Backend already sorts questions, so use them directly
      setQuestions(response.questions);
      
      // Set pagination state
      setNextCursor(response.next_cursor);
      setHasMore(response.has_more);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load more questions using cursor pagination
  const loadMore = useCallback(async () => {
    // Guard: Don't load if no more items, already loading, or no cursor
    if (!hasMore || isLoadingMore || !nextCursor) {
      return;
    }

    setIsLoadingMore(true);
    setError(null);

    try {
      const response = await getQuestions(20, nextCursor);
      
      // Append new questions to existing list
      setQuestions((prev) => [...prev, ...response.questions]);
      
      // Update pagination state
      setNextCursor(response.next_cursor);
      setHasMore(response.has_more);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more questions");
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, nextCursor]);

  // Handle WebSocket messages for real-time updates (with pagination support)
  const handleWebSocketMessage = useCallback((message: { type: string; data: unknown }) => {
    const questionData = message.data as Partial<Question> & { question_id: number };
    
    // Validate question data has at least question_id
    if (!questionData || !questionData.question_id) {
      console.warn("Invalid question data received from WebSocket:", questionData);
      return;
    }
    
    switch (message.type) {
      case "NEW_QUESTION":
        // Validate new question has all required fields
        const timestamp = questionData.timestamp;
        if (!timestamp || typeof timestamp !== "string") {
          console.warn("New question missing timestamp");
          return;
        }
        
        // Check if question is newer than the first question in current view
        setQuestions((prev) => {
          if (prev.length === 0) {
            // Empty list, just add it
            return [questionData as Question];
          }
          
          const firstQuestion = prev[0];
          const newQuestionTime = new Date(timestamp).getTime();
          const firstQuestionTime = new Date(firstQuestion.timestamp).getTime();
          
          // If new question is newer, prepend it (it belongs at the top)
          if (newQuestionTime > firstQuestionTime) {
            return [questionData as Question, ...prev];
          }
          
          // Otherwise, it's older and not in current view (user hasn't loaded it yet)
          // Don't add it to the list - it will appear when they load more
          return prev;
        });
        break;
        
      case "QUESTION_ANSWERED":
      case "QUESTION_UPDATED":
        // Update existing question if it's in the current loaded list
        setQuestions((prev) => {
          const existingIndex = prev.findIndex((q) => q.question_id === questionData.question_id);
          
          if (existingIndex === -1) {
            // Question not in current view - don't update
            // It will be updated when user loads that page
            return prev;
          }
          
          // Question is in current view - update in-place
          const existingQuestion = prev[existingIndex];
          const updatedQuestion: Question = {
            ...existingQuestion,
            ...questionData,
            // Preserve timestamp if not in update
            timestamp: questionData.timestamp || existingQuestion.timestamp,
          };
          
          // Update question in the list
          const updated = [...prev];
          updated[existingIndex] = updatedQuestion;
          
          // Re-sort if status changed (to maintain Escalated > Pending > Answered order)
          if (questionData.status && questionData.status !== existingQuestion.status) {
            return sortQuestions(updated);
          }
          
          return updated;
        });
        break;
    }
  }, []);

  // Subscribe to WebSocket
  useWebSocket(handleWebSocketMessage);

  // Infinite scroll: detect when user scrolls to bottom
  const sentinelRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: hasMore,
    isLoading: isLoadingMore,
  });

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

      {/* Infinite scroll sentinel and loading states */}
      <div ref={sentinelRef} className="h-10">
        {isLoadingMore && (
          <div className="text-center py-6">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-slate-500 mt-2 text-sm">Loading more questions...</p>
          </div>
        )}
        {!hasMore && questions.length > 0 && (
          <div className="text-center py-6">
            <p className="text-slate-500 text-sm">No more questions to load</p>
          </div>
        )}
      </div>
    </div>
  );
}
