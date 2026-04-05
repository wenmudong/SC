"use client";

interface ProjectCardProps {
  id: string;
  title: string;
  linkUrl?: string;
  coverUrl?: string;
  category?: string;
  wide?: boolean;
}

export default function ProjectCard({
  id,
  title,
  linkUrl,
  coverUrl,
  category = "Project",
  wide = false,
}: ProjectCardProps) {
  const Wrapper = linkUrl ? "a" : "div";
  const wrapperProps = linkUrl
    ? {
        href: linkUrl,
        target: "_blank" as const,
        rel: "noopener noreferrer" as const,
        className: "block h-full w-full",
      }
    : {};

  return (
    <div className={`px-1 pb-2 ${wide ? "aspect-[2] sm:col-span-2" : "aspect-square"}`}>
      <div className="group relative isolate h-full w-full overflow-hidden rounded-lg bg-neutral-50 transition-colors focus-within:bg-neutral-100 hover:bg-neutral-100">
        {/* 顶部：分类标签 + 外链按钮 */}
        <div className="flex items-center justify-between pl-4 pr-2 pt-2 text-sm tracking-tight text-neutral-400">
          <span className="py-1.5">Projects · {category}</span>
          {linkUrl && (
            <a
              href={linkUrl}
              target="_blank"
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

        {/* 封面图 */}
        {coverUrl && (
          <Wrapper {...wrapperProps}>
            <img
              src={coverUrl}
              alt={title}
              className={`absolute -z-10 h-full w-full cursor-alias object-contain transition-transform group-hover:scale-105 ${linkUrl ? "" : "pointer-events-none"}`}
            />
          </Wrapper>
        )}
      </div>
    </div>
  );
}
