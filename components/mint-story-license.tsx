"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatEther, parseEther } from "viem";
import { type ClassValue } from "clsx";
import { useAccount, useWalletClient } from "wagmi";
import { useWallet, useAuth } from "@crossmint/client-sdk-react-ui";
import { RoyaltyPaymentParams } from "@/lib/types";
import {
  executeRoyaltyPayment,
  getDeBridgeTransactionData,
} from "@/lib/debridge";
import { convertGithubBlobToRaw, convertIpfsToHttps } from "@/lib/utils";
import { CrossmintWallet } from "./crossmint-wallet";

interface MintStoryLicenseProps {
  ipId: string;
  licenseTermsId: string;
  className?: ClassValue;
}

interface IPAssetMetadata {
  image: string;
  title: string;
  description: string;
}

interface LicenseTerms {
  commercialAttribution: boolean;
  commercialRevCeiling: number;
  commercialRevShare: number;
  commercialUse: boolean;
  commercializerChecker: string;
  commercializerCheckerData: string;
  currency: string;
  defaultMintingFee: string;
  derivativeRevCeiling: number;
  derivativesAllowed: boolean;
  derivativesApproval: boolean;
  derivativesAttribution: boolean;
  derivativesReciprocal: boolean;
  expiration: number;
  royaltyPolicy: string;
  transferable: boolean;
  uri: string;
  offChainTerms: {
    PILUri: string;
    additionalParameters: any;
    aiLearningModels: boolean;
    attribution: boolean;
    channelsOfDistribution: string[];
    contentStandards: string[];
    governingLaw: string;
    restrictionOnCrossPlatformUse: boolean;
    sublicensable: boolean;
    territory: string[];
  };
}

export function MintStoryLicense({
  ipId,
  licenseTermsId,
  className,
}: MintStoryLicenseProps) {
  const [ipAssetMetadata, setIpAssetMetadata] =
    useState<IPAssetMetadata | null>(null);
  const [licenseTerms, setLicenseTerms] = useState<LicenseTerms | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
  const [isLoadingTerms, setIsLoadingTerms] = useState(true);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [ethCost, setEthCost] = useState<string | null>(null);
  const [isLoadingCost, setIsLoadingCost] = useState(false);
  const [storyAddress, setStoryAddress] = useState<string>("");
  const [useManualAddress, setUseManualAddress] = useState<boolean>(false);
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { wallet: crossmintWallet } = useWallet();
  const { logout } = useAuth();

  const getEthCostEstimation = async () => {
    if (!address) return;

    try {
      setIsLoadingCost(true);
      const paymentAmountWei = parseEther(licenseTerms!.defaultMintingFee);

      const paymentParams: RoyaltyPaymentParams = {
        ipAssetId: ipId,
        paymentAmount: paymentAmountWei.toString(),
        senderAddress: address,
        licenseTermsId: licenseTermsId,
        receiverAddress: address, // just use `address` here for now because it won't change estimate. in reality this should be `storyAddress`
      };

      const deBridgeResponse = await getDeBridgeTransactionData(
        paymentParams,
        true
      );

      // Extract ETH cost from the transaction value
      const ethAmountWei = BigInt(deBridgeResponse.tx.value);
      const ethAmount = formatEther(ethAmountWei);
      setEthCost(parseFloat(ethAmount).toFixed(6));
    } catch (error) {
      console.error("Error getting cost estimation:", error);
      setEthCost("ERROR"); // Fallback estimate
    } finally {
      setIsLoadingCost(false);
    }
  };

  // Get cost estimation when license terms are loaded and address is available
  useEffect(() => {
    if (address && licenseTerms && !isLoadingTerms) {
      getEthCostEstimation();
    }
  }, [address, licenseTerms, isLoadingTerms]);

  // Fetch IP Asset Metadata
  useEffect(() => {
    const fetchIPAssetMetadata = async () => {
      try {
        setIsLoadingMetadata(true);
        setMetadataError(null);

        const url = `https://api.storyapis.com/api/v3/assets/${ipId}/metadata`;
        const options = {
          method: "GET",
          headers: {
            "X-Api-Key": process.env.NEXT_PUBLIC_STORY_API_KEY!,
            "X-Chain": "story",
          },
        };

        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch IP Asset metadata: ${response.statusText}`
          );
        }

        const data = await response.json();

        const ipMetadata = data.metadataUri;
        const ipMetadataJson = await fetch(ipMetadata);
        const ipMetadataJsonData = await ipMetadataJson.json();
        setIpAssetMetadata(ipMetadataJsonData);
      } catch (error) {
        console.error("Error fetching IP Asset metadata:", error);
        setMetadataError(
          error instanceof Error ? error.message : "Failed to fetch metadata"
        );
      } finally {
        setIsLoadingMetadata(false);
      }
    };

    if (ipId) {
      fetchIPAssetMetadata();
    }
  }, [ipId]);

  // Fetch License Terms
  useEffect(() => {
    const fetchLicenseTerms = async () => {
      try {
        setIsLoadingTerms(true);
        setTermsError(null);

        const url = `https://api.storyapis.com/api/v3/detailed-ip-license-terms`;
        const options = {
          method: "POST",
          headers: {
            "X-Api-Key": process.env.NEXT_PUBLIC_STORY_API_KEY!,
            "X-Chain": "story",
          },
          body: `{"options":{"where":{"ipIds":["${ipId}"]}}}`,
        };

        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch license terms: ${response.statusText}`
          );
        }

        const data = await response.json();
        const licenseTerms = data.data.find((x: any) => x.id == licenseTermsId);
        const terms = {
          ...licenseTerms.terms,
          defaultMintingFee: formatEther(licenseTerms.terms.defaultMintingFee),
        };

        const offChainTermsResponse = await fetch(
          convertGithubBlobToRaw(terms.uri)
        );
        const offChainTerms = await offChainTermsResponse.json();
        console.log({ ...terms, offChainTerms });
        setLicenseTerms({ ...terms, offChainTerms });
      } catch (error) {
        console.error("Error fetching license terms:", error);
        setTermsError(
          error instanceof Error
            ? error.message
            : "Failed to fetch license terms"
        );
      } finally {
        setIsLoadingTerms(false);
      }
    };

    if (licenseTermsId) {
      fetchLicenseTerms();
    }
  }, [licenseTermsId]);

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

  const isLoading = isLoadingMetadata || isLoadingTerms;
  const hasError = !!(metadataError || termsError);

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
          <div className="text-red-500 text-sm mb-3">
            {metadataError || termsError}
          </div>
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
          {/* Image */}
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={convertIpfsToHttps(ipAssetMetadata.image)}
              alt={ipAssetMetadata.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            />
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col flex-1 justify-between">
            <div className="space-y-3">
              {/* Title */}
              <h3 className="text-base font-semibold text-gray-900 leading-tight line-clamp-2">
                {ipAssetMetadata.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                {ipAssetMetadata.description}
              </p>
            </div>

            {/* License Terms */}
            <div className="py-3 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Commercial Use:</span>
                  <span
                    className={`font-medium ${
                      licenseTerms.commercialUse
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {licenseTerms.commercialUse ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Derivatives:</span>
                  <span
                    className={`font-medium ${
                      licenseTerms.derivativesAllowed
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {licenseTerms.derivativesAllowed ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Attribution:</span>
                  <span
                    className={`font-medium ${
                      licenseTerms.offChainTerms.attribution
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {licenseTerms.offChainTerms.attribution ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">AI Models:</span>
                  <span
                    className={`font-medium ${
                      licenseTerms.offChainTerms.aiLearningModels
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {licenseTerms.offChainTerms.aiLearningModels ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>

            {/* Recipient Address Section */}
            <div className="pt-3 border-t border-gray-100">
              <div className="mb-3">
                <h4 className="text-xs font-medium text-gray-700 mb-3">
                  License Recipient *
                </h4>

                {/* Toggle Buttons */}
                <div className="flex gap-1 mb-3 p-1 bg-gray-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setUseManualAddress(false)}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                      !useManualAddress
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Email Wallet
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseManualAddress(true)}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                      useManualAddress
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Manual Address
                  </button>
                </div>

                {/* Email Wallet Option */}
                {!useManualAddress && (
                  <div className="space-y-3">
                    {!crossmintWallet?.address ? (
                      <div>
                        <div className="text-xs text-gray-600 mb-2">
                          Create a wallet with just your email address:
                        </div>
                        <CrossmintWallet />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-green-600">
                            ✓ Email wallet connected
                          </div>
                          <button
                            type="button"
                            onClick={logout}
                            className="text-xs text-red-600 hover:text-red-800 underline"
                          >
                            Logout
                          </button>
                        </div>
                        <div className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded border truncate">
                          {crossmintWallet.address}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Manual Address Option */}
                {useManualAddress && (
                  <div className="space-y-2">
                    <label
                      htmlFor="story-address"
                      className="block text-xs font-medium text-gray-700"
                    >
                      Enter Story Wallet Address
                    </label>
                    <Input
                      id="story-address"
                      type="text"
                      placeholder="0x..."
                      value={storyAddress}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setStoryAddress(e.target.value)
                      }
                      className="text-xs"
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Price & Button Section */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    License Price
                  </div>
                  <div className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <img
                      src="/abstract-logo.jpg"
                      alt="Abstract"
                      className="w-5 h-5 rounded-sm"
                    />
                    {isLoadingCost ? (
                      <span className="text-gray-400">Loading...</span>
                    ) : (
                      `${ethCost} ETH`
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleMintLicense}
                  size="sm"
                  className="px-4 py-2 font-medium"
                  disabled={
                    isMinting ||
                    (useManualAddress
                      ? !storyAddress.trim()
                      : !crossmintWallet?.address)
                  }
                >
                  {isMinting ? "Minting..." : "Mint License"}
                </Button>
              </div>

              {/* Transaction Success */}
              {txHash && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm text-green-800 mb-2">
                    License minted successfully!
                  </div>
                  <a
                    href={`https://explorer.mainnet.abs.xyz/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 hover:text-green-800 underline"
                  >
                    View transaction on Abstract Explorer →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
