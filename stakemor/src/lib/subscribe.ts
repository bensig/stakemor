import { Resend } from 'resend';

export interface SubscribeInput {
  email: string;
  path: 'long' | 'short';
  apiKey: string;
  audienceId: string;
}

export type SubscribeResult =
  | { ok: true }
  | { ok: false; error: 'invalid_email' | 'provider_error' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribe(input: SubscribeInput): Promise<SubscribeResult> {
  if (!EMAIL_RE.test(input.email)) {
    return { ok: false, error: 'invalid_email' };
  }
  const resend = new Resend(input.apiKey);
  try {
    const { error } = await resend.contacts.create({
      email: input.email,
      audienceId: input.audienceId,
      unsubscribed: false,
      firstName: undefined,
      lastName: undefined,
    });
    if (error) {
      return { ok: false, error: 'provider_error' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'provider_error' };
  }
}
