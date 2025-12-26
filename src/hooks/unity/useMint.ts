import { NFT_ADDRESS } from "@/constants";
import { nftAbi } from "@/nftAbi";
import posthog from "posthog-js";
import { useAccount, useWriteContract } from "wagmi";

export const useMint = () => {
  const { writeContractAsync } = useWriteContract();
  const { address } = useAccount();

  const mintNft = async (pnl: string, roi: string) => {
    posthog.capture("nft mint", { property: "pnl", address: address });

    const str = `${
      roi.startsWith("+") || roi.startsWith("-") ? roi : "+" + roi
    }%/${pnl.startsWith("+") || pnl.startsWith("-") ? pnl : "+" + pnl} MON`;

    return await writeContractAsync({
      address: NFT_ADDRESS,
      abi: nftAbi,
      functionName: "mint",
      args: [str],
    });
  };

  return {
    mintNft,
  };
};
