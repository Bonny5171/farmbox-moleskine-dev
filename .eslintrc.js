module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-native/all',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    'react-native/react-native': true,
  },
  plugins: ['react', 'react-native', 'prettier'],
  rules: {
    'prettier/prettier': ['error'],
    // customize conforme desejar
    'react/react-in-jsx-scope': 'off', // se estiver usando React 17+
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
