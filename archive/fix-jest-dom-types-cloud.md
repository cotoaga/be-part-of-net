# Fix Jest DOM TypeScript Errors - Full Pipeline Compatible

## Problem
TypeScript cannot find the `toBeInTheDocument` matcher from `@testing-library/jest-dom` - breaking both local development and CI/CD pipeline.

## Solution Steps (Pipeline-Aware)

### 1. Install Required Dependencies
```bash
npm install --save-dev @testing-library/jest-dom @types/testing-library__jest-dom
```

**Important:** Commit the updated `package.json` and `package-lock.json` to ensure Vercel uses the same versions.

### 2. Create Jest Setup File
Create a new file `jest-setup.ts` in your project root:

```typescript
// jest-setup.ts
import '@testing-library/jest-dom'

// Add any global test setup here
// Useful for mocking Supabase client in tests
```

### 3. Update Jest Configuration
Update your `jest.config.js` to include the setup file:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react'
      }
    }]
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.{ts,tsx}'
  ],
  // Important for CI/CD
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  // Ignore Supabase generated types
  modulePathIgnorePatterns: ['<rootDir>/src/types/supabase.ts']
}
```

### 4. Update TypeScript Configuration
Ensure your `tsconfig.json` includes the Jest DOM types:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020", "DOM"],
    "jsx": "react",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["jest", "@testing-library/jest-dom"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": [
    "src/**/*",
    "tests/**/*",
    "jest-setup.ts"
  ],
  "exclude": ["node_modules", "dist", ".next"]
}
```

### 5. Update GitHub Actions Workflow
Ensure your `.github/workflows/test.yml` (or similar) runs tests before deployment:

```yaml
name: Reality Synchronization Check

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run type check
      run: npx tsc --noEmit
```

### 6. Update Vercel Build Settings
In your `vercel.json` or Vercel dashboard:

```json
{
  "buildCommand": "npm run type-check && npm test && npm run build",
  "framework": "nextjs",
  "devCommand": "npm run dev"
}
```

Or add to `package.json` scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "test": "jest",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "type-check": "tsc --noEmit",
    "vercel-build": "npm run type-check && npm run test:ci && npm run build"
  }
}
```

### 7. Environment Variables for Supabase Tests
Create `.env.test` for test environment:

```bash
# .env.test
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-test-anon-key
```

### 8. Mock Supabase in Tests
Create `tests/mocks/supabase.ts`:

```typescript
// tests/mocks/supabase.ts
export const mockSupabaseClient = {
  auth: {
    signIn: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  })),
}

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}))
```

### 9. Git Commit Strategy
```bash
# Stage all configuration changes
git add package.json package-lock.json jest.config.js tsconfig.json jest-setup.ts

# Commit with clear message
git commit -m "fix: add Jest DOM types for testing infrastructure

- Install @testing-library/jest-dom and types
- Configure Jest setup file
- Update TypeScript config to recognize DOM matchers
- Ensure CI/CD pipeline compatibility"

# Push to trigger pipeline
git push origin your-branch
```

### 10. Verify Pipeline Success
1. Check GitHub Actions for test pass
2. Monitor Vercel deployment logs
3. Verify Supabase functions still work post-deployment

## Troubleshooting Pipeline Issues

### If Vercel build fails:
```bash
# Check Vercel function logs
vercel logs

# Ensure node version matches local
# In vercel.json:
{
  "functions": {
    "api/*": {
      "runtime": "nodejs18.x"
    }
  }
}
```

### If tests pass locally but fail in CI:
1. Check for missing environment variables
2. Ensure all dependencies are in `package.json` (not just devDependencies)
3. Verify file paths are case-sensitive (Linux vs macOS/Windows)

### Clean rebuild command:
```bash
rm -rf node_modules .next coverage
npm ci
npm run type-check
npm test
npm run build
```