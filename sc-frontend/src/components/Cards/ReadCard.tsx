"use client";

interface ReadCardProps {
  id: string;
  title: string;
  description?: string;
  status: "ACTIVE" | "COMPLETED" | "PLANNING";
  coverUrl?: string;
  linkUrl?: string;
  category?: string;
}

const statusConfig = {
  ACTIVE: {
    bg: "bg-green-400/40",
    text: "text-green-900",
    label: "ACTIVE",
  },
  COMPLETED: {
    bg: "bg-blue-400/40",
    text: "text-blue-900",
    label: "COMPLETED",
  },
  PLANNING: {
    bg: "bg-amber-400/40",
    text: "text-amber-900",
    label: "PLANNING",
  },
};

export default function ReadCard({
  id,
  title,
  description,
  status,
  coverUrl,
  linkUrl,
  category = "Project",
}: ReadCardProps) {
  const config = statusConfig[status];

  return (
    <div className="group aspect-square px-1 pb-2">
      <div className="h-full w-full overflow-hidden rounded-lg bg-neutral-50 transition-colors focus-within:bg-neutral-100 hover:bg-neutral-100">
        <div className="isolate flex h-full w-full flex-col">
          {/* 顶部：类型 + 外链 */}
          <div className="flex items-center justify-between pl-4 pr-2 pt-2 text-sm tracking-tight text-neutral-400">
            <span className="py-1.5">{category}</span>
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

          {/* 内容区 */}
          <div className="grid grow grid-cols-2 items-end gap-6 px-7 pb-10">
            {coverUrl && (
              <img
                src={coverUrl}
                alt={title}
                className="rounded shadow-lg transition-transform group-focus-within:-rotate-3 group-focus-within:scale-110 group-focus-within:shadow-xl group-hover:-rotate-3 group-hover:scale-110 group-hover:shadow-xl"
              />
            )}
            <div className="tracking-tight">
              <div
                className={`inline-block rounded px-1.5 pt-0.5 pb-1 font-mono text-sm tracking-tight shadow-inset-skeuo ${config.bg} ${config.text}`}
              >
                {config.label}
              </div>
              <h3 className="mt-3 line-clamp-3">{title}</h3>
              {description && (
                <span className="text-neutral-400 line-clamp-2">
                  {description}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
