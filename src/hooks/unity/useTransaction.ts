import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { UnityContextType } from "./useUnityEventSystem";
import { useAuthStore } from "../../stores/authStore";
import {
  transactionService,
  type HistoryTransaction,
} from "@/services/transactionService";

/**
 * Formats transaction data to ensure numeric values have at most 5 decimal places
 * and handles special cases like "0E-8" that might be returned from the backend
 * @param data The raw transaction data from the API
 * @returns The formatted transaction data
 */
const formatTransactionData = (
  data: HistoryTransaction[]
): HistoryTransaction[] => {
  if (!data || !data.length) return [];

  // Format the transaction data
  const formattedData = data.map((transaction) => {
    // Create a new object to avoid mutating the original
    const formattedTransaction = { ...transaction };

    // Format numeric fields to have max 5 decimal places
    const numericFields = [
      "leverage",
      "pnl",
      "position_size_fix",
      "position_size_percent",
      "roi",
    ];

    numericFields.forEach((field) => {
      if (field in formattedTransaction) {
        const value = formattedTransaction[field as keyof HistoryTransaction];

        // Skip if not a string or null
        if (typeof value !== "string") return;

        // Handle special case like "0E-8"
        if (value.includes("E-")) {
          formattedTransaction[field as keyof HistoryTransaction] =
            "0.00000" as string;
          return;
        }

        // Parse the string to a number and format to max 5 decimal places
        try {
          const num = parseFloat(value);
          if (!isNaN(num)) {
            // Format to max 5 decimal places
            formattedTransaction[field as keyof HistoryTransaction] =
              num.toFixed(
                Math.min(5, value.split(".")[1]?.length || 0)
              ) as string;
          }
        } catch (error) {
          console.error(`Error formatting field ${field}:`, error);
        }
      }
    });

    return formattedTransaction;
  });

  // Sort by final_time in descending order
  return formattedData.sort((a, b) => {
    // Convert string dates to Date objects for comparison
    const dateA = new Date(a.final_time);
    const dateB = new Date(b.final_time);

    // Sort in descending order (newest first)
    return dateB.getTime() - dateA.getTime();
  });
};

/**
 * Hook for handling Unity leaderboard updates
 * @param unityContext The Unity context with sendMessage method
 * @param options Additional options for the hook
 * @returns The leaderboard data and loading state
 */
export function useTransaction(
  unityContext: UnityContextType,
  options?: {
    gameObjectName?: string;
    transactionMethodName?: string;
  }
) {
  const { isAuthenticated } = useAuthStore();

  // Default values for Unity communication
  const gameObjectName = options?.gameObjectName || "GameManager";
  const transactionMethodName =
    options?.transactionMethodName || "UpdateTransactions";

  const {
    data: transactionData,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["transaction"],
    queryFn: transactionService.getTrans,
    enabled: isAuthenticated && unityContext.isLoaded,
  });

  useEffect(() => {
    // Only send message if game is loaded, user is authenticated, and we have leaderboard data
    if (
      !unityContext.isLoaded ||
      !isAuthenticated ||
      !transactionData ||
      isLoading ||
      isError
    )
      return;

    // Send top users data to Unity
    // Format transaction data before sending
    const formattedData = formatTransactionData(transactionData);
    unityContext.sendMessage(
      gameObjectName,
      transactionMethodName,
      JSON.stringify(formattedData)
    );
  }, [
    unityContext,
    unityContext.isLoaded,
    isAuthenticated,
    transactionData,
    isLoading,
    isError,
    isFetching,
    gameObjectName,
    transactionMethodName,
  ]);

  return {
    transactionData,
    isLoading,
    isError,
    refetch,
  };
}
