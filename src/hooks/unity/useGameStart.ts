import { useSendTransaction } from "wagmi";
import { parseEther } from "viem/utils";
import { useAccount } from "wagmi";
import { gameService } from "@/services/gameService";
import { useGameStore } from "@/stores/gameStore";
import type { UnityContextType } from "./useUnityEventSystem";
import { Mutex } from "async-mutex"; // Import the Mutex
import posthog from "posthog-js";

// Create a singleton mutex that persists across renders
const transactionMutex = new Mutex();

export function useGameStart(unityContext: UnityContextType) {
  const { address } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const setGameData = useGameStore((state) => state.setGameData);

  const handleGameStart = async (
    positionSize: number,
    positionPercentageOfBalance: number,
    leverage: number,
    risk: string,
    tradeType: string
  ) => {
    posthog.capture("game start", {
      positionSize,
      positionPercentageOfBalance,
      leverage,
      risk,
      tradeType,
      address: address,
    });
    // Check if mutex is locked without waiting
    if (transactionMutex.isLocked()) {
      console.error(
        "Transaction already in progress. Please wait for it to complete."
      );
      return;
    }

    // Run the transaction code exclusively (mutex automatically acquired and released)
    return await transactionMutex.runExclusive(async () => {
      try {
        console.log("Starting game.");
        console.log("Position Size:", positionSize);

        // Send transaction
        const txHash = await sendTransactionAsync({
          to: import.meta.env.VITE_DEPOSIT_ADDRESS || "",
          value: parseEther(positionSize.toString()),
        });

        console.log("Transaction sent:", txHash);

        // Call gameService
        const payload = {
          trade: tradeType as "Long" | "Short",
          position_size_fix: positionSize,
          position_size_percent: positionPercentageOfBalance,
          leverage: leverage,
          risk: risk as "low" | "medium" | "high",
          client_address: address || "",
          client_tx_hash: txHash,
        };

        const response = await gameService.startGame(payload);

        // Store game data in the game store
        setGameData(response, {
          trade: tradeType,
          leverage: leverage,
          risk: risk,
          positionSizeFix: positionSize,
          positionSizePercent: positionPercentageOfBalance,
          clientAddress: address || "",
          clientTxHash: txHash,
        });

        // Send message to Unity
        unityContext.sendMessage(
          "GameManager",
          "GameStartCall",
          response.id.toString()
        );

        console.log("Game started successfully:", response.id.toString());

        return response;
      } catch (error) {
        console.error("Error starting game:", error);
        // Handle error (maybe send error message to Unity)
        unityContext.sendMessage(
          "GameManager",
          "OnGameStartError",
          "Failed to start game"
        );
        throw error; // Re-throw to propagate the error
      }
    });
  };

  return handleGameStart;
}
