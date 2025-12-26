import { apiRequest } from "./apiClient";

export interface NonceResponse {
  nonce: string;
}

export interface FarcasterLoginRequest {
  message: string;
  signature: string;
  referral_code?: string;
}

export interface User {
  id: string;
  // Add other user properties as needed
}

export interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  async verifyToken(): Promise<boolean> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await apiRequest<any>("/api/v1/auth/verify", {
        method: "GET",
        authenticated: true,
      });
      return true;
    } catch (error) {
      // If the request fails, the token is invalid or expired
      console.error("Token verification failed:", error);
      return false;
    }
  },
  async getNonce(): Promise<NonceResponse> {
    return apiRequest<NonceResponse>("/api/v1/auth/nonce", {
      method: "POST",
    });
  },

  async loginWithFarcaster(
    payload: FarcasterLoginRequest
  ): Promise<LoginResponse> {
    // We need to handle this differently because we need to access the headers
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL || "http://localhost:8000"
      }/api/v1/auth/farcaster`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }

    const user = await response.json();
    const token = response.headers.get("New-Access-Token");

    if (!token) {
      throw new Error("No token received from server");
    }

    return { user, token };
  },
};
