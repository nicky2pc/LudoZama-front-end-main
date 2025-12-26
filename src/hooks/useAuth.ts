import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sdk } from "@farcaster/miniapp-sdk";
import { authService } from "../services/authService";
import { useAuthStore } from "../stores/authStore";
import { useState } from "react";
import { getReferralCode } from "@/lib/getReferralCode";

export function useAuth() {
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();
  const [isSigning, setIsSigning] = useState(false);

  const nonceQuery = useMutation({
    mutationFn: authService.getNonce,
  });

  const loginMutation = useMutation({
    mutationFn: authService.loginWithFarcaster,
    onSuccess: ({ user, token }) => {
      setAuth(token, user);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const signInWithFarcaster = async () => {
    try {
      setIsSigning(true);

      const { hasReferral, referralCode } = getReferralCode();

      // 1. Get nonce from backend
      const { nonce } = await nonceQuery.mutateAsync();

      // 2. Sign in with Farcaster
      const signInResult = await sdk.actions.signIn({
        nonce,
        acceptAuthAddress: true,
      });

      // 3. Send signature to backend
      await loginMutation.mutateAsync({
        message: signInResult.message,
        signature: signInResult.signature,
        referral_code: hasReferral ? referralCode : undefined,
      });

      setIsSigning(false);
      return true;
    } catch (error) {
      console.error("Authentication failed:", error);
      setIsSigning(false);
      return false;
    }
  };

  return {
    signInWithFarcaster,
    isLoading: nonceQuery.isPending || loginMutation.isPending || isSigning,
    error: nonceQuery.error || loginMutation.error,
  };
}
