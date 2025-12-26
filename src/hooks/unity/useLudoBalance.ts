import { useEffect, useState } from "react";
import type { UnityContextType } from "./useUnityEventSystem";
import { userService } from "../../services/userService";

/**
 * Hook for handling Ludo balance updates
 * @param unityContext The Unity context with sendMessage method
 * @param options Additional options for the hook
 * @returns The balance data and loading state
 */
export function useLudoBalance(unityContext: UnityContextType) {
  const [balance, setBalance] = useState<number | undefined>(undefined);
  const [mysteryBoxesCollected, setMysteryBoxesCollected] = useState<
    number | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const fetchBalance = async () => {
    setIsFetching(true);
    try {
      const userData = await userService.getUserData();
      setBalance(userData.ludo_balance);
      setMysteryBoxesCollected(userData.total_mystery_boxes);
      setIsError(false);
    } catch (error) {
      console.error("Error fetching Ludo balance:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  const refetch = fetchBalance;

  useEffect(() => {
    fetchBalance();
  }, []);

  useEffect(() => {
    // Only send message if game is loaded and we have balance data
    if (
      !unityContext.isLoaded ||
      balance === undefined ||
      mysteryBoxesCollected === undefined ||
      isLoading ||
      isError
    )
      return;

    // Set Ludo balance in WalletService
    unityContext.sendMessage(
      "WalletService",
      "SetLudoBalance",
      parseFloat(balance.toString())
    );

    unityContext.sendMessage(
      "WalletService",
      "SetMysteryBoxesCollected",
      parseInt(mysteryBoxesCollected.toString())
    );
  }, [
    unityContext,
    unityContext.isLoaded,
    balance,
    mysteryBoxesCollected,
    isLoading,
    isError,
    isFetching,
  ]);

  return {
    balance,
    formatted: balance?.toString(),
    isLoading,
    isError,
    isFetching,
    refetch,
  };
}
