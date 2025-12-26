import { sdk } from "@farcaster/miniapp-sdk";
import { useAuthStore } from "@/stores/authStore";

// Get the base URL from environment variable or fallback to development URL
const getBaseUrl = () => {
  if (process.env.VITE_PAGE_URL) {
    return `https://${process.env.VITE_PAGE_URL}`;
  }
  return "https://896484b61160.ngrok.app"; // Fallback for local development
};

const getReferralLink = (referralLink?: string) => {
  if (!referralLink) {
    return getBaseUrl();
  }
  const link = `${getBaseUrl()}/api/ref/${referralLink}`;
  return link;
};

export function useShareSocial() {
  // Get user from auth store
  const { user } = useAuthStore();

  // Determine the share text based on ROI
  const getShareText = (roi: number, type?: "twitter") => {
    // If ROI is null or undefined, default to "earning"
    const name = type === "twitter" ? "@Ludonad_game" : "LUDONAD";
    if (roi === null || roi === undefined) {
      return `We keep earning MONs on ${name} game mf`;
    }

    let prefix = "We keep earning MONs on";
    if (roi < 0) {
      prefix = "We keep losing MONs on";
    }

    // Format ROI as a percentage with + or - sign
    const roiFormatted = `${roi >= 0 ? "+" : ""}${roi.toFixed(3)}%`;

    // Return the share text with the ROI value
    return `${prefix} ${name} game mf, my ROI is ${roiFormatted}`;
  };

  const shareFarcaster = (roi: number) => {
    const link = getReferralLink(user?.id);
    const text =
      getShareText(parseFloat(roi.toString())) +
      `\n\nLink for the gamble thing - ${link}\n\Farcaster channel - https://farcaster.com/~/channel/ludonad/join?inviteCode=yFcutg_y30BwD_nG4zXQBA`;

    sdk.actions.composeCast({
      text: text,
      embeds: [link],
    });
  };

  const shareTwitter = async (roi: number) => {
    const link = getReferralLink(user?.id);
    const text =
      getShareText(parseFloat(roi.toString()), "twitter") +
      `\n\nLink for the gamble thing - ${link}`;

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}`;
    await sdk.actions.openUrl(twitterUrl);
  };

  return {
    shareFarcaster,
    shareTwitter,
  };
}
