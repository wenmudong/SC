import ProjectCard from "@/components/Cards/ProjectCard";
import type { Project } from "@/types";

// TODO: 后端对接后替换为 API 调用
const mockProjects: Project[] = [
  {
    id: "1",
    title: "SuperCenter",
    category: "Personal Website",
    coverUrl: "https://pub-e5d7dc0888444c8987c766ea650b2515.r2.dev/content/projects/fourth-class-honours.png",
    linkUrl: "https://github.com",
  },
  {
    id: "2",
    title: "AI Tool",
    category: "AI",
    coverUrl: "https://pub-e5d7dc0888444c8987c766ea650b2515.r2.dev/content/projects/design-spells.png",
    linkUrl: "https://github.com",
  },
  {
    id: "3",
    title: "Data Pipeline",
    category: "Data",
    coverUrl: "https://pub-e5d7dc0888444c8987c766ea650b2515.r2.dev/content/projects/average-joe-coffeehouse-reviews_2.png",
    linkUrl: "https://github.com",
  },
  {
    id: "4",
    title: "Foldaway",
    category: "Productivity",
    coverUrl: "https://pub-e5d7dc0888444c8987c766ea650b2515.r2.dev/content/projects/foldaway.png",
    linkUrl: "https://foldaway.space/",
  },
];

export default function Projects() {
  return (
    <>
      {/* 固定头部区域 */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm">
        <div className="flex flex-col gap-4 px-2 pt-4 pb-4">
          {/* 第一行: Projects. */}
          <div className="flex items-center justify-between">
            <h1 className="font-sans text-6xl font-extralight text-neutral-900 md:text-8xl">
              Projects.
            </h1>
          </div>
          {/* 第二行: 描述 */}
          <p className="text-lm text-neutral-400">
            {mockProjects.length} {"projects"} · What I&apos;m working on. Feel free to reach out if you&apos;re interested in collaborating!
          </p>
        </div>
      </div>

      {/* 项目网格 */}
      <div className="grid grid-cols-1 sm:grid-flow-row-dense sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockProjects.map((project) => (
          <ProjectCard
            key={project.id}
            {...project}
            wide={Number(project.id) % 3 === 0}
          />
        ))}
      </div>
    </>
  );
}
