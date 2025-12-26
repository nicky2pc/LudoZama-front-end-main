import { useAuthStore } from "../stores/authStore";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface RequestOptions extends Omit<RequestInit, "headers"> {
  authenticated?: boolean;
  headers?: Record<string, string>;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { authenticated = false, headers = {}, ...restOptions } = options;

  const requestHeaders: Record<string, string> = { ...headers };

  // Add Content-Type header if not provided and we have a body
  if (options.body && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json";
  }

  // Add authentication token if required
  if (authenticated) {
    const token = useAuthStore.getState().token;
    if (!token) {
      throw new Error("Authentication required but no token available");
    }
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...restOptions,
    headers: requestHeaders,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }

  // Check if the response is empty
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return {} as T;
}
