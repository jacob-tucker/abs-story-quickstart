"use client";

import { AbstractPlayerCard } from "@/components/abstract-player-card";
import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  COMMERCIAL_LICENSE_PRICE_WIP,
  IP_ASSET_LICENSE_TERMS_ID,
  STORY_IP_ASSET_ID,
} from "@/lib/constants";
import { executeRoyaltyPayment } from "@/lib/debridge";
import { RoyaltyPaymentParams } from "@/lib/types";
import { parseEther } from "viem";
import { useAccount, useWalletClient } from "wagmi";

// 0xfb48c4c85e201f30ba5a94f2fe4469fcff648a2aca5ea8458ffd21be9262a51d

export default function Home() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  async function run() {
    if (!walletClient || !address) {
      throw new Error("Wallet client or address not found");
    }

    // Calculate payment amount in WIP tokens
    const paymentAmountWei = parseEther(COMMERCIAL_LICENSE_PRICE_WIP);

    // Prepare payment parameters for Story IP Asset
    const paymentParams: RoyaltyPaymentParams = {
      ipAssetId: STORY_IP_ASSET_ID,
      paymentAmount: paymentAmountWei.toString(),
      senderAddress: address as `0x${string}`,
      licenseTermsId: IP_ASSET_LICENSE_TERMS_ID,
      receiverAddress: "0x089d75C9b7E441dA3115AF93FF9A855BDdbfe384",
    };

    const { srcTxHash, dstTxHash } = await executeRoyaltyPayment(
      walletClient,
      paymentParams
    );

    console.log("srcTxHash", srcTxHash);
    console.log("dstTxHash", dstTxHash);
  }
  return (
    <div className="flex flex-col gap-4 justify-center items-center h-screen w-screen p-4">
      <AbstractPlayerCard />
      <ConnectWalletButton />
      <Button onClick={run}>Run</Button>
    </div>
  );
}
