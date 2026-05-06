export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'patient' | 'practitioner';
  createdAt: string;
}

const AUTH_USER_KEY = 'telepathie_user';
export const AUTH_CHANGED_EVENT = 'auth-changed';

export const getAuthUser = (): AuthUser | null => {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    const normalizedId =
      typeof parsed.id === 'number'
        ? parsed.id
        : typeof parsed.id === 'string'
          ? Number(parsed.id)
          : NaN;

    if (
      !Number.isFinite(normalizedId) ||
      typeof parsed.firstName !== 'string' ||
      typeof parsed.lastName !== 'string' ||
      typeof parsed.email !== 'string' ||
      typeof parsed.createdAt !== 'string'
    ) {
      localStorage.removeItem(AUTH_USER_KEY);
      return null;
    }

    return {
      id: normalizedId,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email,
      role: parsed.role === 'practitioner' ? 'practitioner' : 'patient',
      createdAt: parsed.createdAt,
    };
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
};

export const setAuthUser = (user: AuthUser): void => {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

export const clearAuthUser = (): void => {
  localStorage.removeItem(AUTH_USER_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};
