import { useQueryParams } from "./useQueryParams";

/**
 * A hook that extracts and processes referral parameters from the URL.
 * @returns An object containing the referral code and a flag indicating whether a referral code is present.
 */
export function useReferral() {
  const queryParams = useQueryParams();
  const referralCode = queryParams.ref;

  
  return {
    referralCode,
    hasReferral: !!referralCode,
  };
}
