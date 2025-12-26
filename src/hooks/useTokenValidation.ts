import { useEffect, useState } from "react";
import { authService } from "../services/authService";
import { useAuthStore } from "../stores/authStore";

export function useTokenValidation() {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { isAuthenticated, clearAuth } = useAuthStore();

  const checkToken = async () => {
    if (!isAuthenticated) {
      setIsValid(false);
      return false;
    }

    setIsChecking(true);
    try {
      const valid = await authService.verifyToken();
      setIsValid(valid);

      // If token is invalid, clear auth state
      if (!valid) {
        clearAuth();
      }

      return valid;
    } catch {
      setIsValid(false);
      clearAuth();
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  // Check token on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      checkToken();
    }
  }, [isAuthenticated]);

  return {
    isTokenValid: isValid,
    isChecking,
    checkToken,
  };
}
