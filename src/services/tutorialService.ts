import { apiRequest } from "./apiClient";

export interface TutorialCompletionCheckResponse {
  lang: string;
  show_tutorial: boolean;
}

export interface TutorialCompletedResponse {
  lang: string;
  message: string;
}

export const tutorialService = {
  async getCompletionCheck(): Promise<TutorialCompletionCheckResponse> {
    return apiRequest<TutorialCompletionCheckResponse>(
      "/api/v1/tutorial/completion_check",
      {
        method: "GET",
        authenticated: true,
      }
    );
  },

  async markTutorialCompleted(): Promise<TutorialCompletedResponse> {
    return apiRequest<TutorialCompletedResponse>("/api/v1/tutorial/completed", {
      method: "POST",
      authenticated: true,
      body: JSON.stringify({
        lang: "en",
      }),
    });
  },
};
