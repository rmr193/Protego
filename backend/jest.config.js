module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  clearMocks: true,
  transform: {
    '^.+\\.tsx?$': './jest-esbuild-transformer.js',
  },
};
