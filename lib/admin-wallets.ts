import { supabaseAdmin } from '@/lib/supabase';

// Admin wallet addresses (lowercase)
// These wallets always have admin access regardless of database state
export const ADMIN_WALLETS = [
  '0xc4a00be797e0acfe8518f795359898b01a038dc8',
].map(w => w.toLowerCase());

export function isAdminWallet(wallet: string): boolean {
  return ADMIN_WALLETS.includes(wallet.toLowerCase());
}

// Shared admin verification: checks hardcoded list first, then DB
export async function verifyAdmin(wallet: string): Promise<boolean> {
  const walletLower = wallet.toLowerCase();
  if (ADMIN_WALLETS.includes(walletLower)) return true;

  // Fallback: check profiles table by wallet_address column
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('wallet_address', walletLower)
    .single();

  return profile?.role === 'admin' || profile?.role === 'operator';
}
