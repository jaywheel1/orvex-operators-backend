import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'campaign_live')
      .single();

    const live = data?.value === 'true';

    return NextResponse.json({ live });
  } catch {
    return NextResponse.json({ live: false });
  }
}
