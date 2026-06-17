"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/Toast";
import { SystemConfigProvider } from "@/contexts/SystemConfigContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthModalProvider } from "@/hooks/useAuthModal";
import LoginModal from "@/components/LoginModal";

interface ProvidersProps {
  children: ReactNode;
  initialLanguage?: "en" | "zh";
}

export default function Providers({ children, initialLanguage }: ProvidersProps) {
  return (
    <AuthProvider>
      <LanguageProvider initialLanguage={initialLanguage}>
        <SystemConfigProvider>
          <ToastProvider>
            <AuthModalProvider>
              {children}
              <LoginModal />
            </AuthModalProvider>
          </ToastProvider>
        </SystemConfigProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
