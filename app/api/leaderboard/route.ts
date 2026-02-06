import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { searchParams } = new URL(request.url);
    let limit = parseInt(searchParams.get('limit') || '100');
    let offset = parseInt(searchParams.get('offset') || '0');

    // Enforce pagination limits - max 1000 rows per request
    const MAX_LIMIT = 1000;
    const MAX_OFFSET = 1000000;

    if (limit > MAX_LIMIT) limit = MAX_LIMIT;
    if (limit < 1) limit = 1;
    if (offset < 0) offset = 0;
    if (offset > MAX_OFFSET) offset = MAX_OFFSET;

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

    const response = NextResponse.json({
      ok: true,
      data: rankedUsers,
      total: count || 0,
      limit,
      offset,
      lastUpdated: new Date().toISOString(),
    });

    // Add cache headers - leaderboard data updates less frequently
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    return response;
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
