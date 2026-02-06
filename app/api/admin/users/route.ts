import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdminAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await requireAdminAuth(request);
    if (!auth.authorized) {
      return auth.response!;
    }

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

    const { data, error, count } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      data,
      total: count || 0,
      limit,
      offset,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
