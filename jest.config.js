module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    modulePaths: [
        'src'
    ],
    collectCoverage: true,
    coverageReporters: [
        'text',
        'lcov'
    ],
    cache: false,
    coverageThreshold: {
        '**/*.ts': {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
        }
    }
};
