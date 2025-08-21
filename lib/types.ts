// Types for deBridge integration
export interface DeBridgeApiResponse {
  estimation: {
    srcChainTokenIn: {
      amount: string;
      approximateOperatingExpense: string;
    };
    dstChainTokenOut: {
      amount: string;
      maxTheoreticalAmount: string;
    };
  };
  tx: {
    to: string;
    data: string;
    value: string;
  };
  orderId: string;
}

export interface RoyaltyPaymentParams {
  ipAssetId: string;
  licenseTermsId: string;
  paymentAmount: string; // Amount in WIP tokens (wei)
  receiverAddress: string;
  senderAddress: string;
}
