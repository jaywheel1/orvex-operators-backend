import '@testing-library/jest-dom';

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = 'test-project-id';
process.env.ANTHROPIC_API_KEY = 'test-api-key';

// Mock fetch for API tests
global.fetch = jest.fn();
