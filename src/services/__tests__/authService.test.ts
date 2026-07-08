import {
  AuthService,
  AuthError,
  CryptoAdapter,
  KVStore,
  isValidEmail,
  passwordProblem,
  normalizeEmail,
  safeEqual,
  hashPassword,
} from '../authService';

// Deterministic fake crypto: hash is a reversible-ish transform, randomHex is
// a counter so results are stable across a test run.
function makeCrypto(): CryptoAdapter {
  let counter = 0;
  return {
    randomHex: async (bytes: number) => `rand${bytes}_${counter++}`,
    hash: async (input: string) => `#${input.length}:${input.split('').reduce((a, c) => (a + c.charCodeAt(0)) % 100000, 0)}`,
  };
}

function makeStore(): KVStore {
  const map = new Map<string, string>();
  return {
    getItem: async (k) => (map.has(k) ? map.get(k)! : null),
    setItem: async (k, v) => void map.set(k, v),
    removeItem: async (k) => void map.delete(k),
  };
}

describe('auth validation helpers', () => {
  it('validates emails', () => {
    expect(isValidEmail('a@b.com')).toBe(true);
    expect(isValidEmail('nope')).toBe(false);
    expect(isValidEmail('a@b')).toBe(false);
  });
  it('normalizes emails', () => {
    expect(normalizeEmail('  A@B.COM ')).toBe('a@b.com');
  });
  it('enforces password length', () => {
    expect(passwordProblem('short')).toBeTruthy();
    expect(passwordProblem('longenough')).toBeNull();
  });
  it('safeEqual works', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'ab')).toBe(false);
  });
  it('hashPassword is deterministic for same salt+password', async () => {
    const c = makeCrypto();
    const a = await hashPassword(c, 'secret12', 'salt', 5);
    const b = await hashPassword(c, 'secret12', 'salt', 5);
    expect(a).toBe(b);
  });
});

describe('AuthService', () => {
  it('registers and starts a session', async () => {
    const svc = new AuthService(makeCrypto(), makeStore());
    const session = await svc.register('Jane Doe', 'Jane@Example.com', 'password1');
    expect(session.user.name).toBe('Jane Doe');
    expect(session.user.email).toBe('jane@example.com');
    expect(session.token).toBeTruthy();
    expect(await svc.hasAccount()).toBe(true);
  });

  it('rejects weak/invalid registration', async () => {
    const svc = new AuthService(makeCrypto(), makeStore());
    await expect(svc.register('', 'a@b.com', 'password1')).rejects.toBeInstanceOf(AuthError);
    await expect(svc.register('X', 'bad-email', 'password1')).rejects.toBeInstanceOf(AuthError);
    await expect(svc.register('X', 'a@b.com', 'short')).rejects.toBeInstanceOf(AuthError);
  });

  it('logs in with correct password', async () => {
    const store = makeStore();
    const svc = new AuthService(makeCrypto(), store);
    await svc.register('Jane', 'jane@example.com', 'password1');
    await svc.logout();
    const session = await svc.login('JANE@example.com', 'password1');
    expect(session.user.email).toBe('jane@example.com');
  });

  it('rejects wrong password', async () => {
    const svc = new AuthService(makeCrypto(), makeStore());
    await svc.register('Jane', 'jane@example.com', 'password1');
    await expect(svc.login('jane@example.com', 'wrongpass1')).rejects.toMatchObject({
      code: 'BAD_CREDENTIALS',
    });
  });

  it('rejects unknown account', async () => {
    const svc = new AuthService(makeCrypto(), makeStore());
    await expect(svc.login('nobody@example.com', 'password1')).rejects.toMatchObject({
      code: 'NO_ACCOUNT',
    });
  });

  it('resetAccount removes the account and session', async () => {
    const svc = new AuthService(makeCrypto(), makeStore());
    await svc.register('Jane', 'jane@example.com', 'password1');
    await svc.resetAccount();
    expect(await svc.hasAccount()).toBe(false);
    expect(await svc.restoreSession()).toBeNull();
  });

  it('restores and clears sessions', async () => {
    const store = makeStore();
    const svc = new AuthService(makeCrypto(), store);
    await svc.register('Jane', 'jane@example.com', 'password1');
    expect(await svc.restoreSession()).not.toBeNull();
    await svc.logout();
    expect(await svc.restoreSession()).toBeNull();
    // Account persists after logout
    expect(await svc.hasAccount()).toBe(true);
  });
});
