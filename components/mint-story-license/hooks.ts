"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { formatEther, parseEther } from "viem";
import { convertGithubBlobToRaw } from "@/lib/utils";
import { getDeBridgeTransactionData } from "@/lib/debridge";
import { RoyaltyPaymentParams } from "@/lib/types";
import { IPAssetMetadata, LicenseTerms } from "./types";

export function useIPAssetMetadata(ipId: string, licenseTermsId: string) {
  const [metadata, setMetadata] = useState<IPAssetMetadata | null>(null);
  const [licenseTerms, setLicenseTerms] = useState<LicenseTerms | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const url = `https://api.storyapis.com/api/v4/assets`;
        const options = {
          method: "POST",
          headers: {
            "X-Api-Key": process.env.NEXT_PUBLIC_STORY_API_KEY!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // orderBy: "blockNumber",
            // orderDirection: "desc",
            // pagination: { offset: 0 },
            includeLicenses: true,
            moderated: false,
            where: { ipIds: [ipId] },
          }),
        };

        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch IP Asset metadata: ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log(data.data[0]);
        const ipaMetadataUri = data.data[0].ipaMetadataUri;
        const ipMetadataResponse = await fetch(ipaMetadataUri);
        const ipMetadataJson = await ipMetadataResponse.json();
        setMetadata(ipMetadataJson);

        const licenseTerms = data.data[0].licenses.find(
          (x: any) => x.licenseTermsId == licenseTermsId
        );
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
        console.error("Error fetching IP Asset metadata:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch metadata or license terms"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (ipId) {
      fetchMetadata();
    }
  }, [ipId]);

  return { metadata, licenseTerms, isLoading, error };
}

export function useEthCostEstimation(
  ipId: string,
  licenseTermsId: string,
  licenseTerms: LicenseTerms | null,
  isLoadingTerms: boolean
) {
  const [ethCost, setEthCost] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();

  useEffect(() => {
    const getEstimation = async () => {
      if (!address || !licenseTerms) return;

      try {
        setIsLoading(true);
        const paymentAmountWei = parseEther(licenseTerms.defaultMintingFee);

        const paymentParams: RoyaltyPaymentParams = {
          ipAssetId: ipId,
          paymentAmount: paymentAmountWei.toString(),
          senderAddress: address,
          licenseTermsId: licenseTermsId,
          receiverAddress: address, // just use `address` here for estimation
        };

        const deBridgeResponse = await getDeBridgeTransactionData(
          paymentParams,
          true
        );

        const ethAmountWei = BigInt(deBridgeResponse.tx.value);
        const ethAmount = formatEther(ethAmountWei);
        setEthCost(parseFloat(ethAmount).toFixed(6));
      } catch (error) {
        console.error("Error getting cost estimation:", error);
        setEthCost("ERROR");
      } finally {
        setIsLoading(false);
      }
    };

    if (address && licenseTerms && !isLoadingTerms) {
      getEstimation();
    }
  }, [address, licenseTerms, isLoadingTerms, ipId, licenseTermsId]);

  return { ethCost, isLoading };
}
