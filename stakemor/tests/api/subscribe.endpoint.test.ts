import { describe, it, expect, vi, beforeEach } from 'vitest';

const subscribeMock = vi.hoisted(() => vi.fn());
vi.mock('../../src/lib/subscribe', () => ({ subscribe: subscribeMock }));

import { POST } from '../../src/pages/api/subscribe';

beforeEach(() => {
  subscribeMock.mockReset();
});

function makeContext(body: unknown, env: Record<string, string> = {}) {
  return {
    request: new Request('http://x/api/subscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
    locals: {
      runtime: {
        env: {
          SENDGRID_API_KEY: 'SG.key',
          SENDGRID_LIST_ID: 'list_123',
          ...env,
        },
      },
    },
  } as unknown as Parameters<typeof POST>[0];
}

describe('POST /api/subscribe', () => {
  it('returns 200 + ok:true when subscribe succeeds', async () => {
    subscribeMock.mockResolvedValue({ ok: true });
    const res = await POST(makeContext({ email: 'a@b.com' }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(subscribeMock).toHaveBeenCalledWith({
      email: 'a@b.com',
      apiKey: 'SG.key',
      listId: 'list_123',
    });
  });

  it('returns 400 on invalid email', async () => {
    subscribeMock.mockResolvedValue({ ok: false, error: 'invalid_email' });
    const res = await POST(makeContext({ email: 'bad' }));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      ok: false,
      error: 'invalid_email',
    });
  });

  it('returns 502 on provider error', async () => {
    subscribeMock.mockResolvedValue({ ok: false, error: 'provider_error' });
    const res = await POST(makeContext({ email: 'a@b.com' }));
    expect(res.status).toBe(502);
  });

  it('returns 500 when env is missing the API key', async () => {
    const res = await POST(
      makeContext({ email: 'a@b.com' }, { SENDGRID_API_KEY: '' }),
    );
    expect(res.status).toBe(500);
  });
});
