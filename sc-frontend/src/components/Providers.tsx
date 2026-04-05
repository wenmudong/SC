"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/Toast";
import { SystemConfigProvider } from "@/contexts/SystemConfigContext";
import { AuthModalProvider } from "@/hooks/useAuthModal";
import LoginModal from "@/components/LoginModal";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SystemConfigProvider>
        <ToastProvider>
          <AuthModalProvider>
            {children}
            <LoginModal />
          </AuthModalProvider>
        </ToastProvider>
      </SystemConfigProvider>
    </AuthProvider>
  );
}
