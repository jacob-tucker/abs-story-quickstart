"use client";

import {
  CrossmintAuthProvider,
  CrossmintProvider,
  CrossmintWalletProvider,
} from "@crossmint/client-sdk-react-ui";

export default function CrossmintClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CrossmintProvider
      apiKey={process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_KEY as string}
    >
      <CrossmintAuthProvider loginMethods={["email", "google"]}>
        <CrossmintWalletProvider
          createOnLogin={{
            chain: "story",
            signer: {
              type: "email",
            },
          }}
        >
          {children}
        </CrossmintWalletProvider>
      </CrossmintAuthProvider>
    </CrossmintProvider>
  );
}
