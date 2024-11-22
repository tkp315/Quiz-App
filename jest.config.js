// jest.config.js
export default {
    testEnvironment: 'node',
    transform: {
      '^.+\\.js$': 'babel-jest', // Use babel-jest to transform JavaScript files
    },
    globals: {
      'babel-jest': {
        useESModules: true,
      },
    },
    moduleNameMapper: {
    "^src/models/user.model$": "<rootDir>/tests/__mocks__/user.model.js",
    },
  };
