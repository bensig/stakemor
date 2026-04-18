export interface SubscribeInput {
  email: string;
  apiKey: string;
  listId: string;
}

export type SubscribeResult =
  | { ok: true }
  | { ok: false; error: 'invalid_email' | 'provider_error' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribe(input: SubscribeInput): Promise<SubscribeResult> {
  if (!EMAIL_RE.test(input.email)) {
    return { ok: false, error: 'invalid_email' };
  }
  try {
    const res = await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        list_ids: [input.listId],
        contacts: [{ email: input.email }],
      }),
    });
    if (!res.ok) {
      return { ok: false, error: 'provider_error' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'provider_error' };
  }
}
