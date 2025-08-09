import react from 'eslint-plugin-react';

export default [
  {
    files: ['**/*.{js,jsx}'],
    ignores: ['**/node_modules/**', 'dist/**', 'build/**', 'coverage/**'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    plugins: { react },
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      indent: ['error', 2, { SwitchCase: 1 }],
      'react/prop-types': 'off'
    },
    settings: {
      react: { version: 'detect' }
    }
  }
];
