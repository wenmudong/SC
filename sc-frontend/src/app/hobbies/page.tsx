import HobbyCard from "@/components/Cards/HobbyCard";
import AuthGuard from "@/components/AuthGuard";
import type { Hobby } from "@/types";

// TODO: 后端对接后替换为 API 调用
const mockHobbies: Hobby[] = [
  // TextCard 示例（无图片）
  {
    type: "book",
    id: "1",
    category: "Book",
    prefix: "Hobbies ·",
    tags: [
      { label: "FICTION", color: "indigo" },
      { label: "NOW READING", color: "orange" },
    ],
    title: "The Pragmatic Programmer",
    subtitle: "David Thomas & Andrew Hunt",
    description: "Your journey to mastery",
    wide: false,
  },
  // ImageBgCard 示例（背景图 + 渐变）
  {
    type: "plant",
    id: "2",
    category: "Plants",
    prefix: "Hobbies ·",
    tags: [{ label: "ARACEAE", color: "sky" }],
    title: "Monstera adansonii",
    image: {
      src: "https://pub-e5d7dc0888444c8987c766ea650b2515.r2.dev/content/plants/monstera-adansonii.png",
      alt: "Monstera adansonii",
      layout: "background",
    },
    wide: false,
  },
  // ImageSlideCard 示例（图片上移）
  {
    type: "climbing",
    id: "3",
    category: "Climbing",
    prefix: "Hobbies ·",
    title: "2023.02.12",
    subtitle: "@ Fit Bloc",
    image: {
      src: "https://pub-e5d7dc0888444c8987c766ea650b2515.r2.dev/content/climbing/20230212.png",
      alt: "Climbing session",
      layout: "slide",
    },
    link: {
      url: "https://www.instagram.com/reel/CopFWqrgrBE/",
      external: true,
    },
    wide: false,
  },
  // ImageFillCard 示例（填充图）
  {
    type: "keyboard",
    id: "4",
    category: "Keyboards",
    prefix: "Hobbies ·",
    tags: [{ label: "TOPRE", color: "purple" }],
    title: "HHKB Pro Hybrid Type-S Snow",
    image: {
      src: "https://pub-e5d7dc0888444c8987c766ea650b2515.r2.dev/content/keyboards/hhkb.png",
      alt: "HHKB Keyboard",
      layout: "fill",
    },
    link: {
      url: "https://hhkb.io",
      external: true,
    },
    wide: false,
  },
  // TextCard 示例（工具类）
  {
    type: "tool",
    id: "5",
    category: "Tools",
    prefix: "Hobbies ·",
    tags: [
      { label: "CLI", color: "green" },
      { label: "ZSH", color: "amber" },
    ],
    title: "Neovim Config",
    subtitle: "My daily driver setup",
    description: "LSP, telescope, treesitter",
    wide: false,
  },
  // ImageBgCard 示例（另一个植物）
  {
    type: "plant2",
    id: "6",
    category: "Plants",
    prefix: "Hobbies ·",
    tags: [{ label: "BEGONIACEAE", color: "sky" }],
    title: "Begonia 'Snow Capped'",
    image: {
      src: "https://pub-e5d7dc0888444c8987c766ea650b2515.r2.dev/content/plants/begonia-snow-capped.png",
      alt: "Begonia Snow Capped",
      layout: "background",
    },
    wide: false,
  },
  // ImageSlideCard 示例（宽卡片）
  {
    type: "film",
    id: "7",
    category: "Film",
    prefix: "Hobbies ·",
    title: "Kentmere Pan 400",
    image: {
      src: "https://pub-e5d7dc0888444c8987c766ea650b2515.r2.dev/content/film/000047120039.jpeg",
      alt: "Film photo",
      layout: "slide",
    },
    wide: true,
  },
  // ImageFillCard 示例（宽卡片）
  {
    type: "project",
    id: "8",
    category: "Web",
    prefix: "Projects ·",
    tags: [{ label: "NEXT.JS", color: "green" }],
    image: {
      src: "https://pub-e5d7dc0888444c8987c766ea650b2515.r2.dev/content/projects/design-spells.png",
      alt: "Project screenshot",
      layout: "fill",
    },
    link: {
      url: "https://designspells.com",
      external: true,
    },
    wide: true,
  },
];

export default function Hobbies() {
  return (
    <AuthGuard>
    <>
      {/* 固定头部区域 */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm">
        <div className="flex flex-col gap-4 px-2 pt-4 pb-4">
          {/* 第一行: Hobbies. */}
          <div className="flex items-center justify-between">
            <h1 className="font-sans text-6xl font-extralight text-neutral-900 md:text-8xl">
              Hobbies.
            </h1>
          </div>
          {/* 第二行: 描述 */}
          <p className="text-lm text-neutral-400">
            {mockHobbies.length} {"items"} · Things I enjoy in my free time.
          </p>
        </div>
      </div>

      {/* 爱好网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockHobbies.map((hobby) => (
          <HobbyCard key={hobby.id} {...hobby} />
        ))}
      </div>
    </>
    </AuthGuard>
  );
}
