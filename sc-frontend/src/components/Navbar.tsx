"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Wenmudong", href: "/" },
  { label: "Blogs", href: "/blogs" },
  { label: "Projects", href: "/projects" },
  { label: "Hobbies", href: "/hobbies" },
  { label: "Tools", href: "/tools" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, transform: "" });
  const [isVisible, setIsVisible] = useState(false);
  const [navbarStyle, setNavbarStyle] = useState("blur");
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // 根据当前路径找到 activeIndex
  const activeIndex = navItems.findIndex((item) => item.href === pathname);

  useEffect(() => {
    // 延迟触发动画，让页面内容先渲染
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 80);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // 初始化：优先从 DOM 读取，或从 localStorage 读取，最后用默认值
    const domStyle = document.documentElement.getAttribute("data-navbar-style");
    if (domStyle) {
      setNavbarStyle(domStyle);
    } else {
      try {
        const stored = localStorage.getItem("system_configs");
        if (stored) {
          const configs = JSON.parse(stored);
          if (configs.navbar_style) {
            setNavbarStyle(configs.navbar_style);
          }
        }
      } catch {
        // ignore
      }
    }
  }, []);

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

  // 根据 navbar_style 动态设置样式
  const getNavbarBgClass = () => {
    switch (navbarStyle) {
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
    <nav className={`sticky top-0 z-10 isolate flex items-center justify-center py-4 px-1 md:justify-between ${isVisible ? "animate-slide-down" : "opacity-0"}`}>
      {/* 左侧胶囊容器 */}
      <div className={`pointer-events-auto relative flex rounded-lg border border-neutral-200 p-1 shadow-md ${getNavbarBgClass()}`}>
        {/* 滑动指示器 */}
        <div
          className="absolute left-0 -z-10 h-7 rounded bg-neutral-200 backdrop-blur transition-[width,transform] duration-150"
          style={{ width: indicatorStyle.width, transform: indicatorStyle.transform }}
        />
        {navItems.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            ref={(el) => { itemRefs.current[index] = el; }}
            className={`rounded py-1 px-2 text-sm tracking-tight transition-colors focus-visible:ring-4 focus-visible:ring-blue-200 ${
              index === activeIndex ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-900"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* 右侧链接 */}
      <div className="hidden md:flex pointer-events-auto">
        <a
          href="https://github.com/wenmudong"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded py-1 px-2 text-sm tracking-tight text-neutral-400 decoration-wavy underline-offset-4 focus-visible:ring-4 focus-visible:ring-blue-200 focus:text-neutral-900 cursor-alias transition-colors hover:text-neutral-900 hover:underline"
        >
          Github
        </a>
      </div>
    </nav>
  );
}
