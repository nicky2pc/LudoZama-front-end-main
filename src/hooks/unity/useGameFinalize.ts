import { useGameStore } from "@/stores/gameStore";
import { gameService } from "@/services/gameService";
import {
  usePrivy,
  type CrossAppAccountWithMetadata,
} from "@privy-io/react-auth";

export function useGameFinalize() {
  const gameId = useGameStore((state) => state.gameId);
  const clearGameData = useGameStore((state) => state.clearGameData);
  const setGameResult = useGameStore((state) => state.setGameResult);

  const { user: privyUser } = usePrivy();

  const handleGameFinalize = async (
    pnl: number,
    roi: number,
    mysteryBoxesCollected: number,
    hexData: string
  ) => {
    if (!gameId) {
      console.error("Cannot finalize game: No active game found");
      return;
    }
    const crossAppAccount = privyUser?.linkedAccounts.filter(
      (account) =>
        account.type === "cross_app" &&
        account.providerApp.id === "cmd8euall0037le0my79qpz42"
    )[0] as CrossAppAccountWithMetadata | undefined;

    const monadIdAddress = crossAppAccount?.embeddedWallets[0]?.address;

    try {
      // Call gameService to finalize the game
      const response = await gameService.finalizeGame({
        id: gameId.toString(),
        pnl,
        roi,
        mystery_boxes_collected: mysteryBoxesCollected,
        hex_data: hexData,
        monad_id_address: monadIdAddress || "",
      });

      // Store the game result
      setGameResult(response);

      // Clear game data after successful finalization
      clearGameData();

      return response;
    } catch (error) {
      console.error("Error finalizing game:", error);
      // Handle error (maybe send error message to Unity)
    }
  };

  return handleGameFinalize;
}
