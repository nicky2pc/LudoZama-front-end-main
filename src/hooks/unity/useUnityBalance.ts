import { useEffect } from "react";
import { useBalance } from "wagmi";
import { formatEther } from "viem";
import type { UnityContextType } from "./useUnityEventSystem";

/**
 * Hook for handling Unity balance updates
 * @param unityContext The Unity context with sendMessage method
 * @param address The wallet address to fetch balance for
 * @param options Additional options for the hook
 * @returns The balance data and loading state
 */
export function useUnityBalance(
  unityContext: UnityContextType,
  address?: `0x${string}`,
  options?: {
    gameObjectName?: string;
    methodName?: string;
  }
) {
  const {
    data: balanceData,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useBalance({
    address,
  });

  // Default values for Unity communication
  const gameObjectName = options?.gameObjectName || "GameManager";
  const methodName = options?.methodName || "UpdateBalanceTextJS";

  useEffect(() => {
    // Only send message if game is loaded and we have balance data
    if (!unityContext.isLoaded || !balanceData || isLoading || isError) return;

    // Format balance as string
    const balanceStr = formatEther(balanceData.value);

    // Send message to Unity
    unityContext.sendMessage(gameObjectName, methodName, balanceStr);

    unityContext.sendMessage(
      "WalletService",
      "SetMonsBalance",
      Number(balanceStr)
    );
    // unityContext.sendMessage("WalletService", "SetLudoBalance", 228);
    unityContext.sendMessage(
      "WalletService",
      "SetWalletAddress",

      // truncate address to 10 characters with "..." at the middle
      address ? `${address.slice(0, 5)}...${address.slice(-5)}` : ""
    );
  }, [
    unityContext,
    unityContext.isLoaded,
    balanceData,
    isLoading,
    isError,
    isFetching,
    gameObjectName,
    methodName,
  ]);

  return {
    balance: balanceData?.value,
    formatted: balanceData ? formatEther(balanceData.value) : undefined,
    symbol: balanceData?.symbol,
    decimals: balanceData?.decimals,
    isLoading,
    isError,
    refetch,
  };
}
