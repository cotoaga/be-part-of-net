// jest-setup.ts
import '@testing-library/jest-dom'

// Import Supabase mocks for all tests
import './tests/mocks/supabase'

global.Response = class Response {
  static json(data: any) {
    return { json: () => Promise.resolve(data) }
  }
}

// Mock Next.js router globally
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/test-path',
}))

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'