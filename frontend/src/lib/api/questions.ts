/**
 * Questions API calls
 * All question-related endpoints
 */

import { Question } from "../types";
import { request } from "./client";

export function getQuestions(): Promise<Question[]> {
  return request<Question[]>("/questions/", {
    method: "GET",
  });
}

export function submitQuestion(message: string): Promise<Question> {
  // Validation
  if (!message.trim()) {
    return Promise.reject(new Error("Question cannot be blank"));
  }

  return request<Question>("/questions/", {
    method: "POST",
    body: { message },
  });
}

export function answerQuestion(
  questionId: number,
  answer: string
): Promise<Question> {
  // Validation
  if (!answer.trim()) {
    return Promise.reject(new Error("Answer cannot be blank"));
  }

  return request<Question>(`/questions/${questionId}/answer`, {
    method: "POST",
    body: { answer },
  });
}

export function updateQuestionStatus(
  questionId: number,
  status: "Pending" | "Escalated" | "Answered"
): Promise<Question> {
  return request<Question>(`/questions/${questionId}/status`, {
    method: "PATCH",
    body: { status },
    requiresAuth: true,
  });
}

