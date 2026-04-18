/// <reference path="../.astro/types.d.ts" />

// Type stub for the Cloudflare Workers runtime module.
// The real implementation is injected by the @astrojs/cloudflare adapter at runtime.
declare module 'cloudflare:workers' {
  export const env: Record<string, string | undefined>;
}

interface ImportMetaEnv {
  readonly PUBLIC_SUSHI_REFERRER?: string;
  readonly PUBLIC_PLAUSIBLE_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    runtime: {
      env: {
        SENDGRID_API_KEY?: string;
        SENDGRID_LIST_ID?: string;
      };
    };
  }
}
