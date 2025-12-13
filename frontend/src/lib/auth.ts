/**
 * Authentication helpers
 * Handles token storage in localStorage
 */

const TOKEN_KEY = "token";
const USERNAME_KEY = "username";

// Save token after login
export function saveToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

// Get token
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

// Remove token (logout)
export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
  }
}

// Save username
export function saveUsername(username: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(USERNAME_KEY, username);
  }
}

// Get username
export function getUsername(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(USERNAME_KEY);
  }
  return null;
}

// Check if user is logged in
export function isLoggedIn(): boolean {
  return getToken() !== null;
}

// Decode JWT token to get payload (without verification)
export function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

