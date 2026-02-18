/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.test.ts'],
    // Mock react-native since we only test pure token values
    moduleNameMapper: {
        '^react-native$': '<rootDir>/src/__tests__/__mocks__/react-native.ts',
    },
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: {
                module: 'commonjs',
                esModuleInterop: true,
                strict: false,
                skipLibCheck: true,
            }
        }]
    },
};
