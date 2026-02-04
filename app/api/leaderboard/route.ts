import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get users sorted by points descending
    const { data: users, error, count } = await supabase
      .from('users')
      .select('id, wallet_address, points, created_at', { count: 'exact' })
      .eq('registration_complete', true)
      .eq('is_banned', false)
      .order('points', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Leaderboard fetch error:', error);
      return NextResponse.json({ ok: false, error: 'Failed to fetch leaderboard' }, { status: 500 });
    }

    // Add rank to each user
    const rankedUsers = users?.map((user, index) => ({
      rank: offset + index + 1,
      wallet_address: user.wallet_address,
      points: user.points,
      joined: user.created_at,
    })) || [];

    return NextResponse.json({
      ok: true,
      data: rankedUsers,
      total: count || 0,
      limit,
      offset,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
