module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["standard", "prettier"],
  plugins: ["prettier"],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
    requireConfigFile: false,
    babelOptions: {
      plugins: ["@babel/plugin-proposal-class-properties"],
    },
  },
  rules: {
    "prettier/prettier": ["warn"],
  },
  parser: "@babel/eslint-parser",
};
