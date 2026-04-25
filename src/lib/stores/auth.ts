import { browser } from "$app/environment";
import { writable } from "svelte/store";

const AUTH_STORAGE_KEY = "auth_session_v1";

export type AuthUser = {
  id: string;
  username: string;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
};

const readStoredAuthState = (): AuthState => {
  if (!browser) {
    return { token: null, user: null };
  }

  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return { token: null, user: null };
    }
    const parsed = JSON.parse(raw) as Partial<AuthState>;
    return {
      token: typeof parsed.token === "string" && parsed.token.trim() ? parsed.token : null,
      user:
        parsed.user && typeof parsed.user === "object"
          ? {
              id: String((parsed.user as Partial<AuthUser>).id ?? ""),
              username: String((parsed.user as Partial<AuthUser>).username ?? "")
            }
          : null
    };
  } catch {
    return { token: null, user: null };
  }
};

const writeStoredAuthState = (state: AuthState): void => {
  if (!browser) {
    return;
  }
  if (!state.token) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
};

const initialState = readStoredAuthState();
const { subscribe, set, update } = writable<AuthState>(initialState);

export const authStore = {
  subscribe,
  login: (token: string, user: AuthUser): void => {
    const nextState: AuthState = {
      token: token.trim(),
      user
    };
    set(nextState);
    writeStoredAuthState(nextState);
  },
  logout: (): void => {
    const clearedState: AuthState = { token: null, user: null };
    set(clearedState);
    writeStoredAuthState(clearedState);
  },
  getToken: (): string | null => {
    return readStoredAuthState().token;
  },
  getCurrentUser: (): AuthUser | null => {
    return readStoredAuthState().user;
  },
  isAuthenticated: (): boolean => {
    return !!readStoredAuthState().token;
  },
  hydrateFromStorage: (): void => {
    update(() => readStoredAuthState());
  }
};
