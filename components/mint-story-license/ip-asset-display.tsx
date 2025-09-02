"use client";

import { convertIpfsToHttps } from "@/lib/utils";
import { IPAssetMetadata } from "./types";

interface IPAssetDisplayProps {
  metadata: IPAssetMetadata;
}

export function IPAssetDisplay({ metadata }: IPAssetDisplayProps) {
  return (
    <>
      {/* Image */}
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={convertIpfsToHttps(metadata.image)}
          alt={metadata.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
        />
      </div>

      {/* Title and Description */}
      <div className="p-4">
        <div className="space-y-3">
          {/* Title */}
          <h3 className="text-base font-semibold text-gray-900 leading-tight line-clamp-2">
            {metadata.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
            {metadata.description}
          </p>
        </div>
      </div>
    </>
  );
}
