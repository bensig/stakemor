import { defineConfig } from 'vitest/config';
import { getViteConfig } from 'astro/config';

export default getViteConfig(
  defineConfig({
    test: {
      environment: 'happy-dom',
      globals: true,
      include: ['tests/**/*.test.ts'],
    },
  }),
);
