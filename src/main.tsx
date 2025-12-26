import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App.tsx";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "./wagmiConfig.ts";
import { PrivyProvider } from "@privy-io/react-auth";

import { PostHogProvider } from "posthog-js/react";
import type { PostHogConfig } from "posthog-js";

const posthogOptions: Partial<PostHogConfig> = {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
  capture_pageview: "history_change",
};

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_POSTHOG_KEY}
      options={posthogOptions}
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <PrivyProvider
            appId="cmaowcf2z00eajs0nsn8m9pn9"
            config={{
              loginMethodsAndOrder: {
                // Don't forget to enable Monad Games ID support in:
                // Global Wallet > Integrations > Monad Games ID (click on the slide to enable)
                primary: ["privy:cmd8euall0037le0my79qpz42"], // This is the Cross App ID, DO NOT CHANGE THIS
              },
            }}
          >
            <App />
          </PrivyProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </PostHogProvider>
  </StrictMode>
);
