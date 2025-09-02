"use client";

import { Input } from "@/components/ui/input";
import { useWallet, useAuth } from "@crossmint/client-sdk-react-ui";
import { CrossmintWallet } from "../crossmint-wallet";

interface RecipientAddressSectionProps {
  useManualAddress: boolean;
  setUseManualAddress: (value: boolean) => void;
  storyAddress: string;
  setStoryAddress: (value: string) => void;
}

export function RecipientAddressSection({
  useManualAddress,
  setUseManualAddress,
  storyAddress,
  setStoryAddress,
}: RecipientAddressSectionProps) {
  const { wallet: crossmintWallet } = useWallet();
  const { logout } = useAuth();

  return (
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
                <div className="text-xs font-medium text-gray-700 mb-2">
                  Create a wallet to receive your license with just your email
                  address:
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
  );
}
