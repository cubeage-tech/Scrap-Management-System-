export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^@prisma/client$': '<rootDir>/__mocks__/@prisma/client.js'
  },
  setupFiles: ['<rootDir>/tests/setup.js']
};
