import { http, createConfig } from "wagmi";
import { monadTestnet } from "viem/chains";
import { farcasterFrame as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";

export const wagmiConfig = createConfig({
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http(),
  },
  connectors: [miniAppConnector()],
});
