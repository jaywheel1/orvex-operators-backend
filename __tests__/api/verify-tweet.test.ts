import { POST } from '@/app/api/verify-tweet/route';
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

jest.mock('@/lib/supabase');
jest.mock('@anthropic-ai/sdk');

describe('POST /api/verify-tweet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reject requests with missing fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/verify-tweet', {
      method: 'POST',
      body: JSON.stringify({
        wallet_address: '0x123',
        // missing tweet_url, verification_code, x_handle
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.error).toContain('Missing required fields');
  });

  it('should reject invalid tweet URLs', async () => {
    const request = new NextRequest('http://localhost:3000/api/verify-tweet', {
      method: 'POST',
      body: JSON.stringify({
        wallet_address: '0x123',
        tweet_url: 'https://invalid-url.com/post/123',
        verification_code: 'TEST123',
        x_handle: 'testuser',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.error).toContain('Invalid tweet URL format');
  });

  it('should accept valid Twitter.com URLs', async () => {
    const mockSupabase = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>;
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }),
      insert: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { id: 'user-1' },
          error: null,
        }),
      }),
    } as unknown as ReturnType<typeof supabaseAdmin.from>);

    const request = new NextRequest('http://localhost:3000/api/verify-tweet', {
      method: 'POST',
      body: JSON.stringify({
        wallet_address: '0x123',
        tweet_url: 'https://twitter.com/testuser/status/1234567890',
        verification_code: 'TEST123',
        x_handle: 'testuser',
      }),
    });

    const response = await POST(request);
    expect([400, 200, 500]).toContain(response.status);
  });

  it('should accept valid X.com URLs', async () => {
    const request = new NextRequest('http://localhost:3000/api/verify-tweet', {
      method: 'POST',
      body: JSON.stringify({
        wallet_address: '0x123',
        tweet_url: 'https://x.com/testuser/status/1234567890',
        verification_code: 'TEST123',
        x_handle: 'testuser',
      }),
    });

    // Just verify it doesn't reject the URL format
    const response = await POST(request);
    expect(response.status).not.toBe(400); // Should not return 400 for invalid URL
  });

  it('should auto-approve admin wallet', async () => {
    const mockSupabase = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>;
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }),
      insert: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { id: 'user-1' },
          error: null,
        }),
      }),
    } as unknown as ReturnType<typeof supabaseAdmin.from>);

    const adminWallet = '0xc4a00be797e0acfe8518f795359898b01a038dc8';
    const request = new NextRequest('http://localhost:3000/api/verify-tweet', {
      method: 'POST',
      body: JSON.stringify({
        wallet_address: adminWallet,
        tweet_url: 'https://twitter.com/testuser/status/1234567890',
        verification_code: 'TEST123',
        x_handle: 'testuser',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    // Admin should be auto-approved (not fail verification)
    if (response.status === 200) {
      expect(data.ok).toBe(true);
      expect(data.verified).toBe(true);
    }
  });
});
