import type { APIRoute } from 'astro';
import { subscribe } from '../../lib/subscribe';
// In Astro v6 + @astrojs/cloudflare v13, locals.runtime.env is removed.
// The adapter sets up Astro's env system via cloudflare:workers, which is
// shim-populated from .env (dev) or Pages secrets (production).
// We fall back to process.env for non-Cloudflare environments.
import { env as cfEnv } from 'cloudflare:workers';

export const prerender = false;

interface Env {
  SENDGRID_API_KEY?: string;
  SENDGRID_LIST_ID?: string;
}

function getEnvVars(locals?: App.Locals): Env {
  // locals.runtime.env is populated in test contexts (and older adapter versions)
  const runtimeEnv = (locals as unknown as { runtime?: { env?: Env } })?.runtime?.env ?? {};
  const cfTyped = cfEnv as unknown as Env;
  return {
    SENDGRID_API_KEY:
      runtimeEnv.SENDGRID_API_KEY ?? cfTyped.SENDGRID_API_KEY ?? process.env.SENDGRID_API_KEY,
    SENDGRID_LIST_ID:
      runtimeEnv.SENDGRID_LIST_ID ?? cfTyped.SENDGRID_LIST_ID ?? process.env.SENDGRID_LIST_ID,
  };
}

export const POST: APIRoute = async ({ request, locals }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'invalid_body' }, { status: 400 });
  }

  const { email } = (body ?? {}) as { email?: string };
  if (typeof email !== 'string') {
    return Response.json({ ok: false, error: 'invalid_body' }, { status: 400 });
  }

  const env = getEnvVars(locals);
  if (!env.SENDGRID_API_KEY || !env.SENDGRID_LIST_ID) {
    return Response.json(
      { ok: false, error: 'misconfigured' },
      { status: 500 },
    );
  }

  const result = await subscribe({
    email,
    apiKey: env.SENDGRID_API_KEY,
    listId: env.SENDGRID_LIST_ID,
  });

  if (result.ok) return Response.json(result, { status: 200 });
  if (result.error === 'invalid_email')
    return Response.json(result, { status: 400 });
  return Response.json(result, { status: 502 });
};
