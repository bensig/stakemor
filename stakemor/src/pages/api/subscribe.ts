import type { APIRoute } from 'astro';
import { subscribe } from '../../lib/subscribe';

export const prerender = false;

interface Env {
  RESEND_API_KEY?: string;
  RESEND_AUDIENCE_ID?: string;
}

function envFrom(locals: App.Locals): Env {
  const runtime = (locals as unknown as { runtime?: { env?: Env } }).runtime;
  return runtime?.env ?? (process.env as unknown as Env);
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

  const env = envFrom(locals);
  if (!env.RESEND_API_KEY || !env.RESEND_AUDIENCE_ID) {
    return Response.json(
      { ok: false, error: 'misconfigured' },
      { status: 500 },
    );
  }

  const result = await subscribe({
    email,
    apiKey: env.RESEND_API_KEY,
    audienceId: env.RESEND_AUDIENCE_ID,
  });

  if (result.ok) return Response.json(result, { status: 200 });
  if (result.error === 'invalid_email')
    return Response.json(result, { status: 400 });
  return Response.json(result, { status: 502 });
};
