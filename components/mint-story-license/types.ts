export interface IPAssetMetadata {
  image: string;
  title: string;
  description: string;
}

export interface LicenseTerms {
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

export interface MintStoryLicenseProps {
  ipId: string;
  licenseTermsId: string;
  className?: string;
}
