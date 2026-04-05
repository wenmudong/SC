"use client";

import type { Hobby } from "@/types/hobby";

interface ImageSlideCardProps extends Hobby {}

export default function ImageSlideCard({
  id,
  category,
  prefix,
  title,
  subtitle,
  description,
  image,
  link,
  wide = false,
}: ImageSlideCardProps) {
  return (
    <div className={`group px-1 pb-2 ${wide ? "aspect-[2] sm:col-span-2" : "aspect-square"}`}>
      <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-lg bg-neutral-50 transition-colors focus-within:bg-neutral-100 hover:bg-neutral-100">
        {/* 封面图 - 上移动画 */}
        {image && (
          <img
            src={image.src}
            alt={image.alt}
            className="absolute h-full w-full rounded-lg object-cover transition-all group-focus-within:mt-12 group-hover:mt-12"
          />
        )}

        {/* 分类标签 + 外链按钮 */}
        <div className="relative z-10 flex items-center justify-between pl-4 pr-2 pt-2 text-sm tracking-tight text-neutral-400">
          <span className="py-1.5">
            {prefix ? `${prefix} ` : ""}{category || ""}
          </span>
          {link?.url && (
            <a
              href={link.url}
              target={link.external ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors focus-visible:ring-4 focus-visible:ring-blue-200 group-focus-within:bg-white group-focus-within:text-neutral-900 group-focus-within:shadow-skeuo cursor-alias group-hover:bg-white group-hover:text-neutral-900 group-hover:shadow-skeuo"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          )}
        </div>

        {/* 内容标签（叠加在图片上） */}
        <div className="z-10 p-2">
          {title && (
            <span className="inline-block rounded-lg px-2 py-1 text-sm tracking-tight text-white/70 transition-colors group-focus-within:bg-black/70 group-hover:bg-black/70">
              {title}
            </span>
          )}
          {subtitle && (
            <span className="ml-2 inline-block rounded-lg px-2 py-1 text-sm tracking-tight text-white/70 transition-colors group-focus-within:bg-black/70 group-hover:bg-black/70">
              {subtitle}
            </span>
          )}
          {description && !title && !subtitle && (
            <span className="inline-block rounded-lg px-2 py-1 text-sm tracking-tight text-white/70 transition-colors group-focus-within:bg-black/70 group-hover:bg-black/70">
              {description}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
