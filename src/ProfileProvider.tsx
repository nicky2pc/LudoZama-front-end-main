import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { useAuth } from "./hooks/useAuth";
import { useAuthStore } from "./stores/authStore";
import { UnityContainer } from "./UnityContainer";
import { getReferralCode } from "./lib/getReferralCode";
import { useTutorial } from "./hooks/useTutorial";
import { useTokenValidation } from "./hooks/useTokenValidation";
import { usePrivy } from "@privy-io/react-auth";

export function ProfileProvider() {
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { signInWithFarcaster, isLoading } = useAuth();
  const { isAuthenticated } = useAuthStore();
  const { isTokenValid, isChecking } = useTokenValidation();
  const { isLoading: isTutorialLoading, refetch: fetchTutorialStatus } =
    useTutorial();

  const { authenticated: privyAuthenticated, login: privyLogin } = usePrivy();
  const [hasFetchedTutorial, setHasFetchedTutorial] = useState(false);
  const [isPrivyLoginAttempted, setIsPrivyLoginAttempted] = useState(false);

  // Handle referral code if present
  useEffect(() => {
    const { hasReferral, referralCode } = getReferralCode();
    if (hasReferral) {
      console.log("Page opened with referral code:", referralCode);
    }
  }, []);

  // Connect wallet if not connected
  useEffect(() => {
    if (isConnected) {
      return;
    }
    connect({
      connector: connectors[0],
    });
  }, [isConnected, connectors]);

  // Authenticate with Farcaster after wallet connection
  // or when token is invalid
  useEffect(() => {
    // Need to re-authenticate if:
    // 1. Connected but not authenticated, or
    // 2. Connected and token was checked and found to be invalid
    const needsAuthentication =
      isConnected &&
      (!isAuthenticated || (isAuthenticated && isTokenValid === false));

    if (needsAuthentication && !isLoading && !isChecking) {
      console.log("Authentication needed, signing in with Farcaster");
      signInWithFarcaster();
    }
  }, [isConnected, isAuthenticated, isLoading, isTokenValid, isChecking]);

  // Authenticate with Privy after Farcaster authentication is complete
  useEffect(() => {
    if (
      isAuthenticated &&
      isTokenValid &&
      !privyAuthenticated &&
      !isPrivyLoginAttempted &&
      !isLoading &&
      !isChecking
    ) {
      console.log("Farcaster authenticated, now authenticating with Privy");
      setIsPrivyLoginAttempted(true);
      privyLogin();
    }
  }, [
    isAuthenticated,
    isTokenValid,
    privyAuthenticated,
    isPrivyLoginAttempted,
    isLoading,
    isChecking,
  ]);

  // Reset Privy login attempt flag when Privy authentication succeeds
  useEffect(() => {
    if (privyAuthenticated && isPrivyLoginAttempted) {
      setIsPrivyLoginAttempted(false);
    }
  }, [privyAuthenticated, isPrivyLoginAttempted]);

  // Fetch tutorial status when both authentications are completed (only once)
  useEffect(() => {
    if (
      isAuthenticated &&
      isTokenValid !== false &&
      privyAuthenticated &&
      !hasFetchedTutorial
    ) {
      fetchTutorialStatus();
      setHasFetchedTutorial(true);
    }
  }, [
    isAuthenticated,
    isTokenValid,
    privyAuthenticated,
    hasFetchedTutorial,
    fetchTutorialStatus,
  ]);

  if (!isConnected) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black text-white p-4">
        <p className="text-white text-center mx-auto">
          Connecting your wallet... If it's taking long - re-launch your
          farcaster app and try again
        </p>
      </div>
    );
  }

  if (isLoading || isChecking) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
        <p className="text-white text-center mx-auto">
          Authenticating with Farcaster...
        </p>
      </div>
    );
  }

  if (isAuthenticated && isTokenValid && !privyAuthenticated) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
        <p className="text-white text-center mx-auto">
          Authenticating with Privy...
        </p>
      </div>
    );
  }

  if (isAuthenticated && privyAuthenticated && isTutorialLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
        <p className="text-white text-center mx-auto">
          Loading tutorial status...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-black text-white">
      {/* Only render UnityContainer after both authentications are complete and tutorial check is fetched */}
      {hasFetchedTutorial && privyAuthenticated && <UnityContainer />}
    </div>
  );
}
