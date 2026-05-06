export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

const AUTH_USER_KEY = 'telepathie_user';

export const getAuthUser = (): AuthUser | null => {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
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
