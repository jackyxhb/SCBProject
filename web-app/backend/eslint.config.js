export default [
  {
    files: ['**/*.js'],
    ignores: ['**/node_modules/**', 'dist/**', 'build/**', 'coverage/**'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      indent: ['error', 2, { SwitchCase: 1 }]
    }
  }
];
