"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import { blogApi, commentApi } from "@/services/api";
import type { Blog, CommentTree, BlogCategory } from "@/types";

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
  const [comments, setComments] = useState<CommentTree[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const { user, token } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  // 删除博客确认弹窗状态
  const [showDeleteBlogConfirm, setShowDeleteBlogConfirm] = useState(false);
  // 删除评论确认弹窗状态
  const [showDeleteCommentConfirm, setShowDeleteCommentConfirm] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);

  useEffect(() => {
    if (isNaN(blogId)) {
      router.push("/blogs");
      return;
    }

    Promise.all([
      blogApi.get(blogId),
      commentApi.list(blogId),
    ])
      .then(([blogData, commentsData]) => {
        setBlog(blogData);
        setComments(commentsData);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [blogId, router]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newComment.trim()) return;

    try {
      await commentApi.create(token, blogId, newComment.trim());
      const updatedComments = await commentApi.list(blogId);
      setComments(updatedComments);
      setNewComment("");
      showToast("Comment posted successfully", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to post comment", "error");
    }
  };

  const handleSubmitReply = async (parentId: number) => {
    if (!token || !replyContent.trim()) return;

    try {
      await commentApi.create(token, blogId, replyContent.trim(), parentId);
      const updatedComments = await commentApi.list(blogId);
      setComments(updatedComments);
      setReplyContent("");
      setReplyTo(null);
      showToast("Reply posted successfully", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to post reply", "error");
    }
  };

  const handleDeleteComment = async () => {
    if (!token || !deletingCommentId) return;

    try {
      await commentApi.delete(token, blogId, deletingCommentId);
      const updatedComments = await commentApi.list(blogId);
      setComments(updatedComments);
      setShowDeleteCommentConfirm(false);
      setDeletingCommentId(null);
      showToast("Comment deleted successfully", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete comment", "error");
    }
  };

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

  // 滚动到指定评论
  const scrollToComment = (commentId: number) => {
    const element = document.getElementById(`comment-${commentId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // 渲染二级评论（只有博主可以回复，直接显示所有回复）
  const renderSecondLevelComment = (comment: CommentTree, parentComment: CommentTree) => {
    const isOwn = user?.id === comment.author_id;

    return (
      <div key={comment.id} id={`comment-${comment.id}`} className="mt-2 ml-8">
        <div className={`rounded-lg border border-neutral-200 bg-white/30 p-4 ${isOwn ? "mr-8" : ""}`}>
          <div className={`flex items-start gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
            {/* 头像 */}
            {comment.author_avatar ? (
              <img
                src={comment.author_avatar}
                alt={comment.author_username}
                className="h-8 w-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center text-sm shrink-0">
                {comment.author_username.charAt(0).toUpperCase()}
              </div>
            )}
            {/* 内容 */}
            <div className={`flex-1 ${isOwn ? "text-right" : ""}`}>
              <div className={`flex items-center gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
                <span className="font-medium">{comment.author_username}</span>
                <span className="text-sm text-neutral-400">reply to {parentComment.author_username}</span>
                <span className="text-sm text-neutral-500">
                  {formatTimeAgo(comment.created_at)}
                </span>
              </div>
              <p className={`mt-2 text-neutral-700 ${isOwn ? "text-right" : ""}`}>{comment.content}</p>
              <div className={`mt-2 flex gap-4 ${isOwn ? "justify-end" : ""}`}>
                {/* 只有博主可以删除自己的评论 */}
                {(user?.role === "blogger" || user?.id === comment.author_id) && (
                  <button
                    onClick={() => {
                      setDeletingCommentId(comment.id);
                      setShowDeleteCommentConfirm(true);
                    }}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
            {/* 定位到父评论按钮 */}
            <button
              onClick={() => scrollToComment(parentComment.id)}
              className="text-sm text-neutral-400 hover:text-neutral-600 shrink-0"
              title="定位到父评论"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 渲染一级评论
  const renderFirstLevelComment = (comment: CommentTree) => {
    const isOwn = user?.id === comment.author_id;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isBlogger = user?.role === "blogger";

    return (
      <div key={comment.id} id={`comment-${comment.id}`} className="mt-4">
        <div className={`rounded-lg border border-neutral-200 bg-white/50 p-4 ${isOwn ? "ml-8" : ""}`}>
          <div className={`flex items-start gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
            {/* 头像 */}
            {comment.author_avatar ? (
              <img
                src={comment.author_avatar}
                alt={comment.author_username}
                className="h-8 w-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center text-sm shrink-0">
                {comment.author_username.charAt(0).toUpperCase()}
              </div>
            )}
            {/* 内容 */}
            <div className={`flex-1 ${isOwn ? "text-right" : ""}`}>
              <div className="flex items-center gap-2">
                <span className="font-medium">{comment.author_username}</span>
                <span className="text-sm text-neutral-500">
                  {formatTimeAgo(comment.created_at)}
                </span>
              </div>
              <p className={`mt-2 text-neutral-700 ${isOwn ? "text-right" : ""}`}>{comment.content}</p>
              <div className={`mt-2 flex gap-4 ${isOwn ? "justify-end" : ""}`}>
                {/* 只有博主可以回复 */}
                {isBlogger && (
                  <button
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Reply
                  </button>
                )}
                {/* 自己或博主可以删除 */}
                {(user?.role === "blogger" || user?.id === comment.author_id) && (
                  <button
                    onClick={() => {
                      setDeletingCommentId(comment.id);
                      setShowDeleteCommentConfirm(true);
                    }}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 回复输入框（只有博主可见） */}
          {replyTo === comment.id && isBlogger && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Reply to ${comment.author_username}...`}
                className="flex-1 rounded border border-neutral-300 px-3 py-2 text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleSubmitReply(comment.id)}
              />
              <button
                onClick={() => handleSubmitReply(comment.id)}
                className="rounded bg-neutral-900 px-3 py-1 text-sm text-white"
              >
                Send
              </button>
            </div>
          )}
        </div>

        {/* 渲染所有二级评论 */}
        {hasReplies && comment.replies!.map((reply) => (
          renderSecondLevelComment(reply, comment)
        ))}
      </div>
    );
  };

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

        {/* Comments Section */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-medium">Comments</h2>

          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full rounded border border-neutral-300 p-3 font-sans"
                rows={3}
              />
              <button
                type="submit"
                className="mt-2 rounded bg-neutral-900 px-4 py-2 text-white"
              >
                Post Comment
              </button>
            </form>
          ) : (
            <p className="mb-6 text-neutral-500">
              <Link href="/auth/login" className="text-blue-500 hover:underline">Login</Link> to leave a comment
            </p>
          )}

          <div className="space-y-4">
            {comments.map((comment) => renderFirstLevelComment(comment))}
          </div>

          {comments.length === 0 && (
            <p className="text-neutral-400">No comments yet. Be the first to comment!</p>
          )}
        </div>
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

      {/* 删除评论确认弹窗 */}
      <ConfirmDialog
        open={showDeleteCommentConfirm}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        onConfirm={handleDeleteComment}
        onCancel={() => {
          setShowDeleteCommentConfirm(false);
          setDeletingCommentId(null);
        }}
        confirmText="Delete"
        confirmClassName="bg-red-600 hover:bg-red-700"
      />
    </>
  );
}
