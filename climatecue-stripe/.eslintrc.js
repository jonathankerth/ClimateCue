module.exports = {
  env: {
    browser: true,
    node: true,
    mocha: true, // Only if you are using Mocha for testing
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true, // If you're using JSX
    },
  },
  extends: [
    "eslint:recommended",
    "google",
    "plugin:prettier/recommended", // Add this line
  ],
  plugins: [
    "prettier", // Add this line
  ],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "prettier/prettier": "error", // Add Prettier rules
    "new-cap": ["error", { capIsNewExceptions: ["Router"] }],
  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {
    // Define any global variables here if needed
  },
}
