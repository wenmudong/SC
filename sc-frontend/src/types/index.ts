// 用户类型
export type UserRole = "blogger" | "user" | "admin";
export type UserLanguage = "en" | "zh";

export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url: string | null;
  language: UserLanguage;
  role: UserRole;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

// 博客类型
export interface Blog {
  id: number;
  author_id: number;
  author_username: string;  // 作者用户名
  title: string;
  subtitle: string | null;
  content: string;
  category: BlogCategory;
  view_count: number;  // 阅读量
  created_at: string;
  updated_at: string;
}

export type BlogCategory = "Tech" | "Emotion" | "Diary" | "Question";

export interface BlogListItem {
  id: number;
  title: string;
  subtitle: string | null;
  content: string;  // 正文内容
  author_id: number;
  author_username: string;
  category: BlogCategory;
  view_count: number;  // 阅读量
  created_at: string;
  updated_at: string;
}

// Hobby 类型
export type { Hobby, TagColor, ImageLayout, Tag, ImageConfig, LinkConfig } from "./hobby";

// 项目类型（Projects 页面卡片）
export interface Project {
  id: string;
  title: string;
  linkUrl?: string;
  coverUrl?: string;
  category?: string;
}

// 系统配置类型
export interface SystemConfig {
  id: number;
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}
