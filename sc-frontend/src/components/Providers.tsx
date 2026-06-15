"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/Toast";
import { SystemConfigProvider } from "@/contexts/SystemConfigContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthModalProvider } from "@/hooks/useAuthModal";
import LoginModal from "@/components/LoginModal";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
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
    </LanguageProvider>
  );
}
