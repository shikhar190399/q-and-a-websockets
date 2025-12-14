/**
 * TypeScript interfaces for the Q&A Dashboard
 */

// User types
export interface User {
  user_id: number;
  username: string;
  email: string;
  created_at: string;
}

// Question types
export interface Question {
  question_id: number;
  message: string;
  status: "Pending" | "Escalated" | "Answered";
  timestamp: string;
  answer: string | null;
  answered_by: number | null;
  answered_at: string | null;
}

// API Response types
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ErrorResponse {
  detail: string;
}

export interface QuestionPaginatedResponse {
  questions: Question[];
  next_cursor: number | null;
  has_more: boolean;
}

// WebSocket message types
export interface WebSocketMessage {
  type: "NEW_QUESTION" | "QUESTION_ANSWERED" | "QUESTION_UPDATED" | "QUESTION_DELETED";
  data: Record<string, unknown>;
}

