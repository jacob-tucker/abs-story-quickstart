"use client";

import { LicenseTerms } from "./types";

interface LicenseTermsDisplayProps {
  licenseTerms: LicenseTerms;
}

export function LicenseTermsDisplay({
  licenseTerms,
}: LicenseTermsDisplayProps) {
  return (
    <div className="py-3 border-t border-gray-100">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Commercial Use:</span>
          <span
            className={`font-medium ${
              licenseTerms.commercialUse ? "text-green-600" : "text-red-600"
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
  );
}
