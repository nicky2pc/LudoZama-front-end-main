import { sdk } from "@farcaster/miniapp-sdk";

// Get the base URL from environment variable or fallback to development URL
const getBaseUrl = () => {
  if (process.env.VITE_PAGE_URL) {
    return `https://${process.env.VITE_PAGE_URL}`;
  }
  return "https://896484b61160.ngrok.app"; // Fallback for local development
};

export function shareReferralLink(referralLink: string) {
  console.log("Sharing referral link:", referralLink);
  const link = `${getBaseUrl()}/api/ref/${referralLink}`;
  sdk.actions.composeCast({
    text: `We keep earning MONs on LUDONAD game mf\n\nLink for the gamble thing - ${link}\n\Farcaster channel - https://farcaster.com/~/channel/ludonad/join?inviteCode=yFcutg_y30BwD_nG4zXQBA`,
    embeds: [link],
  });
}
