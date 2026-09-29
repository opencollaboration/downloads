import type { Configuration } from 'lint-staged';

const config: Configuration = {
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{css,json,md,yml,yaml}': ['prettier --write'],
};

export default config;
