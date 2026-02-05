import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-wallets';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ isAdmin: false });
  }

  const isAdmin = await verifyAdmin(wallet);
  return NextResponse.json({ isAdmin });
}
