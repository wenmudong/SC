"use client";

import Link from "next/link";
import type { BlogListItem, BlogCategory } from "@/types";

interface BlogCardProps {
  blog: BlogListItem;
  linkUrl?: string;
  wide?: boolean;
}

const categoryConfig: Record<BlogCategory, { bg: string; text: string; label: string }> = {
  Tech: {
    bg: "bg-blue-400/40",
    text: "text-blue-900",
    label: "Tech",
  },
  Emotion: {
    bg: "bg-pink-400/40",
    text: "text-pink-900",
    label: "Emotion",
  },
  Diary: {
    bg: "bg-amber-400/40",
    text: "text-amber-900",
    label: "Diary",
  },
  Question: {
    bg: "bg-purple-400/40",
    text: "text-purple-900",
    label: "Question",
  },
};

export default function BlogCard({
  blog,
  linkUrl,
  wide = false,
}: BlogCardProps) {
  const href = linkUrl || `/blogs/${blog.id}`;
  const config = categoryConfig[blog.category] || categoryConfig.Diary;

  const formattedDate = new Date(blog.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={`group px-1 pb-2 ${wide ? "sm:col-span-2" : ""}`}>
      <div
        className={`h-full w-full overflow-hidden rounded-lg bg-neutral-50 transition-colors focus-within:bg-neutral-100 hover:bg-neutral-100 ${wide ? "aspect-[2/1]" : "aspect-square"}`}
      >
        <div className="isolate flex h-full w-full flex-col justify-between">
          {/* 顶部：分类 + 评论数 + 阅读量 */}
          <div className="flex items-center justify-between pl-4 pr-4 pt-4 text-sm tracking-tight text-neutral-400">
            <span className={`inline-block rounded px-1.5 pt-0.5 pb-1 font-mono text-sm tracking-tight shadow-inset-skeuo ${config.bg} ${config.text}`}>
              {config.label}
            </span>
            <div className="flex gap-3">
              <span>{blog.view_count} views</span>
              <span>{blog.comment_count} comments</span>
            </div>
          </div>

          {/* 内容区（可点击） */}
          <Link href={href} className="cursor-alias p-5">
            <h3 className="text-3xl font-light leading-tight">
              {blog.title}
            </h3>
            <span className="mt-2 mb-4 block text-sm tracking-tight text-neutral-400">
              {formattedDate}
            </span>
            <p className="leading-relaxed tracking-tight text-neutral-700 line-clamp-4">
              {blog.subtitle || blog.content}
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
