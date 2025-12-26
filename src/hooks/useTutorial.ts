import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tutorialService } from "../services/tutorialService";

export function useTutorial() {
  const queryClient = useQueryClient();

  const tutorialQuery = useQuery({
    queryKey: ["tutorial", "completion"],
    queryFn: tutorialService.getCompletionCheck,
    // Only fetch once when the component mounts
    staleTime: Infinity,
    enabled: false, // We'll manually trigger this when auth is completed
  });

  const completeTutorialMutation = useMutation({
    mutationFn: tutorialService.markTutorialCompleted,
    onSuccess: () => {
      // Invalidate the tutorial completion check query to refetch
      queryClient.invalidateQueries({ queryKey: ["tutorial", "completion"] });
    },
  });

  return {
    tutorialData: tutorialQuery.data,
    isLoading: tutorialQuery.isLoading,
    error: tutorialQuery.error,
    refetch: tutorialQuery.refetch,
    completeTutorial: completeTutorialMutation.mutate,
    isCompleting: completeTutorialMutation.isPending,
  };
}
