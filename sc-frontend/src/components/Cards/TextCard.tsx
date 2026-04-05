"use client";

import Link from "next/link";
import type { Hobby, TagColor } from "@/types/hobby";

const tagColors: Record<TagColor, { bg: string; text: string }> = {
  lime: { bg: "bg-lime-400/40", text: "text-lime-900" },
  indigo: { bg: "bg-indigo-400/40", text: "text-indigo-900" },
  orange: { bg: "bg-orange-400/40", text: "text-orange-900" },
  sky: { bg: "bg-sky-400/40", text: "text-sky-900" },
  purple: { bg: "bg-purple-400/40", text: "text-purple-900" },
  green: { bg: "bg-green-400/40", text: "text-green-900" },
  amber: { bg: "bg-amber-400/40", text: "text-amber-900" },
};

interface TextCardProps extends Hobby {}

export default function TextCard({
  id,
  category,
  prefix,
  tags = [],
  title,
  subtitle,
  description,
  link,
  wide = false,
}: TextCardProps) {
  const content = (
    <div className="h-full w-full overflow-hidden rounded-lg bg-neutral-50 transition-colors focus-within:bg-neutral-100 hover:bg-neutral-100">
      <div className="flex h-full w-full flex-col justify-between">
        {/* 顶部：前缀 + 分类 */}
        <div className="flex items-center justify-between pl-4 pr-2 pt-2 text-sm tracking-tight text-neutral-400">
          <span className="py-1.5">
            {prefix ? `${prefix} ` : ""}{category || ""}
          </span>
          {link?.url && (
            <span className="text-neutral-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
              </svg>
            </span>
          )}
        </div>

        {/* 内容区 */}
        <div className="p-5">
          {/* 标签组 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => {
                const colors = tagColors[tag.color || "lime"];
                return (
                  <span
                    key={i}
                    className={`inline-block rounded px-1.5 pt-0.5 pb-1 font-mono text-sm tracking-tight shadow-inset-skeuo ${colors.bg} ${colors.text}`}
                  >
                    {tag.label}
                  </span>
                );
              })}
            </div>
          )}

          {/* 标题 */}
          {title && (
            <h3 className="font-serif-variation mt-3 mb-[.84rem] pb-[.4rem] font-serif text-4xl font-light line-clamp-2 md:text-5xl lg:text-6xl">
              {title}
            </h3>
          )}

          {/* 副标题 */}
          {subtitle && (
            <p className="tracking-tight text-neutral-400 line-clamp-1">
              {subtitle}
            </p>
          )}

          {/* 描述 */}
          {description && (
            <p className="tracking-tight text-neutral-700 line-clamp-1">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const wrapperClass = `px-1 pb-2 ${wide ? "aspect-[2] sm:col-span-2" : "aspect-square"}`;

  if (link?.url) {
    const isExternal = link.external !== false;
    if (isExternal) {
      return (
        <div className={wrapperClass}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block h-full w-full"
          >
            {content}
          </a>
        </div>
      );
    }
    return (
      <div className={wrapperClass}>
        <Link href={link.url} className="block h-full w-full">
          {content}
        </Link>
      </div>
    );
  }

  return <div className={wrapperClass}>{content}</div>;
}
