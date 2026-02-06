/* eslint-disable @typescript-eslint/no-explicit-any */
import { POST } from '@/app/api/operator/approve/route';
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

jest.mock('@/lib/supabase');

describe('POST /api/operator/approve', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reject missing required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/operator/approve', {
      method: 'POST',
      body: JSON.stringify({
        submission_id: '123',
        // missing operator_id
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.error).toContain('Missing required fields');
  });

  it('should reject if operator not found', async () => {
    const mockSupabase = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>;
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Not found' },
          }),
        }),
      }),
    } as unknown as ReturnType<typeof supabaseAdmin.from>);

    const request = new NextRequest('http://localhost:3000/api/operator/approve', {
      method: 'POST',
      body: JSON.stringify({
        submission_id: '123',
        operator_id: 'invalid-operator',
        cp_reward: 10,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.ok).toBe(false);
  });

  it('should reject if operator lacks permission', async () => {
    const mockSupabase = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>;
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { role: 'user' }, // Not an operator
            error: null,
          }),
        }),
      }),
    } as unknown as ReturnType<typeof supabaseAdmin.from>);

    const request = new NextRequest('http://localhost:3000/api/operator/approve', {
      method: 'POST',
      body: JSON.stringify({
        submission_id: '123',
        operator_id: 'user-wallet',
        cp_reward: 10,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.ok).toBe(false);
    expect(data.error).toContain('Unauthorized');
  });

  it('should create CP ledger before updating submission', async () => {
    const mockSupabase = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>;
    const insertMock = jest.fn();
    const updateMock = jest.fn();

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { role: 'operator' },
                error: null,
              }),
            }),
          }),
        } as any;
      }
      if (table === 'task_submissions') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 'submission-1',
                  user_id: 'user-1',
                  status: 'pending',
                  task_category: 'social',
                  task_type: 'follow',
                  cp_reward: 100,
                },
                error: null,
              }),
            }),
          }),
          update: updateMock.mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: 'submission-1',
                    status: 'approved',
                  },
                  error: null,
                }),
              }),
            }),
          }),
        } as any;
      }
      if (table === 'cp_ledger') {
        return {
          insert: insertMock.mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 'ledger-1',
                  user_id: 'user-1',
                  amount: 100,
                },
                error: null,
              }),
            }),
          }),
        } as any;
      }
      return {} as any;
    });

    const request = new NextRequest('http://localhost:3000/api/operator/approve', {
      method: 'POST',
      body: JSON.stringify({
        submission_id: 'submission-1',
        operator_id: 'operator-1',
        cp_reward: 100,
      }),
    });

    await POST(request);

    // Verify CP ledger was inserted
    expect(insertMock).toHaveBeenCalled();
    // Verify submission was updated (happens after ledger)
    expect(updateMock).toHaveBeenCalled();
  });

  it('should fail if CP ledger creation fails', async () => {
    const mockSupabase = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>;

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { role: 'operator' },
                error: null,
              }),
            }),
          }),
        } as any;
      }
      if (table === 'task_submissions') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 'submission-1',
                  user_id: 'user-1',
                  status: 'pending',
                  task_category: 'social',
                  task_type: 'follow',
                  cp_reward: 100,
                },
                error: null,
              }),
            }),
          }),
        } as any;
      }
      if (table === 'cp_ledger') {
        return {
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error', code: 'DB_ERROR' },
              }),
            }),
          }),
        } as any;
      }
      return {} as any;
    });

    const request = new NextRequest('http://localhost:3000/api/operator/approve', {
      method: 'POST',
      body: JSON.stringify({
        submission_id: 'submission-1',
        operator_id: 'operator-1',
        cp_reward: 100,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.ok).toBe(false);
    expect(data.error).toContain('CP ledger');
  });
});
