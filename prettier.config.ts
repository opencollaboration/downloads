import type { Config } from 'prettier';

const config: Config = {
  singleQuote: true,
  printWidth: 100,
  trailingComma: 'all',
  plugins: ['prettier-plugin-organize-imports'],
};

export default config;
