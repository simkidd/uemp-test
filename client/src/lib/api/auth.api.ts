import api from "@/lib/api";
import { ILoginResponseData, IUser } from "@/interfaces";

export const authApi = {
  login: async (credentials: { identifier: string; password: string }) => {
    const res = await api.post("/auth/login", credentials);
    return res.data?.data as ILoginResponseData;
  },

  getCurrentUser: async (): Promise<IUser> => {
    const res = await api.get("/auth/me");
    return res.data?.data;
  },

  refreshToken: async (refreshToken: string) => {
    const res = await api.post("/auth/refresh", { refreshToken });
    return res.data?.data;
  },

  logout: async () => {
    const res = await api.post("/auth/logout");
    return res.data;
  },

  updateProfile: async (data: FormData | Partial<IUser>): Promise<IUser> => {
    const res = await api.patch("/auth/profile", data, {
      headers:
        data instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : undefined,
    });
    return res.data?.data;
  },

  changePassword: async (passwords: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const res = await api.post("/auth/change-password", passwords);
    return res.data;
  },
};
