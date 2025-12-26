export function getReferralCode(): {
  referralCode: string | undefined;
  hasReferral: boolean;
} {
  // Get the current URL's search params
  const searchParams = new URLSearchParams(window.location.search);

  // Extract the ref parameter
  const referralCode = searchParams.get("ref") || undefined;

  return {
    referralCode,
    hasReferral: !!referralCode,
  };
}
