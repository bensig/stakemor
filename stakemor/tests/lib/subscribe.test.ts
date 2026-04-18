import { describe, it, expect, vi, beforeEach } from 'vitest';
import { subscribe } from '../../src/lib/subscribe';

const mockCreate = vi.fn();

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(function () {
    return { contacts: { create: mockCreate } };
  }),
}));

beforeEach(() => {
  mockCreate.mockReset();
});

describe('subscribe', () => {
  it('creates a contact in the configured Resend audience', async () => {
    mockCreate.mockResolvedValue({ data: { id: 'c_1' }, error: null });

    const result = await subscribe({
      email: 'a@b.com',
      path: 'long',
      apiKey: 'key',
      audienceId: 'aud',
    });

    expect(result).toEqual({ ok: true });
    expect(mockCreate).toHaveBeenCalledWith({
      email: 'a@b.com',
      audienceId: 'aud',
      unsubscribed: false,
      firstName: undefined,
      lastName: undefined,
    });
  });

  it('rejects an invalid email', async () => {
    const result = await subscribe({
      email: 'not-an-email',
      path: 'long',
      apiKey: 'key',
      audienceId: 'aud',
    });
    expect(result).toEqual({ ok: false, error: 'invalid_email' });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns an error when Resend fails', async () => {
    mockCreate.mockResolvedValue({ data: null, error: { message: 'boom' } });

    const result = await subscribe({
      email: 'a@b.com',
      path: 'short',
      apiKey: 'key',
      audienceId: 'aud',
    });
    expect(result).toEqual({ ok: false, error: 'provider_error' });
  });
});
