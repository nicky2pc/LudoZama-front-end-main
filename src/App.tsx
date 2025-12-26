import { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { ProfileProvider } from "./ProfileProvider";

export function App() {
  const [isLoadingSdk, setIsLoadingSdk] = useState(true);
  useEffect(() => {
    const checkSdkReady = async () => {
      try {
        await sdk.actions.ready();
        // sdk.actions.addMiniApp();
        setIsLoadingSdk(false);
      } catch (error) {
        console.error("Farcaster SDK not ready:", error);
        setIsLoadingSdk(false);
      }
    };
    checkSdkReady();
  }, []);

  const [isMiniApp, setIsMiniApp] = useState(false);

  const checkMiniApp = async () => {
    try {
      const isMini = await sdk.isInMiniApp();
      setIsMiniApp(isMini);
    } catch (error) {
      console.error("Error checking if mini app:", error);
      setIsMiniApp(false);
    }
  };

  useEffect(() => {
    checkMiniApp();
  }, []);

  useEffect(() => {
    // Only set up the interval if we're not in a mini app
    if (!isMiniApp) {
      const intervalId = setInterval(async () => {
        checkMiniApp();
      }, 500); // Check every second

      // Clean up the interval when the component unmounts or isMiniApp becomes true
      return () => clearInterval(intervalId);
    }
  }, [isMiniApp]);

  if (isLoadingSdk) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
        <p>Loading Farcaster SDK...</p>
      </div>
    );
  }

  if (!isMiniApp) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white gap-4">
        <p className="text-white text-center">
          This app is designed to run inside Farcaster.
        </p>
        <a
          href="https://farcaster.xyz/miniapps/z35G4sXSDCzu/ludonad"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded"
        >
          Play on Farcaster
        </a>
      </div>
    );
  }

  return <ProfileProvider />;
}
