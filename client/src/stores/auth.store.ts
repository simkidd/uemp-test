"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import { COOKIE_KEYS } from "@/constants/cookies.constants";
import { IUser, IAuthTokens, UserRole } from "@/interfaces";

interface AuthState {
  user: IUser | null;
  tokens: IAuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setAuth: (user: IUser, tokens: IAuthTokens) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<IUser>) => void;
  clearError: () => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setAuth: (user: IUser, tokens: IAuthTokens) => {
        Cookies.set(COOKIE_KEYS.AUTH_TOKEN, tokens.accessToken, {
          expires: 7,
          sameSite: "lax",
        });
        if (tokens.refreshToken) {
          Cookies.set(COOKIE_KEYS.REFRESH_TOKEN, tokens.refreshToken, {
            expires: 30,
            sameSite: "lax",
          });
        }
        if (user) {
          Cookies.set(COOKIE_KEYS.USER, JSON.stringify(user), {
            expires: 7,
            sameSite: "lax",
          });
        }

        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      clearAuth: () => {
        Cookies.remove(COOKIE_KEYS.AUTH_TOKEN);
        Cookies.remove(COOKIE_KEYS.REFRESH_TOKEN);
        Cookies.remove(COOKIE_KEYS.USER);

        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      updateUser: (partialUser: Partial<IUser>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updated = { ...currentUser, ...partialUser };
          set({ user: updated });
          Cookies.set(COOKIE_KEYS.USER, JSON.stringify(updated), {
            expires: 7,
            sameSite: "lax",
          });
        }
      },

      clearError: () => set({ error: null }),

      hasRole: (roles: UserRole | UserRole[]) => {
        const { user } = get();
        if (!user) return false;
        if (Array.isArray(roles)) {
          return roles.includes(user.role);
        }
        return user.role === roles;
      },
    }),
    {
      name: "uemp_auth_storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
