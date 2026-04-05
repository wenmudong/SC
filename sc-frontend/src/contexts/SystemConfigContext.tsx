"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { adminApi } from "@/services/api";
import { useAuth } from "./AuthContext";
import type { SystemConfig } from "@/types";

interface SystemConfigValue {
  configs: Map<string, string>;
  updateConfig: (key: string, value: string) => Promise<void>;
  saveConfig: (key: string, value: string) => Promise<void>;
  refreshConfigs: () => Promise<void>;
  isLoading: boolean;
}

const SystemConfigContext = createContext<SystemConfigValue | null>(null);

const CONFIG_STORAGE_KEY = "system_configs";

// 应用配置到页面
function applyConfig(key: string, value: string) {
  switch (key) {
    case "global_font":
      document.body.style.setProperty("font-family", value, "important");
      document.body.style.setProperty("--font-sans", value, "important");
      document.body.setAttribute("data-font", value);
      break;
  }
}

// 从 localStorage 加载配置
function loadConfigsFromStorage(): Map<string, string> {
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      const obj = JSON.parse(stored);
      return new Map(Object.entries(obj));
    }
  } catch {
    // ignore
  }
  return new Map();
}

// 保存配置到 localStorage
function saveConfigsToStorage(configs: Map<string, string>) {
  const obj = Object.fromEntries(configs);
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(obj));
}

// 应用所有配置到页面
function applyAllConfigs(configs: Map<string, string>) {
  configs.forEach((value, key) => {
    applyConfig(key, value);
  });
}

export function SystemConfigProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const [configs, setConfigs] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // 加载配置（所有用户从 localStorage 加载，admin 从服务器同步）
  const loadConfigs = async () => {
    // 所有用户先从 localStorage 加载并应用
    const stored = loadConfigsFromStorage();
    if (stored.size > 0) {
      setConfigs(stored);
      applyAllConfigs(stored);
    }
    setIsLoading(false);

    // admin 从服务器同步最新配置
    if (token && user?.role === "admin") {
      try {
        const response = await adminApi.getAllConfigs(token);
        const configMap = new Map<string, string>();
        response.configs.forEach((config: SystemConfig) => {
          configMap.set(config.key, config.value);
        });
        setConfigs(configMap);
        saveConfigsToStorage(configMap);
        applyAllConfigs(configMap);
      } catch (error) {
        console.error("加载系统配置失败:", error);
      }
    }
  };

  useEffect(() => {
    loadConfigs();
  }, [token, user?.role]);

  // 临时更新配置（不保存，用于编辑）
  const updateConfig = (key: string, value: string): Promise<void> => {
    setConfigs((prev) => new Map(prev).set(key, value));
    return Promise.resolve();
  };

  // 保存配置到服务器（仅 admin）
  const saveConfig = async (key: string, value: string) => {
    if (!token) {
      throw new Error("未登录");
    }
    if (user?.role !== "admin") {
      throw new Error("需要管理员权限");
    }

    try {
      await adminApi.updateConfig(token, key, { value });
      setConfigs((prev) => {
        const newConfigs = new Map(prev);
        newConfigs.set(key, value);
        saveConfigsToStorage(newConfigs);
        return newConfigs;
      });
      applyConfig(key, value);
    } catch (error) {
      console.error("保存配置失败:", error);
      throw error;
    }
  };

  return (
    <SystemConfigContext.Provider
      value={{
        configs,
        updateConfig,
        saveConfig,
        refreshConfigs: loadConfigs,
        isLoading,
      }}
    >
      {children}
    </SystemConfigContext.Provider>
  );
}

export function useSystemConfig() {
  const context = useContext(SystemConfigContext);
  if (!context) {
    throw new Error("useSystemConfig 必须在 SystemConfigProvider 内使用");
  }
  return context;
}
