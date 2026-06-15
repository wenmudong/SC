"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types";
import { authApi, userApi } from "@/services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: { email?: string; avatar_url?: string; language?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "auth_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 初始化：检查 localStorage 中的 token
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (savedToken) {
      setToken(savedToken);
      authApi.getMe(savedToken)
        .then((user) => setUser(user))
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const response = await authApi.login(username, password);
    localStorage.setItem(TOKEN_KEY, response.access_token);
    setToken(response.access_token);

    const user = await authApi.getMe(response.access_token);
    setUser(user);
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const response = await authApi.register(username, email, password);
    localStorage.setItem(TOKEN_KEY, response.access_token);
    setToken(response.access_token);

    const user = await authApi.getMe(response.access_token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    router.push("/");
  }, [router]);

  const updateUser = useCallback(async (data: { email?: string; avatar_url?: string; language?: string }) => {
    if (!token) throw new Error("Not authenticated");
    const updated = await userApi.updateMe(token, data);
    setUser(updated);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
