/**
 * Jest config for pure-logic unit tests (services/utils/stores logic).
 * Uses ts-jest in a node environment. Component/RN rendering is out of scope
 * here — these tests exercise the app's business logic, which is the part that
 * benefits most from fast, deterministic verification.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'commonjs',
          moduleResolution: 'node',
          esModuleInterop: true,
          resolveJsonModule: true,
          strict: true,
          jsx: 'react-jsx',
          skipLibCheck: true,
          types: ['jest', 'node'],
        },
      },
    ],
  },
};
