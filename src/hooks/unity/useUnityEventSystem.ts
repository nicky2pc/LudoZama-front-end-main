import { useAccount, useDisconnect } from "wagmi";
import { useUnityEvents } from "./useUnityEvents";
import type { UnityEventConfig, UnityEventHandler } from "./useUnityEvents";
import { useUnityBalance } from "./useUnityBalance";
import { useUnityLeaderboard } from "./useUnityLeaderboard";
import { useTransaction } from "./useTransaction";
import { useGameStart } from "./useGameStart";
import { useGameFinalize } from "./useGameFinalize";
import { shareReferralLink } from "@/lib/shareReferralLink";
import { useTutorial } from "../useTutorial";
import { useAuthStore } from "@/stores/authStore";
import { useGameStore } from "@/stores/gameStore";
import { sdk } from "@farcaster/miniapp-sdk";
import { useShareSocial } from "./useShareSocial";
import { useState } from "react";
import { useMint } from "./useMint";
import { useLudoBalance } from "./useLudoBalance";

/**
 * A hook that provides a unified interface for managing Unity event listeners
 * and integrations with external systems like wagmi.
 *
 * @param unityContext The Unity context with event methods
 * @param options Configuration options for the event system
 * @returns An object with methods for interacting with the event system
 */
// Define the UnityContext type to avoid repeating it
export type UnityContextType = {
  addEventListener: (eventName: string, callback: UnityEventHandler) => void;
  removeEventListener: (eventName: string, callback: UnityEventHandler) => void;
  sendMessage: (
    gameObjectName: string,
    methodName: string,
    parameter?: string | number | undefined | void
  ) => void;
  isLoaded: boolean;
};

export function useUnityEventSystem(
  unityContext: UnityContextType,
  options?: {
    enableBalanceUpdates?: boolean;
    balanceGameObject?: string;
    balanceMethod?: string;
    enableLeaderboardUpdates?: boolean;
    enableTransactionUpdates?: boolean;
    leaderboardGameObject?: string;
    leaderboardTopUsersMethod?: string;
    leaderboardMyInfoMethod?: string;
    transactionGameObject?: string;
    transactionMethod?: string;
    additionalEvents?: UnityEventConfig[];
  }
) {
  const { address } = useAccount();
  const { user, clearAuth } = useAuthStore();
  const { disconnect } = useDisconnect();
  const { shareFarcaster, shareTwitter } = useShareSocial();

  // Store the last transaction hash from MintRequest
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  // Track which game IDs have already been minted to prevent duplicate minting
  const [mintedGameIds, setMintedGameIds] = useState<Set<number>>(new Set());
  // Use the mint hook
  const { mintNft } = useMint();

  // Default options
  const {
    enableBalanceUpdates = true,
    balanceGameObject = "GameManager",
    balanceMethod = "UpdateBalanceTextJS",
    enableLeaderboardUpdates = true,
    enableTransactionUpdates = true,
    leaderboardGameObject = "GameManager",
    leaderboardTopUsersMethod = "UpdateTopUsers",
    leaderboardMyInfoMethod = "UpdateMyInfo",
    transactionGameObject = "GameManager",
    transactionMethod = "UpdateTransactions",
    additionalEvents = [],
  } = options || {};

  // Always call hooks unconditionally
  const balanceData = useUnityBalance(unityContext, address, {
    gameObjectName: balanceGameObject,
    methodName: balanceMethod,
  });

  const ludoBalanceData = useLudoBalance(unityContext);

  // Initialize leaderboard hook
  const leaderboardData = useUnityLeaderboard(unityContext, {
    gameObjectName: leaderboardGameObject,
    topUsersMethodName: leaderboardTopUsersMethod,
    myInfoMethodName: leaderboardMyInfoMethod,
  });

  const transactionData = useTransaction(unityContext, {
    gameObjectName: transactionGameObject,
    transactionMethodName: transactionMethod,
  });

  const { tutorialData, completeTutorial } = useTutorial();

  // Initialize game hooks
  const handleGameStart = useGameStart(unityContext);
  const handleGameFinalize = useGameFinalize();

  // We'll only use the data if the respective features are enabled
  const effectiveBalanceData = enableBalanceUpdates ? balanceData : null;
  const effectiveLeaderboardData = enableLeaderboardUpdates
    ? leaderboardData
    : null;
  const effectiveTransactionData = enableTransactionUpdates
    ? transactionData
    : null;

  // Combine default events with additional events
  const events: UnityEventConfig[] = [
    // Default event for UpdateBalance
    {
      eventName: "UpdateBalance",
      handler: () => {
        // The actual balance update is handled by useUnityBalance
        console.log("Balance updated");
        balanceData.refetch();
      },
    },
    // Default event for UpdateLeaderboard
    {
      eventName: "LeaderBoard",
      handler: () => {
        if (enableLeaderboardUpdates && leaderboardData) {
          leaderboardData.refetch();
        }
      },
    },
    {
      eventName: "ShareReferralLink",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      handler: (_referralLink: string) => {
        console.log("Referral Link:", _referralLink, user?.id);
        shareReferralLink(user!.id);
      },
    },
    {
      eventName: "RequestTutorCheck",
      handler: () => {
        const tutorialNeeded = (!tutorialData?.show_tutorial).toString();
        unityContext.sendMessage(
          "Trump",
          "CheckIfTutorialNeeded",
          tutorialNeeded
        );
      },
    },
    {
      eventName: "CloseTutor",
      handler: () => {
        completeTutorial();
      },
    },
    {
      eventName: "GameStart",
      handler: handleGameStart,
    },
    {
      eventName: "GameOver",
      handler: (
        _finalLeverage: number,
        pnl: number,
        _positionToken: number,
        _positionFix: number,
        _risk: string,
        roi: number,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _startLeverage: number,
        mysteryBoxesCollected: number,
        hexData: string
      ) => {
        handleGameFinalize(pnl, roi, mysteryBoxesCollected, hexData).then(
          () => {
            ludoBalanceData.refetch();
            balanceData.refetch();
          }
        );
      },
    },
    {
      eventName: "Transaction",
      handler: () => {
        if (enableTransactionUpdates && transactionData) {
          transactionData.refetch();
        }
      },
    },
    {
      eventName: "Logout",
      handler: () => {
        clearAuth();
        disconnect();
      },
    },
    {
      eventName: "ShowLeaderboardProfile",
      handler: (fid: string) => {
        sdk.actions.viewProfile({ fid: parseInt(fid) });
      },
    },
    {
      eventName: "ShareFarcaster",
      handler: () => {
        shareFarcaster(useGameStore.getState().lastGameRoi || 0);
      },
    },
    {
      eventName: "ShareTwitter",
      handler: async () => {
        await shareTwitter(useGameStore.getState().lastGameRoi || 0);
      },
    },
    {
      eventName: "MintRequest",
      handler: async () => {
        const lastGameId = useGameStore.getState().lastGameId;
        const lastGamePnl = useGameStore.getState().lastGamePnl;
        const lastGameRoi = useGameStore.getState().lastGameRoi;

        if (!lastGameId || lastGamePnl === null || lastGameRoi === null) {
          console.error("Cannot mint NFT: No last game ID or PNL found");
          return;
        }

        // Check if already minted
        if (mintedGameIds.has(lastGameId)) {
          console.log(`NFT already minted for game ID: ${lastGameId}`);
          const shortenedTxHash =
            " 0x" + lastTxHash!.slice(0, 4) + "... " + lastTxHash!.slice(-4);

          // Notify Unity about the successful minting
          unityContext.sendMessage(
            "PopUpMint",
            "ShowMintPopup",
            shortenedTxHash
          );
          return;
        }

        console.log(
          "Minting NFT for game ID:",
          lastGameId,
          "with PNL:",
          lastGamePnl
        );

        try {
          // Call mintNft with the PNL value
          const hash = await mintNft(
            lastGamePnl.toString(),
            lastGameRoi.toString()
          );
          console.log("Saved transaction hash:", hash);

          const shortenedTxHash =
            " 0x" + hash.slice(0, 4) + "... " + hash.slice(-4);

          // Notify Unity about the successful minting
          unityContext.sendMessage(
            "PopUpMint",
            "ShowMintPopup",
            shortenedTxHash
          );

          // Add to minted set to prevent duplicate minting
          setMintedGameIds((prev) => new Set([...prev, lastGameId]));

          setLastTxHash(hash);
        } catch (error) {
          console.error("Error minting NFT:", error);
          // Notify Unity about the error
          unityContext.sendMessage(
            "GameManager",
            "OnNFTMintError",
            "Failed to mint NFT"
          );
        }
      },
    },
    {
      eventName: "OpenTxUrl",
      handler: () => {
        // Use the saved transaction hash from MintRequest
        if (lastTxHash) {
          console.log("OpenTxUrl event using transaction hash:", lastTxHash);
          sdk.actions.openUrl(
            `https://testnet.monadexplorer.com/tx/${lastTxHash}`
          );
          // Currently do nothing with the tx_hash as per requirements
          // This can be expanded later to open a transaction explorer URL or other functionality
        } else {
          console.log(
            "OpenTxUrl event called but no transaction hash is available"
          );
        }
      },
    },
    {
      eventName: "CopyReferralLinkToClipboard",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      handler: async (_referralLink: string) => {
        try {
          // Get the base URL from environment variable or fallback to development URL
          const getBaseUrl = () => {
            if (process.env.VITE_PAGE_URL) {
              return `https://${process.env.VITE_PAGE_URL}`;
            }
            return "https://896484b61160.ngrok.app"; // Fallback for local development
          };

          const fullReferralLink = `${getBaseUrl()}/api/ref/${user?.id}`;
          console.log("Copying referral link to clipboard:", fullReferralLink);

          await navigator.clipboard.writeText(fullReferralLink);
          console.log("Referral link copied to clipboard successfully");
        } catch (error) {
          console.error("Failed to copy referral link to clipboard:", error);
        }
      },
    },
    {
      eventName: "RequestReferralLink",
      handler: () => {
        // Get the base URL from environment variable or fallback to development URL
        const getBaseUrl = () => {
          if (process.env.VITE_PAGE_URL) {
            return `https://${process.env.VITE_PAGE_URL}`;
          }
          return "https://896484b61160.ngrok.app"; // Fallback for local development
        };

        console.log(
          "RequestReferralLink event received, sending referral link:",
          user?.id
        );
        if (user?.id) {
          const referralLink = `${getBaseUrl()}/api/ref/${user.id}`;
          console.log("Formed referral link:", referralLink);
          unityContext.sendMessage(
            "GameManager",
            "SetReferralLink",
            referralLink
          );
        }
      },
    },

    // Add any additional events
    ...additionalEvents,
  ];

  // Set up event listeners
  useUnityEvents(unityContext, events);

  // Return useful data and methods
  return {
    balanceData: effectiveBalanceData,
    leaderboardData: effectiveLeaderboardData,
    transactionData: effectiveTransactionData,
    // Helper method to send a message to Unity
    sendToUnity: (
      gameObject: string,
      method: string,
      parameter?: string | number
    ) => {
      if (unityContext.isLoaded) {
        unityContext.sendMessage(gameObject, method, parameter);
      }
    },
    // Add more helper methods as needed
  };
}
