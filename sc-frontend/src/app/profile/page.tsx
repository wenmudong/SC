"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useLanguage } from "@/contexts/LanguageContext";
import PageHeader from "@/components/PageHeader";
import { uploadApi, userApi } from "@/services/api";
import { useToast } from "@/components/Toast";

export default function ProfilePage() {
  const { user, token, isLoading, updateUser, logout } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isLoggingOut = useRef(false);

  useEffect(() => {
    if (!isLoading && !user && !isLoggingOut.current) {
      router.push("/");
      openAuthModal();
    }
    if (user) {
      setEmail(user.email);
    }
  }, [user, isLoading, router, openAuthModal]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showPasswordModal) {
        setShowPasswordModal(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showPasswordModal]);

  const handleLogout = () => {
    isLoggingOut.current = true;
    logout();
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setIsUploadingAvatar(true);
    try {
      const result = await uploadApi.uploadAvatar(token, file);
      await updateUser({ avatar_url: result.url });
      setMessageType("success");
      setMessage(t("profile.avatarUpdated"));
    } catch (err) {
      setMessageType("error");
      setMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploadingAvatar(false);
      // 清空 input 以允许重复选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSaving(true);
    setMessage("");

    try {
      await updateUser({ email });
      setMessageType("success");
      setMessage(t("profile.profileUpdated"));
    } catch (err) {
      setMessageType("error");
      setMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (newPassword !== confirmNewPassword) {
      showToast(t("profile.passwordsDoNotMatch"), "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast(t("profile.passwordTooShort"), "error");
      return;
    }

    setIsChangingPassword(true);
    try {
      await userApi.changePassword(token, oldPassword, newPassword);
      showToast(t("profile.changePasswordSuccess"), "success");
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("profile.changePasswordFailed"), "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-neutral-500">{t("profile.loading")}</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        // title="profile."
        description={t("profile.manageAccount")}
      />

      <div className="mx-auto max-w-lg">
        <div className="rounded-lg border border-neutral-200 bg-white/70 p-6 shadow-md backdrop-blur-md">
          {/* Avatar */}
          <div className="mb-6 flex flex-col items-center">
            <button
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              className="group relative flex h-24 w-24 items-center justify-center rounded-full bg-neutral-200 transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploadingAvatar ? (
                <span className="text-sm text-neutral-500">{t("profile.uploading")}</span>
              ) : user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="text-3xl font-medium text-neutral-600">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              )}
              {/* 悬停上传图标 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-8 w-8 text-white">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-3a1 1 0 10-2 0v3H5a1 1 0 01-1-1V7a1 1 0 012 0v2h9v3a1 1 0 11-2 0v-3h2a2 2 0 002-2V7a2 2 0 00-2-2H4z" clipRule="evenodd" />
                </svg>
                <span className="mt-1 text-xs text-white">{t("profile.change")}</span>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* User Info */}
          <div className="mb-2 rounded bg-neutral-50 p-4">
            <div className="flex justify-between">
              <span className="text-sm text-neutral-500">{t("profile.username")}</span>
              <span className="font-medium">{user.username}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-sm text-neutral-500">{t("profile.role")}</span>
              <span className="rounded px-2 py-0.5 text-sm font-medium bg-neutral-200">
                {user.role}
              </span>
            </div>
          </div>
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              {t("profile.changePassword")}
            </button>
          </div>

          {/* Update Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <div className={`rounded p-3 text-sm ${messageType === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                {message}
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1 block text-sm text-neutral-600">
                {t("profile.email")}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border border-neutral-300 px-3 py-2 font-sans focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded bg-neutral-900 py-2 font-sans text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
            >
              {isSaving ? t("profile.saving") : t("profile.updateProfile")}
            </button>
          </form>

          <div className="mt-6 border-t border-neutral-200 pt-6">
            <button
              onClick={handleLogout}
              className="w-full rounded bg-red-50 py-2 font-sans text-sm text-red-600 transition-colors hover:bg-red-100"
            >
              {t("profile.logout")}
            </button>
          </div>
        </div>
      </div>

      {/* 修改密码弹窗 */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-white/60 backdrop-blur-sm"
            onClick={() => setShowPasswordModal(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
            <h2 className="mb-6 text-center text-2xl font-semibold text-neutral-900">
              {t("profile.changePassword")}
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <label htmlFor="oldPassword" className="mb-1.5 block text-sm font-medium text-neutral-700">
                  {t("profile.oldPassword")}
                </label>
                <input
                  id="oldPassword"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                  required
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-neutral-700">
                  {t("profile.newPassword")}
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmNewPassword" className="mb-1.5 block text-sm font-medium text-neutral-700">
                  {t("profile.confirmNewPassword")}
                </label>
                <input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full rounded-lg bg-neutral-900 py-2.5 text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
              >
                {isChangingPassword ? t("profile.saving") : t("profile.changePassword")}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
