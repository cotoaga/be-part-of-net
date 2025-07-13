// jest-setup.ts
import '@testing-library/jest-dom'

// Import Supabase mocks for all tests
import './tests/mocks/supabase'

// Mock Response for API route testing
(global as any).Response = class MockResponse {
  static json(data: any) {
    return { 
      json: () => Promise.resolve(data),
      status: 200,
      ok: true,
      headers: new Map(),
    }
  }
  
  static error() {
    return { 
      json: () => Promise.reject(new Error('Response error')),
      status: 500,
      ok: false,
    }
  }
  
  static redirect(url: string, status = 302) {
    return { 
      status,
      ok: status < 400,
      headers: new Map([['Location', url]]),
    }
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

// Ensure NODE_ENV is set to test for React testing
if (!process.env.NODE_ENV) {
  (process.env as any).NODE_ENV = 'test'
}

// Mock React's act function for production builds
jest.mock('react', () => {
  const actualReact = jest.requireActual('react')
  return {
    ...actualReact,
    act: jest.fn((callback) => {
      if (typeof callback === 'function') {
        callback()
      }
      return Promise.resolve()
    }),
  }
})