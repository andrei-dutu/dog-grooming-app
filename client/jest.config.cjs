module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg|webp|avif)$': '<rootDir>/src/test/fileMock.js',
  },
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
}
