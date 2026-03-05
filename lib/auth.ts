export const AUTH_STORAGE_KEY = 'spring-memorial-auth';
export const LEGACY_USER_STORAGE_KEY = 'spring-memorial-user';

export type AuthUser = {
  identity: string;
  password: string;
};

export function readAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as AuthUser;
      if (parsed?.identity && parsed?.password) return parsed;
    } catch {
      // ignore malformed persisted value
    }
  }

  const legacy = localStorage.getItem(LEGACY_USER_STORAGE_KEY);
  if (legacy) {
    return { identity: legacy, password: '' };
  }

  return null;
}

export function writeAuthUser(user: AuthUser) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  localStorage.setItem(LEGACY_USER_STORAGE_KEY, user.identity);
}

export function clearAuthUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
}
