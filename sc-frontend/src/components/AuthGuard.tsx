"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModal } from "@/hooks/useAuthModal";

/**
 * 页面级登录守卫包装组件
 * 未登录时自动弹出登录弹窗，不渲染子内容
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    if (!isLoading && !user) {
      openAuthModal();
    }
  }, [isLoading, user, openAuthModal]);

  if (isLoading) return null;
  if (!user) return null;

  return <>{children}</>;
}
