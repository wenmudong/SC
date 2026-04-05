"use client";

interface ToolCardProps {
  id: string;
  title: string;
  description?: string;
  linkUrl?: string;
  icon?: string;
}

export default function ToolCard({
  id,
  title,
  description,
  linkUrl,
  icon,
}: ToolCardProps) {
  const Wrapper = linkUrl ? "a" : "div";
  const wrapperProps = linkUrl
    ? {
        href: linkUrl,
        target: "_blank" as const,
        rel: "noopener noreferrer" as const,
      }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className="group flex w-64 shrink-0 flex-col rounded-lg bg-neutral-50 p-4 transition-colors hover:bg-neutral-100"
    >
      {/* 图标 */}
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-200 text-xl">
        {icon || "🔧"}
      </div>

      {/* 标题 */}
      <h3 className="text-lg font-medium text-neutral-900">{title}</h3>

      {/* 描述 */}
      {description && (
        <p className="mt-1 text-sm text-neutral-500 line-clamp-2">
          {description}
        </p>
      )}

      {/* 链接指示 */}
      {linkUrl && (
        <div className="mt-auto flex items-center gap-1 pt-3 text-xs text-neutral-400">
          <span>Open</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
            <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </Wrapper>
  );
}
