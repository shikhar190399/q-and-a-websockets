/**
 * Auth API calls
 * Register and Login endpoints
 */

import { TokenResponse, User } from "../types";
import { request } from "./client";

export function register(
  username: string,
  email: string,
  password: string
): Promise<User> {
  // Validation
  if (!username.trim()) {
    return Promise.reject(new Error("Username cannot be blank"));
  }
  if (!email.trim()) {
    return Promise.reject(new Error("Email cannot be blank"));
  }
  if (!password.trim()) {
    return Promise.reject(new Error("Password cannot be blank"));
  }

  return request<User>("/auth/register", {
    method: "POST",
    body: { username, email, password },
  });
}

export function login(email: string, password: string): Promise<TokenResponse> {
  // Validation
  if (!email.trim()) {
    return Promise.reject(new Error("Email cannot be blank"));
  }
  if (!password.trim()) {
    return Promise.reject(new Error("Password cannot be blank"));
  }

  return request<TokenResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

