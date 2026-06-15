"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSystemConfig } from "@/contexts/SystemConfigContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useLanguage } from "@/contexts/LanguageContext";

const DEFAULT_NAVBAR_CONFIG = {
  style: "blur",
  nav_items: [
    { label: "Wenmudong", label_zh: "Wenmudong", href: "/", visible: true },
    { label: "Blogs", label_zh: "博客", href: "/blogs", visible: true },
    { label: "Projects", label_zh: "项目", href: "/projects", visible: true },
    { label: "Hobbies", label_zh: "爱好", href: "/hobbies", visible: true },
    { label: "Tools", label_zh: "工具", href: "/tools", visible: true },
  ],
  right_links: [
    { label: "Github", href: "https://github.com/wenmudong", visible: true },
  ],
};

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { configs } = useSystemConfig();
  const { language } = useLanguage();
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, transform: "" });
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // 从配置读取导航栏配置
  const navbarConfig = (() => {
    try {
      const stored = configs.get("navbar_config");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return DEFAULT_NAVBAR_CONFIG;
  })();

  const navStyle = navbarConfig.style || DEFAULT_NAVBAR_CONFIG.style;
  const navItems = (navbarConfig.nav_items || DEFAULT_NAVBAR_CONFIG.nav_items).filter((item: { visible?: boolean }) => item.visible !== false);
  const rightLinks = (navbarConfig.right_links || DEFAULT_NAVBAR_CONFIG.right_links).filter((link: { visible?: boolean }) => link.visible !== false);

  // 根据当前路径找到 activeIndex
  const activeIndex = navItems.findIndex((item: { href: string }) => item.href === pathname);

  useEffect(() => {
    // 等待字体加载完成后再计算指示器位置
    document.fonts.ready.then(() => {
      const activeItem = itemRefs.current[activeIndex];
      if (activeItem) {
        setIndicatorStyle({
          width: activeItem.offsetWidth,
          transform: `translate(${activeItem.offsetLeft}px)`,
        });
      }
    });
  }, [activeIndex]);

  // 根据导航栏样式返回背景类
  const getNavbarBgClass = () => {
    switch (navStyle) {
      case "solid":
        return "bg-neutral-50/90";
      case "transparent":
        return "bg-transparent";
      case "blur":
      default:
        return "bg-neutral-50/70 backdrop-blur-sm";
    }
  };

  return (
    <nav className={`sticky top-0 z-10 isolate flex items-center justify-center py-4 px-1 md:justify-between animate-slide-down`}>
      {/* 左侧胶囊容器 */}
      <div className={`pointer-events-auto relative flex rounded-lg border border-neutral-200 p-1 shadow-md ${getNavbarBgClass()}`}>
        {/* 滑动指示器 */}
        <div
          className="absolute left-0 -z-10 h-7 rounded bg-neutral-200 backdrop-blur transition-[width,transform] duration-150"
          style={{ width: indicatorStyle.width, transform: indicatorStyle.transform }}
        />
        {navItems.map((item: { label: string; label_zh?: string; href: string; visible?: boolean }, index: number) => (
          <Link
            key={item.href}
            href={item.href}
            ref={(el) => { itemRefs.current[index] = el; }}
            onClick={(e) => {
              // 未登录且不是首页，点击弹出登录弹窗
              if (!user && item.href !== "/") {
                e.preventDefault();
                openAuthModal();
              }
            }}
            className={`rounded py-1 px-2 text-sm tracking-tight transition-colors focus-visible:ring-4 focus-visible:ring-blue-200 ${
              index === activeIndex ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-900"
            }`}
          >
            {language === "zh" && item.label_zh ? item.label_zh : item.label}
          </Link>
        ))}
      </div>

      {/* 右侧链接 */}
      <div className="hidden md:flex pointer-events-auto gap-2">
        {rightLinks.map((link: { label: string; href: string; visible?: boolean }, index: number) => (
          <a
            key={index}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded py-1 px-2 text-sm tracking-tight text-neutral-400 decoration-wavy underline-offset-4 focus-visible:ring-4 focus-visible:ring-blue-200 focus:text-neutral-900 cursor-alias transition-colors hover:text-neutral-900 hover:underline"
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
