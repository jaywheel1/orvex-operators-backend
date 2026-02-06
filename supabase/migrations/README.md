# Supabase Migrations

This directory contains SQL migrations for the Orvex Operators Backend.

## Performance Indexes Migration

**File:** `add-performance-indexes.sql`

This migration adds database indexes to improve query performance. These indexes optimize:

1. **Leaderboard queries** - Fast sorting by points
2. **User lookups** - Fast wallet address searches
3. **Task submission queries** - Fast filtering by status and creation date
4. **Referral lookups** - Fast referrer and verification checks
5. **CP Ledger queries** - Fast user point history lookups

### How to Apply

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy the contents of `add-performance-indexes.sql`
5. Run the query

The migration creates indexes with `CREATE INDEX IF NOT EXISTS` so it's safe to run multiple times.

## Performance Impact

These indexes will:
- ✅ Speed up leaderboard sorting (previously O(n log n), now O(log n) range scan)
- ✅ Reduce database load on frequently used queries
- ✅ Improve dashboard loading times
- ✅ Support pagination without full table scans

Expected improvements:
- Leaderboard queries: ~100-1000ms → ~10-50ms
- User lookups: ~50-500ms → ~5-20ms
- Submission filtering: ~100-1000ms → ~10-50ms

## Index Strategy

The migration uses a balanced indexing strategy:
- Single-column indexes for commonly filtered fields
- Composite indexes for common WHERE + ORDER BY combinations
- Filtered indexes for specific query conditions (e.g., active users only)
