import { apiRequest } from "./apiClient";

export interface LeaderboardResponse {
  lang: string;
  me: {
    balance: number;
    id: string;
    rank: number;
  };
  top_users: Array<{
    balance: number;
    id: string;
    rank: number;
  }>;
}

export const leaderboardService = {
  async getLeaderboard(): Promise<LeaderboardResponse> {
    return apiRequest<LeaderboardResponse>("/api/v1/leaderboard/", {
      method: "GET",
      authenticated: true,
    });
  },
};
