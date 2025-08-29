import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts an IPFS URL to a full HTTPS gateway URL
 * @param ipfsUrl - IPFS URL (e.g., ipfs://QmXxXxXx or ipfs://QmXxXxXx/path/to/file)
 * @param gateway - IPFS gateway URL (defaults to https://ipfs.io/ipfs/)
 * @returns Full HTTPS IPFS gateway URL
 *
 * @example
 * ```typescript
 * const ipfsUrl = "ipfs://QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx"
 * const fullUrl = convertIpfsToHttps(ipfsUrl)
 * // Returns: "https://ipfs.io/ipfs/QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx"
 *
 * const ipfsUrlWithPath = "ipfs://QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx/metadata.json"
 * const fullUrlWithPath = convertIpfsToHttps(ipfsUrlWithPath)
 * // Returns: "https://ipfs.io/ipfs/QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx/metadata.json"
 * ```
 */
export function convertIpfsToHttps(
  ipfsUrl: string,
  gateway: string = "https://ipfs.io/ipfs/"
): string {
  try {
    // Check if it's already an HTTPS URL
    if (ipfsUrl.startsWith("https://") || ipfsUrl.startsWith("http://")) {
      return ipfsUrl;
    }

    // Check if it's an IPFS URL
    if (!ipfsUrl.startsWith("ipfs://")) {
      throw new Error("Not a valid IPFS URL");
    }

    // Remove the ipfs:// protocol
    const ipfsPath = ipfsUrl.replace("ipfs://", "");

    // Ensure gateway ends with a slash
    const normalizedGateway = gateway.endsWith("/") ? gateway : gateway + "/";

    // Construct the full HTTPS URL
    return normalizedGateway + ipfsPath;
  } catch (error) {
    console.error("Error converting IPFS URL to HTTPS:", error);
    throw new Error(`Invalid IPFS URL: ${ipfsUrl}`);
  }
}

/**
 * Converts a GitHub blob URL to a raw URL
 * @param blobUrl - GitHub blob URL (e.g., https://github.com/user/repo/blob/branch/path/file.json)
 * @returns Raw GitHub URL (e.g., https://raw.githubusercontent.com/user/repo/branch/path/file.json)
 *
 * @example
 * ```typescript
 * const blobUrl = "https://github.com/piplabs/pil-document/blob/ad67bb632a310d2557f8abcccd428e4c9c798db1/off-chain-terms/CommercialRemix.json"
 * const rawUrl = convertGithubBlobToRaw(blobUrl)
 * // Returns: "https://raw.githubusercontent.com/piplabs/pil-document/ad67bb632a310d2557f8abcccd428e4c9c798db1/off-chain-terms/CommercialRemix.json"
 * ```
 */
export function convertGithubBlobToRaw(blobUrl: string): string {
  try {
    const url = new URL(blobUrl);

    // Check if it's a GitHub URL
    if (url.hostname !== "github.com") {
      return blobUrl;
    }

    // Parse the path: /user/repo/blob/branch/path/to/file
    const pathParts = url.pathname.split("/");

    // Ensure it has the expected structure
    if (pathParts.length < 5 || pathParts[3] !== "blob") {
      throw new Error("Not a valid GitHub blob URL");
    }

    // Extract components
    const user = pathParts[1];
    const repo = pathParts[2];
    const branch = pathParts[4];
    const filePath = pathParts.slice(5).join("/");

    // Construct raw URL
    return `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${filePath}`;
  } catch (error) {
    console.error("Error converting GitHub blob URL to raw:", error);
    throw new Error(`Invalid GitHub blob URL: ${blobUrl}`);
  }
}
