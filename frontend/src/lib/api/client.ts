/**
 * XMLHttpRequest client
 * Core helper for making API requests
 */

import { getToken } from "../auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface RequestOptions {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  body?: Record<string, unknown>;
  requiresAuth?: boolean;
}

export function request<T>(endpoint: string, options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(options.method, `${API_URL}${endpoint}`);
    xhr.setRequestHeader("Content-Type", "application/json");

    // Add auth header if required
    if (options.requiresAuth) {
      const token = getToken();
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }
    }

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Handle 204 No Content (common for DELETE requests)
          if (xhr.status === 204 || xhr.responseText === "") {
            resolve(undefined as T);
            return;
          }
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            resolve(xhr.responseText as T);
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.detail || "Request failed"));
          } catch {
            reject(new Error("Request failed"));
          }
        }
      }
    };

    xhr.onerror = function () {
      reject(new Error("Network error"));
    };

    if (options.body) {
      xhr.send(JSON.stringify(options.body));
    } else {
      xhr.send();
    }
  });
}

