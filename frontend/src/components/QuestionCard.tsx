"use client";

import { useState } from "react";
import { Question } from "@/lib/types";
import { answerQuestion } from "@/lib/api";

interface QuestionCardProps {
  question: Question;
  onAnswered?: () => void;
}

export default function QuestionCard({ question, onAnswered }: QuestionCardProps) {
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format timestamp
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Status badge colors
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Escalated":
        return "bg-red-100 text-red-800 border-red-200";
      case "Answered":
        return "bg-green-100 text-green-800 border-green-200";
      default: // Pending
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  // Card border color based on status
  const getCardBorder = (status: string) => {
    switch (status) {
      case "Escalated":
        return "border-l-4 border-l-red-500";
      case "Answered":
        return "border-l-4 border-l-green-500";
      default:
        return "border-l-4 border-l-yellow-500";
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) {
      setError("Answer cannot be blank");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await answerQuestion(question.question_id, answerText);
      setAnswerText("");
      setShowAnswerForm(false);
      if (onAnswered) {
        onAnswered();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 mb-3 ${getCardBorder(question.status)}`}>
      {/* Header: Status + Timestamp */}
      <div className="flex justify-between items-center mb-3">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyles(question.status)}`}>
          {question.status}
        </span>
        <span className="text-sm text-slate-500">
          {formatDate(question.timestamp)}
        </span>
      </div>

      {/* Question message */}
      <p className="text-slate-800 mb-3">
        {question.message}
      </p>

      {/* Answer (if exists) */}
      {question.answer && (
        <div className="bg-slate-50 rounded p-3 mt-3">
          <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-700">Answer: </span>
            {question.answer}
          </p>
        </div>
      )}

      {/* Answer button (only show if no answer yet) */}
      {!question.answer && !showAnswerForm && (
        <button
          onClick={() => setShowAnswerForm(true)}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Reply to this question
        </button>
      )}

      {/* Answer form */}
      {showAnswerForm && (
        <div className="mt-4 border-t pt-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
              {error}
            </div>
          )}
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Type your answer..."
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm resize-none"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSubmitAnswer}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-4 rounded transition disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Answer"}
            </button>
            <button
              onClick={() => {
                setShowAnswerForm(false);
                setAnswerText("");
                setError(null);
              }}
              className="text-slate-600 hover:text-slate-800 text-sm font-medium py-1.5 px-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
