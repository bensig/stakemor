import { defineConfig } from 'vitest/config';

// Bare config (no `getViteConfig` wrapping) because the Cloudflare adapter's
// Vite plugin conflicts with Vitest's environment options. Sufficient for
// pure-function tests. If we add `.astro`-component tests later, set up a
// separate `vitest.astro.config.ts` that uses `getViteConfig`.
export default defineConfig({
  resolve: {
    alias: {
      // cloudflare:workers is a runtime-only module; stub it for vitest so tests
      // can import pages/api routes without the Cloudflare adapter installed.
      'cloudflare:workers': new URL('./tests/__stubs__/cloudflare-workers.ts', import.meta.url)
        .pathname,
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/**/*.test.ts'],
  },
});
