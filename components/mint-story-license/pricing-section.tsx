"use client";

import { Button } from "@/components/ui/button";
import { useWallet } from "@crossmint/client-sdk-react-ui";

interface PricingSectionProps {
  ethCost: string | null;
  isLoadingCost: boolean;
  isMinting: boolean;
  useManualAddress: boolean;
  storyAddress: string;
  onMintLicense: () => void;
  txHash: string | null;
}

export function PricingSection({
  ethCost,
  isLoadingCost,
  isMinting,
  useManualAddress,
  storyAddress,
  onMintLicense,
  txHash,
}: PricingSectionProps) {
  const { wallet: crossmintWallet } = useWallet();

  return (
    <div className="pt-4 border-t border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 mb-1">License Price</div>
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
          onClick={onMintLicense}
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
  );
}
