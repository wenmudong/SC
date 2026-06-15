"use client";

import { useRef, useState, useEffect } from "react";
import TextCard from "@/components/Cards/TextCard";
import EmptyState from "@/components/EmptyState";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useLanguage } from "@/contexts/LanguageContext";

interface Tool {
  id: string;
  title: string;
  subtitleKey: string;
  category?: string;
  linkUrl?: string;
}

// 临时工具数据，后续可从后端获取
const TOOLS: Tool[] = [
  {
    id: "compress",
    title: "Image Compress",
    subtitleKey: "tools.batchCompress",
    category: "Tools",
    linkUrl: "/tools/compress",
  },
];

export default function ToolsPage() {
  const { isReady } = useAuthGuard();
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // 鼠标拖动滚动
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.cursor = "grabbing";
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab";
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // 监听全局鼠标抬起，确保拖动结束时重置状态
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      if (scrollRef.current) {
        scrollRef.current.style.cursor = "grab";
      }
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  if (!isReady) return null;

  return (
    <>
      {/* 固定头部区域 */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm">
        <div className="flex flex-col gap-4 px-2 pt-4 pb-4">
          <h1 className="font-sans text-6xl font-extralight text-neutral-900 md:text-8xl">
            Tools.
          </h1>
          <p className="text-lm text-neutral-400">
            {TOOLS.length} {t("tools.tools")} · {t("tools.description")}
          </p>
        </div>
      </div>

      {/* 工具列表 - 水平滚动 + 拖动 */}
      {TOOLS.length === 0 ? (
        <EmptyState message={t("tools.noTools")} />
      ) : (
        <div className="relative">
          {/* 左侧渐变遮罩 */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-white to-transparent" />
          {/* 右侧渐变遮罩 */}
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-white to-transparent" />

          {/* 水平滚动容器 - 支持拖动 */}
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
            style={{ cursor: "grab", scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {TOOLS.map((tool) => (
              <TextCard
                key={tool.id}
                type="tool"
                id={tool.id}
                category={tool.category}
                title={tool.title}
                subtitle={t(tool.subtitleKey)}
                link={tool.linkUrl ? { url: tool.linkUrl, external: !tool.linkUrl.startsWith("/") } : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
