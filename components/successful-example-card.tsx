"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

export function SuccessfulExampleCard() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg mb-2">Successful Example</CardTitle>
        <div className="text-xs text-gray-600">
          This is a real transaction that was run on Abstract mainnet.
        </div>
      </CardHeader>
      <CardContent className="pt-3 space-y-3">
        {/* Abstract Transaction */}
        <a
          href="https://explorer.mainnet.abs.xyz/tx/0xfb48c4c85e201f30ba5a94f2fe4469fcff648a2aca5ea8458ffd21be9262a51d"
          target="_blank"
          rel="noopener noreferrer"
          className="block p-2 rounded-lg border transition-colors hover:opacity-80"
          style={{
            backgroundColor: "#18ff80",
            borderColor: "#18ff80",
            color: "#000",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono font-semibold">
                Abstract: 0xfb48c4c8...262a51d
              </div>
              <div className="text-xs opacity-80">Payment</div>
            </div>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </div>
        </a>

        {/* Story Transaction */}
        <a
          href="https://www.storyscan.io/tx/0xd40654f66aa076483edcd62f878efc4c694c4d78b5c544167dc09c3ac9ef30d3?tab=logs"
          target="_blank"
          rel="noopener noreferrer"
          className="block p-2 rounded-lg border transition-colors hover:opacity-80"
          style={{
            backgroundColor: "#E9F6FF",
            borderColor: "#E9F6FF",
            color: "#1a365d",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono font-semibold">
                Story: 0xd40654f6...c9ef30d3
              </div>
              <div className="text-xs opacity-80">License Mint</div>
            </div>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </div>
        </a>
      </CardContent>
    </Card>
  );
}
