/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.test.ts'],
    moduleNameMapper: {
        // Resolve workspace packages to their source
        '^@repo/types(.*)$': '<rootDir>/../types/src$1',
        '^@repo/shared(.*)$': '<rootDir>/../shared/src$1',
    },
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: {
                // Relax for tests — avoids needing a full tsconfig chain
                module: 'commonjs',
                esModuleInterop: true,
                strict: false,
                skipLibCheck: true,
            }
        }]
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/__tests__/**',
        '!src/**/index.ts',
        // Supabase-dependent services require integration tests (live DB)
        // — excluded from unit test coverage
        '!src/services/**',
        '!src/supabase.ts',
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 80,
            lines: 80,
        }
    }
};
