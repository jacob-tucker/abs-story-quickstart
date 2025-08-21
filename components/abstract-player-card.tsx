"use client";
import { AbstractProfile } from "@/components/abstract-profile";
import { useAbstractProfileByAddress } from "@/hooks/use-abstract-profile";
import { getTierName, getTierColor } from "@/lib/tier-colors";
import { getDisplayName } from "@/lib/address-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useAccount } from "wagmi";

export function AbstractPlayerCard() {
  const { address } = useAccount();
  const { data: profile, isLoading } = useAbstractProfileByAddress(address);
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }
  const displayName = getDisplayName(profile?.user?.name || "", address);
  const tier = profile?.user?.tier || 2;
  const tierName = getTierName(tier);
  const tierColor = getTierColor(tier);
  const claimedBadges = profile?.user?.badges?.filter((b) => b.claimed) || [];
  return (
    <Card className="w-full gap-3">
      <CardHeader>
        <div className="flex items-center gap-3">
          <AbstractProfile address={address} size="lg" showTooltip={false} />
          <div className="flex-1 min-w-0">
            <CardTitle className="truncate">{displayName}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                style={{ borderColor: tierColor, color: tierColor }}
              >
                {tierName} Tier
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <div className="px-6">
        <Separator />
      </div>
      <CardContent>
        <div>
          <h4 className="text-sm font-medium mb-2">Badges</h4>
          {claimedBadges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {claimedBadges.slice(0, 3).map((badgeData) => (
                <Badge
                  key={badgeData.badge.id}
                  variant="secondary"
                  className="text-xs"
                >
                  {badgeData.badge.name}
                </Badge>
              ))}
              {claimedBadges.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{claimedBadges.length - 3} more
                </Badge>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No badges yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
