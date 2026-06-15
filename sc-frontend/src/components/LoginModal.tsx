"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/contexts/LanguageContext";

type AuthTab = "login" | "register";

export default function LoginModal() {
  const { isAuthModalOpen, closeAuthModal } = useAuthModal();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const router = useRouter();

  // 弹窗关闭时重置表单
  useEffect(() => {
    if (!isAuthModalOpen) {
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setActiveTab("login");
    }
  }, [isAuthModalOpen]);

  // ESC 键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 注册时验证两次密码
      if (activeTab === "register" && password !== confirmPassword) {
        showToast(t("loginModal.passwordsDoNotMatch"), "error");
        setIsLoading(false);
        return;
      }

      if (activeTab === "login") {
        await login(username, password);
        showToast(t("loginModal.loginSuccess"), "success");
      } else {
        await register(username, email, password);
        showToast(t("loginModal.registerSuccess"), "success");
      }
      closeAuthModal();
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("loginModal.operationFailed"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩 - 白色半透明 */}
      <div
        className="absolute inset-0 bg-white/60 backdrop-blur-sm"
        onClick={closeAuthModal}
      />

      {/* 弹窗内容 */}
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        {/* 标题 */}
        <h2 className="mb-6 text-center text-2xl font-semibold text-neutral-900">
          {activeTab === "login" ? t("loginModal.login") : t("loginModal.register")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-neutral-700">
              {t("loginModal.username")}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
              placeholder={t("loginModal.enterUsername")}
              required
            />
          </div>

          {activeTab === "register" && (
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-700">
                {t("loginModal.email")}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                placeholder={t("loginModal.enterEmail")}
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-neutral-700">
              {t("loginModal.password")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
              placeholder={t("loginModal.enterPassword")}
              required
            />
          </div>

          {activeTab === "register" && (
            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-neutral-700">
                {t("loginModal.confirmPassword")}
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                placeholder={t("loginModal.confirmPlaceholder")}
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-neutral-900 py-2.5 text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
          >
            {isLoading ? t("loginModal.loading") : activeTab === "login" ? t("loginModal.login") : t("loginModal.register")}
          </button>
        </form>

        {/* Tab 切换 */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm">
          <span className="text-neutral-500">
            {activeTab === "login" ? t("loginModal.noAccount") : t("loginModal.hasAccount")}
          </span>
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "login" ? "register" : "login")}
            className="font-medium text-neutral-900 underline underline-offset-2 hover:text-neutral-600"
          >
            {activeTab === "login" ? t("loginModal.register") : t("loginModal.login")}
          </button>
        </div>

        {/* 关闭按钮 */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
