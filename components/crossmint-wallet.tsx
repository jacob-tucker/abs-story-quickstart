"use client";

import { EVMWallet, useWallet } from "@crossmint/client-sdk-react-ui";
import { useEffect } from "react";
import { useAuth } from "@crossmint/client-sdk-react-ui";
import { encodeFunctionData, zeroAddress } from "viem";
import { licenseAttachmentWorkflowsAbi } from "@/lib/licenseAttachmentWorkflowsAbi";
import {
  LicensingConfig,
  PILFlavor,
  WIP_TOKEN_ADDRESS,
} from "@story-protocol/core-sdk";

export function CrossmintWallet() {
  const { wallet, status } = useWallet();
  const { login, logout, jwt } = useAuth();

  useEffect(() => {
    console.log(wallet, status);
  }, [wallet, status]);

  async function sendTx() {
    if (!wallet) {
      return "";
    }

    const defaultLicensingConfig: LicensingConfig = {
      mintingFee: 0n,
      isSet: false,
      disabled: false,
      commercialRevShare: 0,
      expectGroupRewardPool: zeroAddress,
      expectMinimumGroupRewardShare: 0,
      licensingHook: zeroAddress,
      hookData: "0x",
    };

    const transactionRequest = {
      to: "0xcC2E862bCee5B6036Db0de6E06Ae87e524a79fd8" as `0x${string}`, // example nft contract
      data: encodeFunctionData({
        abi: licenseAttachmentWorkflowsAbi, // abi from another file
        functionName: "mintAndRegisterIpAndAttachPILTerms",
        args: [
          "0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc",
          wallet.address,
          {
            ipMetadataURI: `https://ipfs.io/ipfs/QmReVXv6nAFqw3o2gkWk6Ag51MyfFJV3XxAF9puyga2j8s`,
            ipMetadataHash: `0x018a895030842946f4bd1911f1658dc6c811f53fae70c1609cc1727047315fa4`,
            nftMetadataURI: `https://ipfs.io/ipfs/QmWQmJYqshh3SVQ6Yv8PnN4paN6QEDq2tmW17PQ6NybnZR`,
            nftMetadataHash: `0x41a4d1aded5525a12fd2c1ee353712e9e980535651eb20c6b6ff151c5eecd590`,
          },
          [
            {
              terms: PILFlavor.commercialRemix({
                commercialRevShare: 0,
                defaultMintingFee: 0,
                currency: WIP_TOKEN_ADDRESS,
              }),
              licensingConfig: defaultLicensingConfig,
            },
          ],
          true,
        ],
      }),
    };

    const evmWallet = EVMWallet.from(wallet);
    const { hash, explorerLink } = await evmWallet.sendTransaction({
      ...transactionRequest,
      value: 0n,
    });

    console.log(hash, explorerLink);
  }

  return (
    <div>
      {!jwt ? (
        <button type="button" onClick={login}>
          Login
        </button>
      ) : (
        <button type="button" onClick={logout}>
          Logout
        </button>
      )}

      {status === "in-progress" ? (
        <div>Loading...</div>
      ) : status === "loaded" && wallet ? (
        <div>Connected: {wallet?.address}</div>
      ) : (
        <div>Wallet not connected</div>
      )}

      <button type="button" onClick={sendTx}>
        Send Tx
      </button>
    </div>
  );
}
