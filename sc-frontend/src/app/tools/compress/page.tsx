"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { compressApi } from "@/services/api";

// 允许的图片格式
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
// 文件大小限制（字节）
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB
const MAX_FILE_COUNT = 50;

/** 格式化文件大小为可读字符串 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** 获取文件的格式标签（考虑输出格式） */
function getFormatLabel(file: File, outputFormat: "original" | "webp"): string {
  const ext = file.name.split(".").pop()?.toUpperCase() || "";
  if (["JPG", "JPEG"].includes(ext)) return "JPG";
  if (ext === "PNG") {
    // PNG 在「保持原格式」模式下会转为 JPG
    return outputFormat === "original" ? "PNG→JPG" : "PNG";
  }
  if (ext === "WEBP") return "WEBP";
  return ext;
}

/** 获取格式标签的背景色 */
function getFormatColor(label: string): string {
  switch (label) {
    case "JPG":
    case "JPEG":
      return "bg-blue-100 text-blue-700";
    case "PNG":
      return "bg-green-100 text-green-700";
    case "PNG→JPG":
      return "bg-amber-100 text-amber-700";
    case "WEBP":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-neutral-100 text-neutral-700";
  }
}

interface FileItem {
  file: File;
  id: string;
}

export default function CompressPage() {
  const { isReady } = useAuthGuard();
  const { token } = useAuth();
  const { showToast } = useToast();

  const [files, setFiles] = useState<FileItem[]>([]);
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState<"original" | "webp">("original");
  const [compressMode, setCompressMode] = useState<"quality" | "target_size">("quality");
  const [targetSize, setTargetSize] = useState(100);
  const [targetUnit, setTargetUnit] = useState<"KB" | "MB">("KB");
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 文件数量和大小统计
  const totalSize = files.reduce((sum, item) => sum + item.file.size, 0);

  /** 校验文件并添加到列表 */
  const validateAndAddFiles = useCallback(
    (newFiles: File[]) => {
      setValidationError("");

      // 过滤允许的格式
      const validFiles = newFiles.filter((f) => ALLOWED_TYPES.has(f.type));
      if (validFiles.length < newFiles.length) {
        setValidationError("已忽略不支持的文件格式（仅支持 JPG/PNG/WebP）");
      }

      // 检查单文件大小
      const oversized = validFiles.filter((f) => f.size > MAX_FILE_SIZE);
      if (oversized.length > 0) {
        setValidationError(`有 ${oversized.length} 个文件超过 20MB，已忽略`);
        validFiles.splice(0, validFiles.length, ...validFiles.filter((f) => f.size <= MAX_FILE_SIZE));
      }

      // 合并后检查总数量
      const currentCount = files.length;
      const totalCount = currentCount + validFiles.length;
      if (totalCount > MAX_FILE_COUNT) {
        const allowed = MAX_FILE_COUNT - currentCount;
        if (allowed <= 0) {
          setValidationError(`最多只能添加 ${MAX_FILE_COUNT} 个文件`);
          return;
        }
        validFiles.splice(allowed);
        setValidationError(`已达文件数量上限（${MAX_FILE_COUNT}），部分文件未添加`);
      }

      // 检查总大小
      const newTotalSize = totalSize + validFiles.reduce((sum, f) => sum + f.size, 0);
      if (newTotalSize > MAX_TOTAL_SIZE) {
        setValidationError("文件总大小超过 500MB，请减少文件数量");
        return;
      }

      // 去重（基于文件名 + 大小）
      const existingKeys = new Set(files.map((item) => `${item.file.name}-${item.file.size}`));
      const uniqueFiles = validFiles.filter((f) => !existingKeys.has(`${f.name}-${f.size}`));

      if (uniqueFiles.length === 0 && validFiles.length > 0) {
        setValidationError("这些文件已在列表中");
        return;
      }

      const newItems: FileItem[] = uniqueFiles.map((f) => ({
        file: f,
        id: `${f.name}-${f.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      }));

      setFiles((prev) => [...prev, ...newItems]);
    },
    [files, totalSize]
  );

  /** 从 webkitGetAsEntry 递归读取文件夹内容 */
  const readEntry = useCallback(
    async (entry: FileSystemEntry): Promise<File[]> => {
      if (entry.isFile) {
        return new Promise((resolve) => {
          (entry as FileSystemFileEntry).file((file) => resolve([file]));
        });
      }
      if (entry.isDirectory) {
        const dirReader = (entry as FileSystemDirectoryEntry).createReader();
        const allFiles: File[] = [];

        // readEntries 可能需要多次调用才能读取完所有条目
        const readBatch = (): Promise<FileSystemEntry[]> =>
          new Promise((resolve) => dirReader.readEntries(resolve));

        let entries: FileSystemEntry[];
        do {
          entries = await readBatch();
          for (const e of entries) {
            const subFiles = await readEntry(e);
            allFiles.push(...subFiles);
          }
        } while (entries.length > 0);

        return allFiles;
      }
      return [];
    },
    []
  );

  /** 拖拽进入 */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  /** 拖拽离开 */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  /** 拖拽悬停 */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  /** 拖拽放下 */
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const items = e.dataTransfer.items;
      if (!items) return;

      const allFiles: File[] = [];
      const promises: Promise<File[]>[] = [];

      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry?.();
        if (entry) {
          promises.push(readEntry(entry));
        }
      }

      const results = await Promise.all(promises);
      for (const result of results) {
        allFiles.push(...result);
      }

      if (allFiles.length > 0) {
        validateAndAddFiles(allFiles);
      }
    },
    [readEntry, validateAndAddFiles]
  );

  /** 通过文件选择器添加文件 */
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files;
      if (!selected || selected.length === 0) return;
      validateAndAddFiles(Array.from(selected));
      // 重置 input 以允许重复选择同一文件
      e.target.value = "";
    },
    [validateAndAddFiles]
  );

  /** 删除单个文件 */
  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
  }, []);

  /** 清空所有文件 */
  const clearAll = useCallback(() => {
    setFiles([]);
    setValidationError("");
  }, []);

  /** 执行压缩 */
  const handleCompress = useCallback(async () => {
    if (!token || files.length === 0) return;

    setIsCompressing(true);
    setValidationError("");

    try {
      const fileObjects = files.map((item) => item.file);
      const targetSizeKb = compressMode === "target_size"
        ? (targetUnit === "MB" ? targetSize * 1024 : targetSize)
        : 0;
      const blob = await compressApi.uploadAndCompress(token, fileObjects, {
        quality,
        outputFormat,
        compressMode,
        targetSizeKb,
      });

      // 触发 zip 下载
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `compressed_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("压缩完成，文件已下载", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "压缩失败";
      showToast(message, "error");
      setValidationError(message);
    } finally {
      setIsCompressing(false);
    }
  }, [token, files, quality, outputFormat, compressMode, targetSize, targetUnit, showToast]);

  // 监听认证过期事件
  useEffect(() => {
    const handleExpired = () => {
      setIsCompressing(false);
      showToast("登录已过期，请重新登录", "error");
    };
    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, [showToast]);

  if (!isReady) return null;

  return (
    <>
      {/* 返回按钮 + 页面标题 */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm">
        <div className="flex flex-col gap-4 px-2 pt-4 pb-4">
          <Link
            href="/tools"
            className="inline-flex items-center gap-1 text-sm text-neutral-400 transition-colors hover:text-neutral-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
            Back to Tools
          </Link>
          <h1 className="font-sans text-6xl font-extralight text-neutral-900 md:text-8xl">
            compress.
          </h1>
          <p className="text-lm text-neutral-400">
            Batch compress and convert images.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl pb-8">
        {/* 拖拽区域 */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 transition-colors ${
            isDragOver
              ? "border-neutral-900 bg-neutral-100"
              : "border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10 text-neutral-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
          </svg>
          <p className="text-sm text-neutral-500">
            拖拽图片文件或文件夹到此处，或点击选择
          </p>
          <p className="text-xs text-neutral-400">
            支持 JPG / PNG / WebP，最多 50 个文件，单文件 20MB
          </p>
          <p className="text-xs text-neutral-400">
            PNG 文件将自动转为 JPG 以实现有损压缩
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* 校验错误提示 */}
        {validationError && (
          <div className="mt-4 rounded bg-red-100 p-3 text-sm text-red-600">
            {validationError}
          </div>
        )}

        {/* 文件列表 */}
        {files.length > 0 && (
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-neutral-500">
                {files.length} 个文件 · {formatFileSize(totalSize)}
              </span>
              <button
                onClick={clearAll}
                className="text-sm text-neutral-400 transition-colors hover:text-red-500"
              >
                清空
              </button>
            </div>

            <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-neutral-200 p-3">
              {files.map((item) => {
                const label = getFormatLabel(item.file, outputFormat);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-md bg-neutral-50 px-3 py-2"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className={`inline-block rounded px-1.5 py-0.5 font-mono text-xs ${getFormatColor(label)}`}>
                        {label}
                      </span>
                      <span className="truncate text-sm text-neutral-700">
                        {item.file.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="whitespace-nowrap text-xs text-neutral-400">
                        {formatFileSize(item.file.size)}
                      </span>
                      <button
                        onClick={() => removeFile(item.id)}
                        className="text-neutral-400 transition-colors hover:text-red-500"
                        title="移除"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 控制区 */}
        <div className="mt-6 space-y-5">
          {/* 压缩模式 */}
          <div>
            <label className="mb-2 block text-sm text-neutral-600">
              压缩模式
            </label>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="compressMode"
                  value="quality"
                  checked={compressMode === "quality"}
                  onChange={() => setCompressMode("quality")}
                  className="accent-neutral-900"
                />
                <span className="text-sm text-neutral-700">按质量</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="compressMode"
                  value="target_size"
                  checked={compressMode === "target_size"}
                  onChange={() => setCompressMode("target_size")}
                  className="accent-neutral-900"
                />
                <span className="text-sm text-neutral-700">按目标大小</span>
              </label>
            </div>
          </div>

          {/* 按质量：质量滑块 */}
          {compressMode === "quality" && (
            <div>
              <label className="mb-2 block text-sm text-neutral-600">
                压缩质量：<span className="font-mono text-neutral-900">{quality}</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-neutral-200 accent-neutral-900"
                />
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={quality}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v >= 1 && v <= 100) setQuality(v);
                  }}
                  className="w-16 rounded border border-neutral-300 px-2 py-1 text-center text-sm focus:border-neutral-500 focus:outline-none"
                />
              </div>
              <p className="mt-1 text-xs text-neutral-400">
                数值越高质量越好，但文件越大；100 可能比原图更大
              </p>
            </div>
          )}

          {/* 按目标大小：目标输入 */}
          {compressMode === "target_size" && (
            <div>
              <label className="mb-2 block text-sm text-neutral-600">
                目标大小
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={targetSize}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v >= 1) setTargetSize(v);
                  }}
                  className="w-24 rounded border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
                />
                <select
                  value={targetUnit}
                  onChange={(e) => setTargetUnit(e.target.value as "KB" | "MB")}
                  className="rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
                >
                  <option value="KB">KB</option>
                  <option value="MB">MB</option>
                </select>
              </div>
              <p className="mt-1 text-xs text-neutral-400">
                每张图片压缩到目标大小以下；已小于此大小的图片将跳过
              </p>
            </div>
          )}

          {/* 格式选择 */}
          <div>
            <label className="mb-2 block text-sm text-neutral-600">
              输出格式
            </label>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="outputFormat"
                  value="original"
                  checked={outputFormat === "original"}
                  onChange={() => setOutputFormat("original")}
                  className="accent-neutral-900"
                />
                <span className="text-sm text-neutral-700">保持原格式（PNG 转 JPG）</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="outputFormat"
                  value="webp"
                  checked={outputFormat === "webp"}
                  onChange={() => setOutputFormat("webp")}
                  className="accent-neutral-900"
                />
                <span className="text-sm text-neutral-700">转为 WebP</span>
              </label>
            </div>
          </div>
        </div>

        {/* 压缩按钮 */}
        <div className="mt-8">
          <button
            onClick={handleCompress}
            disabled={files.length === 0 || isCompressing}
            className="w-full rounded bg-neutral-900 px-6 py-3 text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCompressing ? (
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                压缩中...
              </span>
            ) : (
              `压缩 ${files.length > 0 ? `${files.length} 个文件` : ""}`
            )}
          </button>
        </div>
      </div>
    </>
  );
}
