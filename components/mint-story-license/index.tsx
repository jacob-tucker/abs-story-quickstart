"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { parseEther } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { RoyaltyPaymentParams } from "@/lib/types";
import { executeRoyaltyPayment } from "@/lib/debridge";
import { MintStoryLicenseProps } from "./types";
import { useIPAssetMetadata, useEthCostEstimation } from "./hooks";
import { IPAssetDisplay } from "./ip-asset-display";
import { LicenseTermsDisplay } from "./license-terms-display";
import { RecipientAddressSection } from "./recipient-address-section";
import { PricingSection } from "./pricing-section";

export function MintStoryLicense({
  ipId,
  licenseTermsId,
  className,
}: MintStoryLicenseProps) {
  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [storyAddress, setStoryAddress] = useState<string>("");
  const [useManualAddress, setUseManualAddress] = useState<boolean>(false);

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { wallet: crossmintWallet } = useWallet();

  // Custom hooks for data fetching
  const {
    metadata: ipAssetMetadata,
    licenseTerms,
    isLoading: isLoadingMetadata,
    error: metadataError,
  } = useIPAssetMetadata(ipId, licenseTermsId);

  const { ethCost, isLoading: isLoadingCost } = useEthCostEstimation(
    ipId,
    licenseTermsId,
    licenseTerms,
    isLoadingMetadata
  );

  const handleMintLicense = async () => {
    if (!walletClient || !address) {
      throw new Error("Wallet client or address not found");
    }

    try {
      setIsMinting(true);
      setTxHash(null);

      // Calculate payment amount in WIP tokens
      const paymentAmountWei = parseEther(licenseTerms!.defaultMintingFee);

      // Determine receiver address - use Crossmint wallet if available, otherwise manual input
      const receiverAddress = useManualAddress
        ? storyAddress
        : crossmintWallet?.address;

      if (!receiverAddress) {
        throw new Error("No receiver address found");
      }

      // Prepare payment parameters for Story IP Asset
      const paymentParams: RoyaltyPaymentParams = {
        ipAssetId: ipId,
        paymentAmount: paymentAmountWei.toString(),
        senderAddress: address as `0x${string}`,
        licenseTermsId: licenseTermsId,
        receiverAddress: receiverAddress,
      };

      const { srcTxHash, dstTxHash } = await executeRoyaltyPayment(
        walletClient,
        paymentParams
      );

      console.log("srcTxHash", srcTxHash);
      console.log("dstTxHash", dstTxHash);

      // Set the transaction hash for display
      setTxHash(srcTxHash);
    } catch (error) {
      console.error("Error minting license:", error);
    } finally {
      setIsMinting(false);
    }
  };

  const isLoading = isLoadingMetadata;
  const hasError = !!metadataError;

  return (
    <Card
      className={cn("w-full max-w-sm overflow-hidden p-0 gap-0", className)}
    >
      {isLoading ? (
        <div className="p-4 space-y-3">
          <Skeleton className="h-32 w-full rounded" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ) : hasError ? (
        <div className="p-4 text-center">
          <div className="text-red-500 text-sm mb-3">{metadataError}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      ) : ipAssetMetadata && licenseTerms ? (
        <div className="flex flex-col h-full">
          <IPAssetDisplay metadata={ipAssetMetadata} />

          <div className="p-4 flex flex-col flex-1 justify-between">
            <LicenseTermsDisplay licenseTerms={licenseTerms} />

            <RecipientAddressSection
              useManualAddress={useManualAddress}
              setUseManualAddress={setUseManualAddress}
              storyAddress={storyAddress}
              setStoryAddress={setStoryAddress}
            />

            <PricingSection
              ethCost={ethCost}
              isLoadingCost={isLoadingCost}
              isMinting={isMinting}
              useManualAddress={useManualAddress}
              storyAddress={storyAddress}
              onMintLicense={handleMintLicense}
              txHash={txHash}
            />
          </div>
        </div>
      ) : null}
    </Card>
  );
}
