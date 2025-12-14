"use client";

import { useState } from "react";
import { Question } from "@/lib/types";
import { answerQuestion, updateQuestionStatus, deleteQuestion } from "@/lib/api";

interface QuestionCardProps {
  question: Question;
  isAdmin: boolean;
  onUpdated?: () => void;
}

export default function QuestionCard({ question, isAdmin, onUpdated }: QuestionCardProps) {
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Format timestamp
  const formatDate = (timestamp: string | null | undefined) => {
    if (!timestamp) return "Unknown";
    
    try {
      const date = new Date(timestamp);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      return "Invalid Date";
    }
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
      if (onUpdated) {
        onUpdated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: "Pending" | "Escalated" | "Answered") => {
    setIsSubmitting(true);
    setError(null);

    try {
      await updateQuestionStatus(question.question_id, newStatus);
      if (onUpdated) {
        onUpdated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setIsSubmitting(true);
    setError(null);
    setShowDeleteConfirm(false);

    try {
      await deleteQuestion(question.question_id);
      // On success, the question will be removed via WebSocket
      // Component will unmount, so we don't need to reset isSubmitting
      if (onUpdated) {
        onUpdated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete question");
      setIsSubmitting(false);
      // Re-open dialog on error so user can see the error message
      setShowDeleteConfirm(true);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setError(null);
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

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mt-3 text-sm">
          {error}
        </div>
      )}

      {/* Actions row */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-slate-100">
        {/* Answer button (only show if no answer yet) */}
        {!question.answer && !showAnswerForm && (
          <button
            onClick={() => setShowAnswerForm(true)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Reply
          </button>
        )}

        {/* Admin controls - only visible when logged in */}
        {isAdmin && question.status !== "Answered" && (
          <>
            <button
              onClick={() => handleStatusChange("Answered")}
              disabled={isSubmitting}
              className="text-sm text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
            >
              ✓ Mark Answered
            </button>
            {question.status !== "Escalated" && (
              <button
                onClick={() => handleStatusChange("Escalated")}
                disabled={isSubmitting}
                className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
              >
                ⚠ Escalate
              </button>
            )}
          </>
        )}

        {/* De-escalate button for admins */}
        {isAdmin && question.status === "Escalated" && (
          <button
            onClick={() => handleStatusChange("Pending")}
            disabled={isSubmitting}
            className="text-sm text-yellow-600 hover:text-yellow-800 font-medium disabled:opacity-50"
          >
            ↓ De-escalate
          </button>
        )}

        {/* Delete button for admins */}
        {isAdmin && (
          <button
            onClick={handleDeleteClick}
            disabled={isSubmitting}
            className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
          >
            🗑️ Delete
          </button>
        )}
      </div>

      {/* Answer form */}
      {showAnswerForm && (
        <div className="mt-4 pt-4 border-t">
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

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-opacity-90 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Delete Question?
            </h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this question? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                disabled={isSubmitting}
                className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-medium transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded font-medium transition disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
