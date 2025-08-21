"use client";

import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { MintStoryLicense } from "@/components/mint-story-license";
import { IP_ASSET_LICENSE_TERMS_ID, STORY_IP_ASSET_ID } from "@/lib/constants";
import { useAccount } from "wagmi";
import { AbstractPlayerCard } from "@/components/abstract-player-card";
import { SuccessfulExampleCard } from "@/components/successful-example-card";
import Link from "next/link";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Mainnet Warning */}
        <div className="mb-6 flex justify-center">
          <div className="px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm font-medium text-orange-800">
            Warning: This demo is on Abstract mainnet. Real funds will be used.
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Abstract Licensing Demo
          </h1>
          <p className="text-gray-600 text-sm">
            Connect your wallet and mint a license on{" "}
            <Link
              href="https://docs.story.foundation"
              className="text-blue-600 font-bold underline decoration-2 decoration-blue-400 underline-offset-4 hover:decoration-blue-600 transition-colors"
              target="_blank"
            >
              Story
            </Link>{" "}
            using{" "}
            <Link
              href="https://docs.abs.xyz"
              className="text-[#18ff80] font-bold underline decoration-2 decoration-[#18ff80] underline-offset-4 hover:decoration-[#18ff80] transition-colors"
              target="_blank"
            >
              Abstract
            </Link>{" "}
            $ETH
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-6">
          <ConnectWalletButton />
        </div>

        {/* Connected Content - Horizontal Layout */}
        {isConnected && (
          <div className="flex flex-col lg:flex-row items-stretch justify-center gap-6 lg:gap-8">
            {/* Left Column - User Profile & Example */}
            <div className="w-full lg:w-auto lg:min-w-[320px] flex flex-col gap-6 lg:h-full">
              <div className="flex justify-center lg:justify-start flex-1">
                <AbstractPlayerCard />
              </div>
              <div className="flex justify-center lg:justify-start flex-1">
                <SuccessfulExampleCard />
              </div>
            </div>

            {/* Right Column - Mint License Card */}
            <div className="w-full lg:w-auto flex justify-center lg:justify-start">
              <MintStoryLicense
                ipId={STORY_IP_ASSET_ID}
                licenseTermsId={IP_ASSET_LICENSE_TERMS_ID}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
