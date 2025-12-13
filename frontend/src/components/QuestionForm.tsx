"use client";

import { useState } from "react";
import { submitQuestion } from "@/lib/api";

interface QuestionFormProps {
  onQuestionSubmitted?: () => void;
}

export default function QuestionForm({ onQuestionSubmitted }: QuestionFormProps) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation: Check if message is blank
    if (!message.trim()) {
      setError("Question cannot be blank");
      return;
    }

    setIsLoading(true);

    try {
      await submitQuestion(message);
      
      // Clear form on success
      setMessage("");
      
      // Notify parent component
      if (onQuestionSubmitted) {
        onQuestionSubmitted();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit question");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">
        Ask a Question
      </h2>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Question input */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your question here..."
          rows={3}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 resize-none"
        />

        {/* Submit button */}
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Submitting..." : "Submit Question"}
          </button>
        </div>
      </form>
    </div>
  );
}

