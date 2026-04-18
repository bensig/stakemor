import { defineConfig } from 'vitest/config';

// Bare config (no `getViteConfig` wrapping) because the Cloudflare adapter's
// Vite plugin conflicts with Vitest's environment options. Sufficient for
// pure-function tests. If we add `.astro`-component tests later, set up a
// separate `vitest.astro.config.ts` that uses `getViteConfig`.
export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/**/*.test.ts'],
  },
});
