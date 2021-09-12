const path = require('path')

module.exports = {
    testRegex: ['/__tests__/.*\\.[jt]sx?$'],
    preset: 'ts-jest',
    testEnvironment: 'jest-environment-jsdom',
    globals: {
        'ts-jest': {
            isolatedModules: true,
        },
    },
    globalTeardown: path.join(__dirname, './scripts/jest-global-teardown'),
    setupFiles: [
        require.resolve('jest-webextension-mock'),
        require.resolve('fake-indexeddb/auto'),
        path.join(__dirname, './scripts/jest-setup.js'),
    ],
    // skip packages other than 'holoflows/kit'
    transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$', '^.+\\.module\\.(css|sass|scss)$'],
    modulePathIgnorePatterns: ['packages/theme/dist', 'packages/maskbook/dist'],
    transform: {
        'node_modules.+(holoflows).+.js$': 'jest-esm-transformer',
        '^.+\\.[jt]sx?$': 'ts-jest',
    },
    moduleNameMapper: {
        'lodash-es': require.resolve('lodash'),
        'idb/with-async-ittr-cjs': require.resolve('idb/with-async-ittr-cjs.js'),
    },
}
