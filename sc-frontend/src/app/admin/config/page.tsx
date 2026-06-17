"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSystemConfig } from "@/contexts/SystemConfigContext";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import GradientText from "@/components/GradientText";

interface NavItem {
  label: string;
  label_zh?: string;
  href: string;
  visible: boolean;
}

interface RightLink {
  label: string;
  href: string;
  visible: boolean;
}

interface NavbarConfig {
  style: string;
  nav_items: NavItem[];
  right_links: RightLink[];
}

const DEFAULT_NAVBAR_CONFIG: NavbarConfig = {
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

export default function AdminConfigPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { configs, saveConfig, isLoading } = useSystemConfig();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);
  const [tempNavbarConfig, setTempNavbarConfig] = useState<NavbarConfig>(DEFAULT_NAVBAR_CONFIG);
  const [tempFont, setTempFont] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    } else if (!authLoading && user?.role !== "admin") {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // 初始化临时值
  useEffect(() => {
    const storedNavbarConfig = configs.get("navbar_config");
    if (storedNavbarConfig) {
      try {
        const parsed = JSON.parse(storedNavbarConfig);
        const configWithVisibility: NavbarConfig = {
          ...parsed,
          nav_items: parsed.nav_items.map((item: NavItem) => ({
            ...item,
            visible: item.visible !== undefined ? item.visible : true,
          })),
          right_links: parsed.right_links.map((link: RightLink) => ({
            ...link,
            visible: link.visible !== undefined ? link.visible : true,
          })),
        };
        setTempNavbarConfig(configWithVisibility);
      } catch {
        setTempNavbarConfig(DEFAULT_NAVBAR_CONFIG);
      }
    }

    const storedFont = configs.get("global_font");
    if (storedFont) {
      setTempFont(storedFont);
    }
  }, [configs]);

  // 检查是否至少有一个可见的导航项
  const hasVisibleNavItem = () => {
    return tempNavbarConfig.nav_items.some((item) => item.visible);
  };

  // 更新导航项
  const updateNavItem = (index: number, field: keyof NavItem, value: string | boolean) => {
    setTempNavbarConfig((prev) => {
      const newConfig = { ...prev };
      newConfig.nav_items = [...prev.nav_items];
      newConfig.nav_items[index] = { ...prev.nav_items[index], [field]: value };
      return newConfig;
    });
  };

  // 添加导航项
  const addNavItem = () => {
    setTempNavbarConfig((prev) => ({
      ...prev,
      nav_items: [...prev.nav_items, { label: "New", label_zh: "", href: "/", visible: true }],
    }));
  };

  // 删除导航项（至少保留一个）
  const removeNavItem = (index: number) => {
    if (tempNavbarConfig.nav_items.length <= 1) {
      showToast(t("admin.至少保留一个导航项"), "error");
      return;
    }
    setTempNavbarConfig((prev) => {
      const newConfig = { ...prev };
      newConfig.nav_items = prev.nav_items.filter((_, i) => i !== index);
      return newConfig;
    });
  };

  // 切换导航项显示/隐藏（至少保留一个可见）
  const toggleNavItemVisible = (index: number) => {
    const item = tempNavbarConfig.nav_items[index];
    if (item.visible && !hasVisibleNavItem()) {
      showToast(t("admin.至少保留一个可见的导航项"), "error");
      return;
    }
    updateNavItem(index, "visible", !item.visible);
  };

  // 拖拽导航项
  const handleNavItemDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleNavItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    setTempNavbarConfig((prev) => {
      const newConfig = { ...prev };
      const items = [...prev.nav_items];
      const draggedItem = items[draggedIndex];
      items.splice(draggedIndex, 1);
      items.splice(index, 0, draggedItem);
      newConfig.nav_items = items;
      return newConfig;
    });
    setDraggedIndex(index);
  };

  const handleNavItemDragEnd = () => {
    setDraggedIndex(null);
  };

  // 更新右侧链接
  const updateRightLink = (index: number, field: keyof RightLink, value: string | boolean) => {
    setTempNavbarConfig((prev) => {
      const newConfig = { ...prev };
      newConfig.right_links = [...prev.right_links];
      newConfig.right_links[index] = { ...prev.right_links[index], [field]: value };
      return newConfig;
    });
  };

  // 添加右侧链接
  const addRightLink = () => {
    setTempNavbarConfig((prev) => ({
      ...prev,
      right_links: [...prev.right_links, { label: "New", href: "https://", visible: true }],
    }));
  };

  // 删除右侧链接
  const removeRightLink = (index: number) => {
    setTempNavbarConfig((prev) => {
      const newConfig = { ...prev };
      newConfig.right_links = prev.right_links.filter((_, i) => i !== index);
      return newConfig;
    });
  };

  // 切换右侧链接显示/隐藏
  const toggleRightLinkVisible = (index: number) => {
    const link = tempNavbarConfig.right_links[index];
    updateRightLink(index, "visible", !link.visible);
  };

  // 拖拽右侧链接
  const handleRightLinkDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleRightLinkDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    setTempNavbarConfig((prev) => {
      const newConfig = { ...prev };
      const links = [...prev.right_links];
      const draggedLink = links[draggedIndex];
      links.splice(draggedIndex, 1);
      links.splice(index, 0, draggedLink);
      newConfig.right_links = links;
      return newConfig;
    });
    setDraggedIndex(index);
  };

  const handleRightLinkDragEnd = () => {
    setDraggedIndex(null);
  };

  // 保存所有配置
  const handleSaveAll = async () => {
    if (!hasVisibleNavItem()) {
      showToast(t("admin.至少保留一个可见的导航项"), "error");
      return;
    }

    setIsSaving(true);

    try {
      if (tempFont && tempFont !== configs.get("global_font")) {
        await saveConfig("global_font", tempFont);
      }

      const navbarConfigStr = JSON.stringify(tempNavbarConfig);
      if (navbarConfigStr !== configs.get("navbar_config")) {
        await saveConfig("navbar_config", navbarConfigStr);
      }

      showToast(t("admin.saveSuccess"), "success");
    } catch {
      showToast(t("admin.saveFailed"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = tempFont !== configs.get("global_font") ||
    JSON.stringify(tempNavbarConfig) !== configs.get("navbar_config");

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <GradientText className="text-lg">{t("admin.loading")}</GradientText>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Sticky 页面标题 - 固定在导航栏下方 */}
        <div className="sticky top-16 z-50 flex items-center justify-between bg-white/95 backdrop-blur-md py-4">
          <div>
            <h1 className="font-sans text-4xl font-extralight text-neutral-900">
              <GradientText>{t("admin.systemConfig")}</GradientText>
            </h1>
            <p className="mt-2 text-sm text-neutral-500">{t("admin.configDescription")}</p>
          </div>
          <button
            ref={saveButtonRef}
            onClick={handleSaveAll}
            disabled={isSaving || !hasChanges}
            className="rounded bg-neutral-900 px-4 py-2 text-sm text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? t("admin.saving") : t("admin.saveAll")}
          </button>
        </div>

        {/* 配置列表 */}
        <div className="space-y-6 pt-4">
          {/* 全局字体 */}
          <div className="rounded-lg border border-neutral-200 bg-white/50 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-900">{t("admin.globalFont")}</label>
              <span className="text-xs text-neutral-400">global_font</span>
            </div>
            <p className="mb-3 text-xs text-neutral-500">{t("admin.fontDescription")}</p>
            <select
              value={tempFont}
              onChange={(e) => setTempFont(e.target.value)}
              className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            >
              <option value="FusionPixel">{t("admin.pixelFont")}</option>
              <option value="var(--font-geist-sans)">{t("admin.systemFont")}</option>
            </select>
          </div>

          {/* 导航栏配置 */}
          <div className="rounded-lg border border-neutral-200 bg-white/50 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-900">{t("admin.navbarConfig")}</label>
              <span className="text-xs text-neutral-400">navbar_config</span>
            </div>
            <p className="mb-3 text-xs text-neutral-500">{t("admin.navbarDescription")}</p>

            {/* 导航栏样式 */}
            <div className="mb-4">
              <span className="mb-2 block text-xs font-medium text-neutral-700">{t("admin.navbarStyle")}</span>
              <select
                value={tempNavbarConfig.style}
                onChange={(e) => setTempNavbarConfig((prev) => ({ ...prev, style: e.target.value }))}
                className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
              >
                <option value="blur">{t("admin.blur")}</option>
                <option value="solid">{t("admin.solid")}</option>
                <option value="transparent">{t("admin.transparent")}</option>
              </select>
            </div>

            {/* 导航项 */}
            <div className="mb-4">
              <span className="mb-2 block text-xs font-medium text-neutral-700">{t("admin.navItems")}</span>
              <div className="space-y-2">
                {tempNavbarConfig.nav_items.map((item, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => handleNavItemDragStart(e, index)}
                    onDragOver={(e) => handleNavItemDragOver(e, index)}
                    onDragEnd={handleNavItemDragEnd}
                    className={`flex items-center gap-1 rounded border bg-white p-2 cursor-move ${
                      draggedIndex === index ? "border-blue-400 opacity-50" : "border-neutral-200"
                    }`}
                  >
                    {/* 可见切换 - 绿色=显示，红色=隐藏 */}
                    <button
                      onClick={() => toggleNavItemVisible(index)}
                      className={`shrink-0 text-xs px-1 ${item.visible ? "text-green-500" : "text-red-500"}`}
                      title={item.visible ? "显示中 - 点击隐藏" : "已隐藏 - 点击显示"}
                    >
                      {item.visible ? "●" : "○"}
                    </button>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => updateNavItem(index, "label", e.target.value)}
                      placeholder="English"
                      className="min-w-0 flex-1 rounded border border-neutral-300 px-2 py-1 text-sm"
                    />
                    <input
                      type="text"
                      value={item.label_zh || ""}
                      onChange={(e) => updateNavItem(index, "label_zh", e.target.value)}
                      placeholder={t("admin.chineseName")}
                      className="min-w-0 flex-1 rounded border border-neutral-300 px-2 py-1 text-sm"
                    />
                    <input
                      type="text"
                      value={item.href}
                      onChange={(e) => updateNavItem(index, "href", e.target.value)}
                      placeholder="/path"
                      className="min-w-0 flex-1 rounded border border-neutral-300 px-2 py-1 text-sm"
                    />
                    <button
                      onClick={() => removeNavItem(index)}
                      disabled={tempNavbarConfig.nav_items.length <= 1}
                      className="shrink-0 text-xs text-red-500 hover:underline disabled:opacity-30"
                    >
                      {t("admin.delete")}
                    </button>
                  </div>
                ))}
                <button
                  onClick={addNavItem}
                  className="w-full rounded border border-dashed border-neutral-300 py-1.5 text-xs text-blue-500 hover:border-blue-400 hover:bg-blue-50"
                >
                  {t("admin.add")}
                </button>
              </div>
            </div>

            {/* 右侧链接 */}
            <div>
              <span className="mb-2 block text-xs font-medium text-neutral-700">{t("admin.rightLinks")}</span>
              <div className="space-y-2">
                {tempNavbarConfig.right_links.map((link, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => handleRightLinkDragStart(e, index)}
                    onDragOver={(e) => handleRightLinkDragOver(e, index)}
                    onDragEnd={handleRightLinkDragEnd}
                    className={`flex items-center gap-1 rounded border bg-white p-2 cursor-move ${
                      draggedIndex === index ? "border-blue-400 opacity-50" : "border-neutral-200"
                    }`}
                  >
                    {/* 可见切换 - 绿色=显示，红色=隐藏 */}
                    <button
                      onClick={() => toggleRightLinkVisible(index)}
                      className={`shrink-0 text-xs px-1 ${link.visible ? "text-green-500" : "text-red-500"}`}
                      title={link.visible ? "显示中 - 点击隐藏" : "已隐藏 - 点击显示"}
                    >
                      {link.visible ? "●" : "○"}
                    </button>
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => updateRightLink(index, "label", e.target.value)}
                      placeholder="Label"
                      className="min-w-0 flex-1 rounded border border-neutral-300 px-2 py-1 text-sm"
                    />
                    <input
                      type="text"
                      value={link.href}
                      onChange={(e) => updateRightLink(index, "href", e.target.value)}
                      placeholder="https://"
                      className="min-w-0 flex-1 rounded border border-neutral-300 px-2 py-1 text-sm"
                    />
                    <button
                      onClick={() => removeRightLink(index)}
                      className="shrink-0 text-xs text-red-500 hover:underline"
                    >
                      {t("admin.delete")}
                    </button>
                  </div>
                ))}
                <button
                  onClick={addRightLink}
                  className="w-full rounded border border-dashed border-neutral-300 py-1.5 text-xs text-blue-500 hover:border-blue-400 hover:bg-blue-50"
                >
                  {t("admin.add")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="mt-8 rounded-lg border border-neutral-200 bg-white/30 p-4 backdrop-blur-sm">
          <p className="text-xs text-neutral-500">
            {t("admin.dragHint")}
          </p>
        </div>
      </div>
    </div>
  );
}
