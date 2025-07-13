// tests/mocks/supabase.ts
export const mockSupabaseClient = {
  auth: {
    signInWithPassword: jest.fn().mockResolvedValue({ 
      data: { user: { id: 'test-user', email: 'test@example.com' } },
      error: null 
    }),
    signUp: jest.fn().mockResolvedValue({ 
      data: { user: { id: 'test-user', email: 'test@example.com' } },
      error: null 
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    getUser: jest.fn().mockResolvedValue({ 
      data: { user: { id: 'test-user', email: 'test@example.com' } },
      error: null 
    }),
    getSession: jest.fn().mockResolvedValue({ 
      data: { session: { user: { id: 'test-user', email: 'test@example.com' } } },
      error: null 
    }),
    exchangeCodeForSession: jest.fn().mockResolvedValue({ error: null }),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ 
      data: { id: 'test-id', name: 'test-name' },
      error: null 
    }),
  })),
}

// Mock the Supabase clients
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
}))

// Mock the SSR module
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => mockSupabaseClient),
  createServerClient: jest.fn(() => mockSupabaseClient),
}))