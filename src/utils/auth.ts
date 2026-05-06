export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'patient' | 'practitioner';
  createdAt: string;
}

const AUTH_USER_KEY = 'telepathie_user';

export const getAuthUser = (): AuthUser | null => {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser>;

    if (
      typeof parsed.id !== 'number' ||
      typeof parsed.firstName !== 'string' ||
      typeof parsed.lastName !== 'string' ||
      typeof parsed.email !== 'string' ||
      typeof parsed.createdAt !== 'string'
    ) {
      localStorage.removeItem(AUTH_USER_KEY);
      return null;
    }

    return {
      id: parsed.id,
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
};

export const clearAuthUser = (): void => {
  localStorage.removeItem(AUTH_USER_KEY);
};
