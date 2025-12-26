import { apiRequest } from "./apiClient";

export interface UserResponse {
  id: string;
  ludo_balance: number;
  total_mystery_boxes: number;
  // Other user properties would go here
  lang: string;
}

export const userService = {
  async getUserData(): Promise<UserResponse> {
    return apiRequest<UserResponse>("/api/v1/user/me", {
      method: "GET",
      authenticated: true,
    });
  },
};
