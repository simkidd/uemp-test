import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import { IUser } from "@/interfaces";

export const USER_QUERY_KEYS = {
  all: ["user"] as const,
  currentUser: () => [...USER_QUERY_KEYS.all, "currentUser"] as const,
};

/**
 * Hook to fetch the currently authenticated user from /api/v1/auth/me.
 * Runs whenever the client is authenticated, maintaining fresh session & profile state.
 */
export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: USER_QUERY_KEYS.currentUser(),
    queryFn: () => authApi.getCurrentUser(),
    enabled: Boolean(isAuthenticated),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook to update user profile details (avatar, phone, personal details).
 * Automatically updates Zustand and invalidates the currentUser query.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (data: FormData | Partial<IUser>) => authApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      if (updatedUser) {
        updateUser(updatedUser);
        queryClient.setQueryData(USER_QUERY_KEYS.currentUser(), updatedUser);
        queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
      }
    },
  });
}

/**
 * Hook to securely change the current user's password.
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (passwords: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(passwords),
  });
}
