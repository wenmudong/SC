"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModal } from "@/hooks/useAuthModal";

/**
 * 页面级登录守卫
 * 未登录时自动弹出登录弹窗，返回是否应该显示页面内容
 */
export function useAuthGuard(): { isReady: boolean } {
  const { user, isLoading } = useAuth();
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    if (!isLoading && !user) {
      openAuthModal();
    }
  }, [isLoading, user, openAuthModal]);

  return { isReady: !isLoading && !!user };
}
