// 后端 API 服务层
import type { User, Token, Blog, BlogListItem, CommentTree, SystemConfig } from "@/types";

// 根据当前访问地址动态推断后端地址，支持 localhost 和局域网 IP 访问
const API_BASE = typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.hostname}:8000/api`
  : "http://localhost:8000/api";

// 401 错误事件名称
export const AUTH_EXPIRED_EVENT = "auth:expired";

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // 401 未授权，触发登录弹窗
  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
    const error = await res.json().catch(() => ({ detail: "请先登录" }));
    throw new Error(error.detail || "请先登录");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `API Error: ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

// Auth API
export const authApi = {
  register: (username: string, email: string, password: string) =>
    request<Token>("/auth/register", {
      method: "POST",
      body: { username, email, password },
    }),

  login: (username: string, password: string) =>
    request<Token>("/auth/login", {
      method: "POST",
      body: { username, password },
    }),

  getMe: (token: string) =>
    request<User>("/auth/me", { token }),
};

// User API
export const userApi = {
  getMe: (token: string) =>
    request<User>("/users/me", { token }),

  updateMe: (token: string, data: { email?: string; avatar_url?: string }) =>
    request<User>("/users/me", {
      method: "PATCH",
      body: data,
      token,
    }),
};

// Blog API
export const blogApi = {
  list: () =>
    request<BlogListItem[]>("/blogs"),

  get: (id: number) =>
    request<Blog>(`/blogs/${id}`),

  create: (token: string, title: string, subtitle: string | undefined, content: string, category: string = "Diary") =>
    request<Blog>("/blogs", {
      method: "POST",
      body: { title, subtitle: subtitle || null, content, category },
      token,
    }),

  update: (token: string, id: number, title: string, subtitle: string | undefined, content: string, category: string) =>
    request<Blog>(`/blogs/${id}`, {
      method: "PUT",
      body: { title, subtitle: subtitle || null, content, category },
      token,
    }),

  delete: (token: string, id: number) =>
    request<void>(`/blogs/${id}`, {
      method: "DELETE",
      token,
    }),
};

// Comment API
export const commentApi = {
  list: (blogId: number) =>
    request<CommentTree[]>(`/blogs/${blogId}/comments`),

  create: (token: string, blogId: number, content: string, parentId?: number) =>
    request<CommentTree>(`/blogs/${blogId}/comments`, {
      method: "POST",
      body: { content, parent_id: parentId },
      token,
    }),

  delete: (token: string, blogId: number, commentId: number) =>
    request<void>(`/blogs/${blogId}/comments/${commentId}`, {
      method: "DELETE",
      token,
    }),
};

// Upload API
export const uploadApi = {
  uploadAvatar: async (token: string, file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/upload/avatar`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(error.detail || `Upload Error: ${res.status}`);
    }

    return res.json();
  },
};

// Admin API
export const adminApi = {
  getAllConfigs: (token: string) =>
    request<{ configs: SystemConfig[]; total: number }>("/admin/config", { token }),

  getConfig: (token: string, key: string) =>
    request<SystemConfig>(`/admin/config/${key}`, { token }),

  createConfig: (token: string, data: { key: string; value: string; description?: string }) =>
    request<SystemConfig>("/admin/config", {
      method: "POST",
      body: data,
      token,
    }),

  updateConfig: (token: string, key: string, data: { value: string; description?: string }) =>
    request<SystemConfig>(`/admin/config/${key}`, {
      method: "PUT",
      body: data,
      token,
    }),

  deleteConfig: (token: string, key: string) =>
    request<void>(`/admin/config/${key}`, {
      method: "DELETE",
      token,
    }),
};

// Compress API
export const compressApi = {
  uploadAndCompress: async (
    token: string,
    files: File[],
    options: {
      quality: number;
      outputFormat: "original" | "webp";
      compressMode: "quality" | "target_size";
      targetSizeKb: number;
    }
  ): Promise<Blob> => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    formData.append("quality", String(options.quality));
    formData.append("output_format", options.outputFormat);
    formData.append("compress_mode", options.compressMode);
    formData.append("target_size_kb", String(options.targetSizeKb));

    const res = await fetch(`${API_BASE}/tools/compress`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
      throw new Error("请先登录");
    }
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "压缩失败" }));
      throw new Error(error.detail || `Error: ${res.status}`);
    }
    return res.blob();
  },
};
