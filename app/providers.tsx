'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme, getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  phantomWallet,
  trustWallet,
  ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { mainnet, base, sepolia } from 'wagmi/chains';
import '@rainbow-me/rainbowkit/styles.css';

const projectId = 'a0907a623f2adde61e9e244d21c3cfa9';

const { wallets: defaultWallets } = getDefaultWallets({
  appName: 'Orvex Operators',
  projectId,
});

const connectors = connectorsForWallets(
  [
    ...defaultWallets,
    {
      groupName: 'Other',
      wallets: [
        phantomWallet,
        trustWallet,
        ledgerWallet,
      ],
    },
  ],
  {
    appName: 'Orvex Operators',
    projectId,
  }
);

const config = createConfig({
  connectors,
  chains: [mainnet, base, sepolia],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
  multiInjectedProviderDiscovery: true,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme()}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
