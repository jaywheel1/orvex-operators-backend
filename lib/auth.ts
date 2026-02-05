import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from './supabase';

/**
 * Verify that a wallet address is an admin
 * Extracts wallet from request headers (X-Wallet-Address)
 * This should be used in combination with client-side wallet verification
 */
export async function verifyAdminAuth(request: NextRequest): Promise<{ isAdmin: boolean; walletAddress: string | null; error: string | null }> {
  try {
    // Get wallet address from request headers
    const walletAddress = request.headers.get('x-wallet-address')?.toLowerCase();

    if (!walletAddress) {
      return { isAdmin: false, walletAddress: null, error: 'Missing wallet address' };
    }

    // Query profiles table for admin role
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', walletAddress)
      .single();

    if (error || !profile) {
      return { isAdmin: false, walletAddress, error: 'Admin profile not found' };
    }

    if (profile.role !== 'admin') {
      return { isAdmin: false, walletAddress, error: 'User is not an admin' };
    }

    return { isAdmin: true, walletAddress, error: null };
  } catch (err) {
    console.error('Auth verification error:', err);
    return { isAdmin: false, walletAddress: null, error: 'Auth verification failed' };
  }
}

/**
 * Middleware helper to check admin auth and return error response if not authorized
 */
export async function requireAdminAuth(request: NextRequest): Promise<{ authorized: boolean; response?: NextResponse; walletAddress?: string }> {
  const auth = await verifyAdminAuth(request);

  if (!auth.isAdmin) {
    const response = NextResponse.json(
      { ok: false, error: auth.error || 'Unauthorized' },
      { status: 403 }
    );
    return { authorized: false, response };
  }

  return { authorized: true, walletAddress: auth.walletAddress || undefined };
}
