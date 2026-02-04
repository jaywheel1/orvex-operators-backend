import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ isAdmin: false });
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', wallet.toLowerCase())
    .single();

  const isAdmin = profile?.role === 'admin' || profile?.role === 'operator';

  return NextResponse.json({ isAdmin });
}
