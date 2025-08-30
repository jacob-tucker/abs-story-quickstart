"use client";

import { useAuth } from "@crossmint/client-sdk-react-ui";
import { Button } from "@/components/ui/button";

export function CrossmintWallet() {
  const { login, jwt } = useAuth();

  // Only show login button when not authenticated
  if (jwt) {
    return null;
  }

  return (
    <Button
      type="button"
      onClick={login}
      variant="outline"
      size="sm"
      className="w-full text-xs font-medium border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
    >
      <svg
        className="w-4 h-4 mr-2"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
      Login with Email
    </Button>
  );
}
