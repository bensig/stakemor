import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { subscribe } from '../../src/lib/subscribe';

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('subscribe', () => {
  it('PUTs the contact to SendGrid Marketing Contacts API', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 202 }));

    const result = await subscribe({
      email: 'a@b.com',
      apiKey: 'SG.test',
      listId: 'list_123',
    });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.sendgrid.com/v3/marketing/contacts');
    expect(init.method).toBe('PUT');
    expect(init.headers.Authorization).toBe('Bearer SG.test');
    expect(JSON.parse(init.body)).toEqual({
      list_ids: ['list_123'],
      contacts: [{ email: 'a@b.com' }],
    });
  });

  it('rejects an invalid email', async () => {
    const result = await subscribe({
      email: 'not-an-email',
      apiKey: 'SG.test',
      listId: 'list_123',
    });
    expect(result).toEqual({ ok: false, error: 'invalid_email' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns provider_error on non-OK response', async () => {
    fetchMock.mockResolvedValue(new Response('error', { status: 500 }));

    const result = await subscribe({
      email: 'a@b.com',
      apiKey: 'SG.test',
      listId: 'list_123',
    });
    expect(result).toEqual({ ok: false, error: 'provider_error' });
  });

  it('returns provider_error when fetch throws', async () => {
    fetchMock.mockRejectedValue(new Error('network timeout'));

    const result = await subscribe({
      email: 'a@b.com',
      apiKey: 'SG.test',
      listId: 'list_123',
    });
    expect(result).toEqual({ ok: false, error: 'provider_error' });
  });
});
