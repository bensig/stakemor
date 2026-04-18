// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://stakemor.com',
  output: 'server',
  adapter: cloudflare({ imageService: 'compile' }),
  vite: {
    plugins: [tailwindcss()],
  },
});
