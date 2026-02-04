// Whitelisted wallets can re-verify multiple times (for testing)
export const WHITELISTED_WALLETS = [
  '0xc4a00be797e0acfe8518f795359898b01a038dc8', // Test wallet
].map(w => w.toLowerCase());

export function isWhitelisted(walletAddress: string): boolean {
  return WHITELISTED_WALLETS.includes(walletAddress.toLowerCase());
}
