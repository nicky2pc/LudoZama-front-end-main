// Get the base URL from environment variable or fallback to development URL
const getBaseUrl = () => {
  if (process.env.VITE_PAGE_URL) {
    return `https://${process.env.VITE_PAGE_URL}`;
  }
  return "https://896484b61160.ngrok.app"; // Fallback for local development
};

export const embedConfig = {
  version: "next",
  imageUrl: `${getBaseUrl()}/coolguy.png`,
  button: {
    title: "Ludonad",
    action: {
      type: "launch_frame",
      name: "Play the gasame",
      url: `${getBaseUrl()}`,
    },
  },
} as const;
