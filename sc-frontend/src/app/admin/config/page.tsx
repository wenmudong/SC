"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSystemConfig } from "@/contexts/SystemConfigContext";
import { useToast } from "@/components/Toast";
import GradientText from "@/components/GradientText";

const CONFIG_DEFINITIONS = [
  {
    key: "global_font",
    label: "全局字体",
    description: "设置网站使用的字体",
    type: "select",
    options: [
      { value: "FusionPixel", label: "像素字体 (FusionPixel)" },
      { value: "var(--font-geist-sans)", label: "系统字体 (Geist)" },
    ],
  },
  {
    key: "navbar_style",
    label: "导航栏样式",
    description: "设置导航栏的显示样式",
    type: "select",
    options: [
      { value: "transparent", label: "透明" },
      { value: "solid", label: "实色" },
      { value: "blur", label: "毛玻璃" },
    ],
  },
];

export default function AdminConfigPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { configs, updateConfig, saveConfig, isLoading } = useSystemConfig();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [tempValues, setTempValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    } else if (!authLoading && user?.role !== "admin") {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // 临时更新（不保存）
  const handleChange = (key: string, value: string) => {
    setTempValues((prev) => ({ ...prev, [key]: value }));
    updateConfig(key, value);
  };

  // 保存所有有变化的配置
  const handleSaveAll = async () => {
    const changedKeys = Object.keys(tempValues).filter((key) => tempValues[key] !== "");
    if (changedKeys.length === 0) {
      showToast("没有需要保存的配置", "info");
      return;
    }

    setIsSaving(true);

    for (const key of changedKeys) {
      const value = tempValues[key];
      try {
        await saveConfig(key, value);
      } catch {
        showToast("保存失败", "error");
        setIsSaving(false);
        return;
      }
    }

    showToast("保存成功", "success");
    setTempValues({});
    setIsSaving(false);
  };

  const hasChanges = Object.keys(tempValues).length > 0;

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <GradientText className="text-lg">加载中...</GradientText>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* 页面标题 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-sans text-4xl font-extralight text-neutral-900">
              <GradientText>系统配置</GradientText>
            </h1>
            <p className="mt-2 text-sm text-neutral-500">配置网站的全局设置</p>
          </div>
          <button
            onClick={handleSaveAll}
            disabled={isSaving || !hasChanges}
            className="rounded bg-neutral-900 px-4 py-2 text-sm text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "保存中..." : "保存全部"}
          </button>
        </div>

        {/* 配置列表 */}
        <div className="space-y-6">
          {CONFIG_DEFINITIONS.map((def) => {
            const currentValue = tempValues[def.key] ?? configs.get(def.key) ?? "";

            return (
              <div
                key={def.key}
                className="rounded-lg border border-neutral-200 bg-white/50 p-4 backdrop-blur-sm"
              >
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-neutral-900">
                    {def.label}
                  </label>
                  <span className="text-xs text-neutral-400">{def.key}</span>
                </div>

                {def.description && (
                  <p className="mb-3 text-xs text-neutral-500">{def.description}</p>
                )}

                {def.type === "select" && (
                  <select
                    value={currentValue}
                    onChange={(e) => handleChange(def.key, e.target.value)}
                    className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                  >
                    {def.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {def.type === "color" && (
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={currentValue || "#ffffff"}
                      onChange={(e) => handleChange(def.key, e.target.value)}
                      className="h-10 w-20 cursor-pointer rounded border border-neutral-300"
                    />
                    <span className="text-sm text-neutral-600">{currentValue || "#ffffff"}</span>
                  </div>
                )}

                {def.type === "text" && (
                  <input
                    type="text"
                    value={currentValue}
                    onChange={(e) => handleChange(def.key, e.target.value)}
                    placeholder={`输入${def.label}`}
                    className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                  />
                )}

                {def.type === "textarea" && (
                  <textarea
                    value={currentValue}
                    onChange={(e) => handleChange(def.key, e.target.value)}
                    placeholder={`输入${def.label}`}
                    rows={3}
                    className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* 提示信息 */}
        <div className="mt-8 rounded-lg border border-neutral-200 bg-white/30 p-4 backdrop-blur-sm">
          <p className="text-xs text-neutral-500">
            <span className="font-medium text-neutral-700">提示：</span>
            修改配置后点击&quot;保存全部&quot;按钮才会生效。
          </p>
        </div>
      </div>
    </div>
  );
}
