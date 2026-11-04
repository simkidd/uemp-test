"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { authApi } from "@/lib/api/auth.api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { clearAuth } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const openLogoutModal = () => setIsOpen(true);
  const closeLogoutModal = () => {
    if (!isLoggingOut) {
      setIsOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      try {
        await authApi.logout();
      } catch {
        // Proceed with client cleanup even if network request fails
      }
      clearAuth();
      queryClient.clear();
      toast.success("Signed out successfully", {
        description: "Your session has been terminated securely.",
      });
      setIsOpen(false);
      router.replace("/auth/login");
    } catch {
      clearAuth();
      router.replace("/auth/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return {
    isOpen,
    openLogoutModal,
    closeLogoutModal,
    isLoggingOut,
    handleLogout,
  };
}
