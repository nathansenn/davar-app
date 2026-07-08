/**
 * Auth Service (offline-first, local credentials)
 *
 * Replaces the previous fake auth where any email/password "succeeded". Stores
 * a salted, iterated password hash in the device secure store and verifies it
 * on login. Crypto and storage are injected so the core logic is unit-testable
 * without native modules.
 *
 * Note: this is genuine local authentication that works fully offline. Syncing
 * accounts to the (separate) server backend is a future integration; the client
 * keeps a local session token here.
 */

export interface StoredUser {
  id: string;
  name: string;
  email: string;
}

export interface Account extends StoredUser {
  salt: string;
  hash: string;
  createdAt: number;
}

export interface Session {
  user: StoredUser;
  token: string;
}

export interface CryptoAdapter {
  /** Random hex string of `bytes` bytes. */
  randomHex(bytes: number): Promise<string>;
  /** Hash an input string (hex digest). */
  hash(input: string): Promise<string>;
}

export interface KVStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export const ACCOUNT_KEY = 'davar_account';
export const SESSION_KEY = 'davar_session';
export const HASH_ITERATIONS = 120;

export class AuthError extends Error {
  code: 'INVALID_INPUT' | 'NO_ACCOUNT' | 'BAD_CREDENTIALS' | 'ACCOUNT_EXISTS';
  constructor(code: AuthError['code'], message: string) {
    super(message);
    this.code = code;
    this.name = 'AuthError';
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function passwordProblem(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters';
  return null;
}

export async function hashPassword(
  crypto: CryptoAdapter,
  password: string,
  salt: string,
  iterations: number = HASH_ITERATIONS
): Promise<string> {
  let acc = `${salt}:${password}`;
  for (let i = 0; i < iterations; i++) {
    acc = await crypto.hash(acc);
  }
  return acc;
}

/** Constant-time-ish string compare to avoid trivial timing leaks. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export class AuthService {
  constructor(private crypto: CryptoAdapter, private store: KVStore) {}

  private async readAccount(): Promise<Account | null> {
    const raw = await this.store.getItem(ACCOUNT_KEY);
    return raw ? (JSON.parse(raw) as Account) : null;
  }

  async register(name: string, email: string, password: string): Promise<Session> {
    const cleanName = name.trim();
    const cleanEmail = normalizeEmail(email);
    if (!cleanName) throw new AuthError('INVALID_INPUT', 'Please enter your name');
    if (!isValidEmail(cleanEmail)) throw new AuthError('INVALID_INPUT', 'Please enter a valid email');
    const pwProblem = passwordProblem(password);
    if (pwProblem) throw new AuthError('INVALID_INPUT', pwProblem);

    const salt = await this.crypto.randomHex(16);
    const hash = await hashPassword(this.crypto, password, salt);
    const account: Account = {
      id: await this.crypto.randomHex(12),
      name: cleanName,
      email: cleanEmail,
      salt,
      hash,
      createdAt: Date.now(),
    };
    await this.store.setItem(ACCOUNT_KEY, JSON.stringify(account));
    return this.startSession(account);
  }

  async login(email: string, password: string): Promise<Session> {
    const cleanEmail = normalizeEmail(email);
    const account = await this.readAccount();
    if (!account || account.email !== cleanEmail) {
      throw new AuthError('NO_ACCOUNT', 'No account found for that email');
    }
    const attempt = await hashPassword(this.crypto, password, account.salt);
    if (!safeEqual(attempt, account.hash)) {
      throw new AuthError('BAD_CREDENTIALS', 'Incorrect email or password');
    }
    return this.startSession(account);
  }

  private async startSession(account: Account): Promise<Session> {
    const session: Session = {
      user: { id: account.id, name: account.name, email: account.email },
      token: await this.crypto.randomHex(24),
    };
    await this.store.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  async restoreSession(): Promise<Session | null> {
    const raw = await this.store.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  }

  async logout(): Promise<void> {
    await this.store.removeItem(SESSION_KEY);
  }

  /**
   * Remove the local account and session entirely. Used by the "forgot
   * password" flow since, for a device-local account, there is no server to
   * email a reset link — the honest recovery is to re-register.
   */
  async resetAccount(): Promise<void> {
    await this.store.removeItem(SESSION_KEY);
    await this.store.removeItem(ACCOUNT_KEY);
  }

  /** Whether any account has been registered on this device. */
  async hasAccount(): Promise<boolean> {
    return (await this.readAccount()) !== null;
  }
}
