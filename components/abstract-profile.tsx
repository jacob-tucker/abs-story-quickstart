"use client";

import React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { useAbstractProfileByAddress } from "@/hooks/use-abstract-profile";
import { getTierColor } from "@/lib/tier-colors";
import { getDisplayName } from "@/lib/address-utils";
import { useAccount } from "wagmi";
import { cn } from "@/lib/utils";
import { type ClassValue } from "clsx";

interface AbstractProfileProps {
  address?: `0x${string}`; // Optional - defaults to connected wallet
  fallback?: string; // Optional - defaults to first 2 chars of address
  shineColor?: string; // Optional now, will use tier color if not provided
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean; // Optional tooltip
  className?: ClassValue;
}

/**
 * A profile component that loads Abstract Portal user profiles to display:
 * - User profile pictures from Abstract Portal
 * - Tier-based colored borders (Bronze, Silver, Gold, Platinum, Diamond)
 * - Loading states with skeleton placeholders
 * - Fallback support for missing profile data
 * - Responsive size variants
 * - Optional tooltips with display names
 *
 * @param address - Optional wallet address to fetch profile for (defaults to connected wallet)
 * @param fallback - Optional fallback text to display if image fails to load (defaults to first 2 chars of address)
 * @param shineColor - Optional custom border color (defaults to tier color)
 * @param size - Avatar size variant (sm, md, lg)
 * @param showTooltip - Whether to show tooltip on hover
 * @param className - Optional CSS classes to apply to the component
 */
export function AbstractProfile({
  address: providedAddress,
  fallback: providedFallback,
  shineColor,
  size = "md",
  showTooltip = true,
  className,
}: AbstractProfileProps) {
  const {
    address: connectedAddress,
    isConnecting,
    isReconnecting,
  } = useAccount();

  // Use provided address or fall back to connected wallet address
  const address = providedAddress || connectedAddress;

  // Generate fallback from address if not provided
  const fallback =
    providedFallback || (address ? address.slice(2, 4).toUpperCase() : "??");

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const { data: profile, isLoading } = useAbstractProfileByAddress(address);

  // Show loading state if wallet is connecting/reconnecting or if no address available yet
  if (!address || isConnecting || isReconnecting || isLoading) {
    return (
      <div
        className={cn(`relative rounded-full ${sizeClasses[size]}`, className)}
        style={{ border: `2px solid #C0C0C0` }}
      >
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <Avatar className={`w-full h-full`}>
            <Skeleton className={`w-full h-full rounded-full bg-muted/50`} />
          </Avatar>
        </div>
      </div>
    );
  }

  const avatarSrc =
    profile?.user?.overrideProfilePictureUrl ||
    "https://abstract-assets.abs.xyz/avatars/1-1-1.png";

  const displayName = getDisplayName(profile?.user?.name || "", address);

  // Use tier-based color if shineColor not provided
  const tierColor = profile?.user?.tier
    ? getTierColor(profile.user.tier)
    : getTierColor(1);
  const finalBorderColor = shineColor || tierColor;

  const avatarElement = (
    <div
      className={cn(`relative rounded-full ${sizeClasses[size]}`, className)}
      style={{ border: `2px solid ${finalBorderColor}` }}
    >
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <Avatar
          className={`w-full h-full transition-transform duration-200 hover:scale-110`}
        >
          <AvatarImage
            src={avatarSrc}
            alt={`${displayName} avatar`}
            className="object-cover"
          />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );

  if (!showTooltip) {
    return avatarElement;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{avatarElement}</TooltipTrigger>
      <TooltipContent>
        <p>{displayName}</p>
      </TooltipContent>
    </Tooltip>
  );
}
