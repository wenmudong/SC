// 标签颜色
export type TagColor = "lime" | "indigo" | "orange" | "sky" | "purple" | "green" | "amber";

// 标签
export interface Tag {
  label: string;
  color?: TagColor;
}

// 图片布局类型
export type ImageLayout = "background" | "slide" | "fill";

// 图片配置
export interface ImageConfig {
  src: string;
  alt: string;
  layout: ImageLayout;
}

// 链接配置
export interface LinkConfig {
  url: string;
  external?: boolean;
}

// 统一的卡片 Props
export interface Hobby {
  type: string; // 业务标识类型
  id: string;
  category?: string; // 分类标签，如 "Tech" / "Game"
  prefix?: string; // 前缀，如 "Projects ·" / "Hobbies ·"
  tags?: Tag[]; // 标签数组
  title?: string; // 主标题
  subtitle?: string; // 副标题
  description?: string; // 描述
  image?: ImageConfig; // 图片配置
  link?: LinkConfig; // 链接配置
  wide?: boolean; // 是否跨两列
}
