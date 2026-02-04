import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, base } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'a0907a623f2adde61e9e244d21c3cfa9';

export const config = getDefaultConfig({
  appName: 'Orvex Operators',
  projectId,
  chains: [mainnet, base, sepolia],
  ssr: true,
});
