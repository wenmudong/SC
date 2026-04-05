"use client";

import { useRef, useState, useEffect } from "react";
import TextCard from "@/components/Cards/TextCard";
import EmptyState from "@/components/EmptyState";

interface Tool {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  linkUrl?: string;
}

// 临时工具数据，后续可从后端获取
const TOOLS: Tool[] = [
  {
    id: "1",
    title: "QR Code Generator",
    subtitle: "Generate QR codes for text, URLs, or any data",
    category: "Tools",
    linkUrl: "https://example.com/qr",
  },
  {
    id: "2",
    title: "Color Picker",
    subtitle: "Pick and convert colors between formats",
    category: "Tools",
    linkUrl: "https://example.com/color",
  },
  {
    id: "3",
    title: "JSON Formatter",
    subtitle: "Format and validate JSON data",
    category: "Tools",
    linkUrl: "https://example.com/json",
  },
  {
    id: "4",
    title: "UUID Generator",
    subtitle: "Generate unique identifiers",
    category: "Tools",
    linkUrl: "https://example.com/uuid",
  },
  {
    id: "5",
    title: "Base64 Encoder",
    subtitle: "Encode and decode Base64 strings",
    category: "Tools",
    linkUrl: "https://example.com/base64",
  },
  {
    id: "6",
    title: "Password Generator",
    subtitle: "Generate secure random passwords",
    category: "Tools",
    linkUrl: "https://example.com/password",
  },
  {
    id: "7",
    title: "URL Encoder",
    subtitle: "Encode and decode URL strings",
    category: "Tools",
    linkUrl: "https://example.com/url",
  },
  {
    id: "8",
    title: "Hash Generator",
    subtitle: "Generate MD5, SHA-1, SHA-256 hashes",
    category: "Tools",
    linkUrl: "https://example.com/hash",
  },
  {
    id: "9",
    title: "Regex Tester",
    subtitle: "Test and debug regular expressions",
    category: "Tools",
    linkUrl: "https://example.com/regex",
  },
  {
    id: "10",
    title: "Cron Expression",
    subtitle: "Validate and parse cron expressions",
    category: "Tools",
    linkUrl: "https://example.com/cron",
  },
];

export default function ToolsPage() {
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

  return (
    <>
      {/* 固定头部区域 */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm">
        <div className="flex flex-col gap-4 px-2 pt-4 pb-4">
          <h1 className="font-sans text-6xl font-extralight text-neutral-900 md:text-8xl">
            tools.
          </h1>
          <p className="text-lm text-neutral-400">
            {TOOLS.length} {"tools"} · Wenmudong&apos;s collection.
          </p>
        </div>
      </div>

      {/* 工具列表 - 水平滚动 + 拖动 */}
      {TOOLS.length === 0 ? (
        <EmptyState message="No tools yet." />
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
                id={tool.id}
                category={tool.category}
                title={tool.title}
                subtitle={tool.subtitle}
                link={tool.linkUrl ? { url: tool.linkUrl, external: true } : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
