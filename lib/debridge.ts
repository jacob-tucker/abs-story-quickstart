import {
  Account,
  Address,
  createPublicClient,
  decodeEventLog,
  encodeFunctionData,
  http,
  parseAbi,
  WalletClient,
} from "viem";
import { abstract, base, story } from "viem/chains";
import { DEBRIDGE_MULTICALL } from "./constants";
import { RoyaltyPaymentParams, DeBridgeApiResponse } from "./types";

// Build the dlnHook for Story royalty payment
export const buildRoyaltyPaymentHook = (
  params: RoyaltyPaymentParams
): string => {
  // Encode the payRoyaltyOnBehalf function call
  const calldata = encodeFunctionData({
    abi: [
      {
        name: "mintLicenseTokensCrossChain",
        type: "function",
        inputs: [
          { name: "licensorIpId", type: "address" },
          { name: "licenseTermsId", type: "uint256" },
          { name: "tokenAmount", type: "uint256" },
          { name: "receiver", type: "address" },
        ],
      },
    ],
    functionName: "mintLicenseTokensCrossChain",
    args: [
      params.ipAssetId as `0x${string}`,
      BigInt(params.licenseTermsId),
      BigInt(1),
      params.receiverAddress as `0x${string}`,
    ],
  });

  // Build the dlnHook JSON
  const dlnHook = {
    type: "evm_transaction_call",
    data: {
      to: DEBRIDGE_MULTICALL,
      calldata: calldata,
      gas: 0,
    },
  };

  return JSON.stringify(dlnHook);
};

// Build deBridge API URL for cross-chain royalty payment
export const buildDeBridgeApiUrl = (
  params: RoyaltyPaymentParams,
  testRun: boolean
): string => {
  const dlnHook = buildRoyaltyPaymentHook(params);
  const encodedHook = encodeURIComponent(dlnHook);
  const url =
    `https://dln.debridge.finance/v1.0/dln/order/create-tx?` +
    `srcChainId=100000017` + // abstract chain id
    `&srcChainTokenIn=0x0000000000000000000000000000000000000000` +
    `&srcChainTokenInAmount=auto` +
    `&dstChainId=100000013` +
    `&dstChainTokenOut=0x0000000000000000000000000000000000000000` +
    `&dstChainTokenOutAmount=${params.paymentAmount}` +
    `&dstChainTokenOutRecipient=${DEBRIDGE_MULTICALL}` +
    `&senderAddress=${params.senderAddress}` +
    `&srcChainOrderAuthorityAddress=${params.senderAddress}` +
    `&dstChainOrderAuthorityAddress=${params.senderAddress}` +
    `&enableEstimate=${!testRun}` +
    `&prependOperatingExpenses=true` +
    `&dlnHook=${encodedHook}`;

  return url;
};

// Execute deBridge API call to get transaction data
export const getDeBridgeTransactionData = async (
  params: RoyaltyPaymentParams,
  testRun: boolean
): Promise<DeBridgeApiResponse> => {
  try {
    const apiUrl = buildDeBridgeApiUrl(params, testRun);
    console.log("deBridge API Request:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `deBridge API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as DeBridgeApiResponse;

    // Validate the response
    if (!data.tx || !data.estimation || !data.orderId) {
      throw new Error("Invalid deBridge API response: missing required fields");
    }

    return data;
  } catch (error) {
    console.error("Error calling deBridge API:", error);
    throw error;
  }
};

/**
 * Get the destination chain transaction hash from deBridge using the source chain transaction hash
 * @param creationTxHash - The transaction hash from the source chain (Base)
 * @returns Promise containing both source and destination transaction hashes
 */
export const getDestinationTxHash = async (
  creationTxHash: string
): Promise<Address | null> => {
  try {
    const response = await fetch(
      `https://api.dln.trade/v1.0/Orders/creationTxHash/${creationTxHash}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get order status: ${response.statusText}`);
    }

    const orderData = await response.json();

    // Extract destination transaction hash from the response
    const destinationTxHash =
      orderData.fulfilledDstEventMetadata?.transactionHash?.stringValue || null;

    return destinationTxHash;
  } catch (error) {
    console.error("Error getting destination transaction hash:", error);
    return null;
  }
};

export const getLicenseTokenId = async (
  storyTxHash: Address
): Promise<bigint | null> => {
  const baseConfig = {
    chain: story,
    transport: http("https://mainnet.storyrpc.io"),
  } as const;
  const publicClient = createPublicClient(baseConfig);
  const { logs } = await publicClient.waitForTransactionReceipt({
    hash: storyTxHash,
  });

  const abi = parseAbi([
    "event LicenseTokenMinted(address indexed minter, address indexed receiver, uint256 indexed tokenId)",
  ]);

  const decodedLogs = logs
    .map((log) => {
      try {
        return decodeEventLog({
          abi,
          data: log.data,
          topics: log.topics,
        });
      } catch {
        return null; // skip logs that don't match
      }
    })
    .filter((log) => log !== null);

  const licenseTokenId = decodedLogs[0].args.tokenId;
  return licenseTokenId || null;
};

// Execute cross-chain royalty payment using user's wallet
export const executeRoyaltyPayment = async (
  walletClient: WalletClient,
  params: RoyaltyPaymentParams
): Promise<{ srcTxHash: Address; dstTxHash: Address | null }> => {
  try {
    // Get transaction data from deBridge
    const deBridgeResponse = await getDeBridgeTransactionData(params, false);

    // Execute the transaction using the user's wallet
    const txHash = await walletClient.sendTransaction({
      to: deBridgeResponse.tx.to as Address,
      data: deBridgeResponse.tx.data as Address,
      value: BigInt(deBridgeResponse.tx.value),
      account: walletClient.account as Account,
      chain: abstract,
    });

    const destinationTxHash = await getDestinationTxHash(txHash);

    return { srcTxHash: txHash, dstTxHash: destinationTxHash };
  } catch (error) {
    console.error("Error executing royalty payment:", error);
    throw error;
  }
};
