/**
 * API exports
 * Re-exports all API functions for easy importing
 */

// Auth API
export { register, login } from "./auth";

// Questions API
export {
  getQuestions,
  submitQuestion,
  answerQuestion,
  updateQuestionStatus,
  deleteQuestion,
} from "./questions";

