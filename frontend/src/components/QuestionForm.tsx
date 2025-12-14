"use client";

import { useState } from "react";
import { submitQuestion } from "@/lib/api";
import { FAQ_SUGGESTIONS, FAQItem } from "@/lib/constants/faqSuggestions";

export default function QuestionForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFAQSelect = (faq: FAQItem) => {
    // Fill the question text field with the selected FAQ question
    setMessage(faq.question);
    // Clear any previous errors
    setError(null);
  };

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
      
      // Don't trigger manual refresh - WebSocket will handle the update
      // This prevents the page blink/re-render issue
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
        {/* FAQ Suggestions Section */}
        <div className="mb-4">
          <p className="text-sm font-medium text-slate-600 mb-2">
            Quick Questions:
          </p>
          <div className="flex flex-wrap gap-2">
            {FAQ_SUGGESTIONS.map((faq, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleFAQSelect(faq)}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm border border-blue-200 transition-colors max-w-xs text-left"
              >
                {faq.question}
              </button>
            ))}
          </div>
        </div>

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

