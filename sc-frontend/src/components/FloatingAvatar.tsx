"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useRef, useEffect } from "react";

export default function FloatingAvatar() {
  const { user, logout } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { language, toggleLanguage, t } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击其他区域关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // 阻止默认右键菜单
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMenu(!showMenu);
  };

  const avatarClass = "flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 shadow-lg transition-transform hover:scale-105";

  if (!user) {
    return (
      <button
        onClick={openAuthModal}
        className="fixed bottom-6 left-6 z-50 animate-breathe cursor-pointer"
      >
        <div className={avatarClass}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6 text-neutral-500">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-breathe cursor-pointer" ref={menuRef}>
      <Link
        href="/profile"
        onContextMenu={handleContextMenu}
        className="block"
      >
        <div className={avatarClass}>
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span className="text-lg font-medium text-neutral-600">
              {user.username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </Link>

      {/* 右键菜单 */}
      {showMenu && (
        <div className="absolute bottom-full left-0 mb-2 min-w-[120px] rounded-lg border border-neutral-200 bg-white py-2 shadow-lg">
          <div className="border-b border-neutral-100 px-4 pb-2">
            <p className="font-medium text-neutral-900">{user.username}</p>
            <p className="text-xs text-neutral-500">{user.role}</p>
          </div>
          {/* 语言切换按钮 */}
          <button
            onClick={toggleLanguage}
            className="w-full px-4 py-2 text-left text-sm text-neutral-600 hover:bg-neutral-50"
          >
            {language === "en" ? (
              <><span className="text-neutral-900">EN</span>/中</>
            ) : (
              <><span className="text-neutral-900">中</span>/EN</>
            )}
          </button>
          <div className="border-t border-neutral-100" />
          {user.role === "admin" && (
            <Link
              href="/admin/config"
              className="block px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
            >
              {t("floatingAvatar.settings")}
            </Link>
          )}
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
          >
            {t("floatingAvatar.profile")}
          </Link>
          <button
            onClick={logout}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-neutral-50"
          >
            {t("floatingAvatar.logout")}
          </button>
        </div>
      )}
    </div>
  );
}
