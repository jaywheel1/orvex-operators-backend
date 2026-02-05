import { GET } from '@/app/api/leaderboard/route';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            range: jest.fn().mockResolvedValue({
              data: [
                { id: '1', wallet_address: '0x111', points: 1000, created_at: '2024-01-01' },
                { id: '2', wallet_address: '0x222', points: 900, created_at: '2024-01-02' },
              ],
              error: null,
              count: 100,
            }),
          }),
        }),
      }),
    }),
  }),
}));

describe('GET /api/leaderboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
  });

  it('should return leaderboard data with default pagination', async () => {
    const request = new Request('http://localhost:3000/api/leaderboard');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.data[0]).toHaveProperty('rank', 1);
    expect(data.data[0]).toHaveProperty('wallet_address');
    expect(data.data[0]).toHaveProperty('points');
  });

  it('should enforce max limit of 1000', async () => {
    const request = new Request('http://localhost:3000/api/leaderboard?limit=5000');
    const response = await GET(request);
    const data = await response.json();

    expect(data.limit).toBeLessThanOrEqual(1000);
    expect(data.limit).toBe(1000);
  });

  it('should enforce minimum limit of 1', async () => {
    const request = new Request('http://localhost:3000/api/leaderboard?limit=0');
    const response = await GET(request);
    const data = await response.json();

    expect(data.limit).toBeGreaterThanOrEqual(1);
    expect(data.limit).toBe(1);
  });

  it('should enforce max offset', async () => {
    const request = new Request('http://localhost:3000/api/leaderboard?offset=2000000');
    const response = await GET(request);
    const data = await response.json();

    expect(data.offset).toBeLessThanOrEqual(1000000);
  });

  it('should reject negative offset', async () => {
    const request = new Request('http://localhost:3000/api/leaderboard?offset=-10');
    const response = await GET(request);
    const data = await response.json();

    expect(data.offset).toBeGreaterThanOrEqual(0);
    expect(data.offset).toBe(0);
  });

  it('should include cache headers', async () => {
    const request = new Request('http://localhost:3000/api/leaderboard');
    const response = await GET(request);

    const cacheControl = response.headers.get('Cache-Control');
    expect(cacheControl).toBeTruthy();
    const hasValidCache = cacheControl?.includes('max-age') || cacheControl?.includes('s-maxage');
    expect(hasValidCache).toBe(true);
  });

  it('should rank users correctly based on offset', async () => {
    const request = new Request('http://localhost:3000/api/leaderboard?limit=10&offset=50');
    const response = await GET(request);
    const data = await response.json();

    if (data.data.length > 0) {
      expect(data.data[0].rank).toBe(51); // offset 50 + index 0 + 1
      expect(data.data[1].rank).toBe(52);
    }
  });

  it('should return total count', async () => {
    const request = new Request('http://localhost:3000/api/leaderboard');
    const response = await GET(request);
    const data = await response.json();

    expect(data).toHaveProperty('total');
    expect(typeof data.total).toBe('number');
  });

  it('should use custom limit and offset', async () => {
    const request = new Request('http://localhost:3000/api/leaderboard?limit=50&offset=100');
    const response = await GET(request);
    const data = await response.json();

    expect(data.limit).toBe(50);
    expect(data.offset).toBe(100);
  });
});
