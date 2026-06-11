"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import { blogApi } from "@/services/api";
import type { Blog, BlogCategory } from "@/types";

// 时间格式化函数
function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

// 分类配置
const categoryConfig: Record<BlogCategory, { bg: string; text: string; label: string }> = {
  Tech: { bg: "bg-blue-400/40", text: "text-blue-900", label: "Tech" },
  Emotion: { bg: "bg-pink-400/40", text: "text-pink-900", label: "Emotion" },
  Diary: { bg: "bg-amber-400/40", text: "text-amber-900", label: "Diary" },
  Question: { bg: "bg-purple-400/40", text: "text-purple-900", label: "Question" },
};

export default function BlogDetailPage() {
  const params = useParams();
  const blogId = Number(params.id);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, token } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  // 删除博客确认弹窗状态
  const [showDeleteBlogConfirm, setShowDeleteBlogConfirm] = useState(false);

  useEffect(() => {
    if (isNaN(blogId)) {
      router.push("/blogs");
      return;
    }

    blogApi.get(blogId)
      .then(setBlog)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [blogId, router]);

  const handleDeleteBlog = async () => {
    if (!token) return;

    try {
      await blogApi.delete(token, blogId);
      setShowDeleteBlogConfirm(false);
      showToast("Blog deleted successfully", "success");
      router.push("/blogs");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete blog", "error");
    }
  };

  if (isLoading) {
    return <p className="text-neutral-500">Loading...</p>;
  }

  if (!blog) {
    return <p className="text-neutral-500">Blog not found</p>;
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Link
            href="/blogs"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 transition-colors hover:bg-neutral-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-neutral-600">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
          </Link>
          <h1 className="font-sans text-2xl font-medium text-neutral-900 md:text-3xl">
            {blog.title}
          </h1>
        </div>
        {/* 博客元信息：分类标签 + 作者 + 时间 */}
        <div className="flex items-center gap-3 text-sm">
          <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium shadow-inset-skeuo ${categoryConfig[blog.category]?.bg} ${categoryConfig[blog.category]?.text}`}>
            {categoryConfig[blog.category]?.label}
          </span>
          <span className="text-neutral-400">by {blog.author_username}</span>
          <span className="text-neutral-300">·</span>
          <span className="text-neutral-500">{formatTimeAgo(blog.created_at)}</span>
          <span className="text-neutral-300">·</span>
          <span className="text-neutral-500">{blog.view_count} views</span>
        </div>
        {/* Subtitle */}
        {blog.subtitle && (
          <p className="text-lg text-neutral-600">{blog.subtitle}</p>
        )}
      </div>

      <div className="mx-auto max-w-3xl">
        {/* Blog Content */}
        <article className="rounded-lg border border-neutral-200 bg-white/70 p-6">
          <article className="prose max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{blog.content}</ReactMarkdown>
          </article>

          {user?.role === "blogger" && (
            <div className="mt-6 border-t border-neutral-200 pt-4">
              <Link
                href={`/blogs/${blogId}/edit`}
                className="text-sm text-blue-500 hover:underline"
              >
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteBlogConfirm(true)}
                className="ml-4 text-sm text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          )}
        </article>
      </div>

      {/* 删除博客确认弹窗 */}
      <ConfirmDialog
        open={showDeleteBlogConfirm}
        title="Delete Blog"
        message="Are you sure you want to delete this blog? This action cannot be undone."
        onConfirm={handleDeleteBlog}
        onCancel={() => setShowDeleteBlogConfirm(false)}
        confirmText="Delete"
        confirmClassName="bg-red-600 hover:bg-red-700"
      />
    </>
  );
}
