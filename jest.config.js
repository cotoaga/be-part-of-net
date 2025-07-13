module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react'
      }
    }]
  },
  globals: {
    Response: class Response {
      static json(data) {
        return { json: () => Promise.resolve(data) }
      }
    }
  }
};

testEnvironment: 'jsdom',
testEnvironmentOptions: {
  customExportConditions: ['development', 'node']
}