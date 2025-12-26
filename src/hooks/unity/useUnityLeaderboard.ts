import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { UnityContextType } from "./useUnityEventSystem";
import { useAuthStore } from "../../stores/authStore";
import { leaderboardService } from "@/services/leaderboardService";

/**
 * Hook for handling Unity leaderboard updates
 * @param unityContext The Unity context with sendMessage method
 * @param options Additional options for the hook
 * @returns The leaderboard data and loading state
 */
export function useUnityLeaderboard(
  unityContext: UnityContextType,
  options?: {
    gameObjectName?: string;
    topUsersMethodName?: string;
    myInfoMethodName?: string;
  }
) {
  const { isAuthenticated } = useAuthStore();

  // Default values for Unity communication
  const gameObjectName = options?.gameObjectName || "GameManager";
  const topUsersMethodName = options?.topUsersMethodName || "UpdateTopUsers";
  const myInfoMethodName = options?.myInfoMethodName || "UpdateMyInfo";

  const {
    data: leaderboardData,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: leaderboardService.getLeaderboard,
    enabled: isAuthenticated && unityContext.isLoaded,
  });

  useEffect(() => {
    // Only send message if game is loaded, user is authenticated, and we have leaderboard data
    if (
      !unityContext.isLoaded ||
      !isAuthenticated ||
      !leaderboardData ||
      isLoading ||
      isError
    )
      return;

    // Send top users data to Unity
    unityContext.sendMessage(
      gameObjectName,
      topUsersMethodName,
      JSON.stringify(leaderboardData.top_users)
    );

    // Send my info data to Unity
    unityContext.sendMessage(
      gameObjectName,
      myInfoMethodName,
      JSON.stringify(leaderboardData.me)
    );
  }, [
    unityContext,
    unityContext.isLoaded,
    isAuthenticated,
    leaderboardData,
    isLoading,
    isError,
    gameObjectName,
    topUsersMethodName,
    myInfoMethodName,
    isFetching,
  ]);

  return {
    leaderboardData,
    isLoading,
    isError,
    refetch,
  };
}
