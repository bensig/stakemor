/// <reference path="../.astro/types.d.ts" />

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
        RESEND_API_KEY?: string;
        RESEND_AUDIENCE_ID?: string;
      };
    };
  }
}
