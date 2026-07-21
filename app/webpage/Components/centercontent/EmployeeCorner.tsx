"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Trophy,
  Flame,
  Medal,
  ThumbsUp,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

/* ─────────────────────── TYPES ─────────────────────── */

type FeedFilterKey =
  | "recent"
  | "mostLiked"
  | "mostDiscussed"
  | "saved"
  | "myPosts";

type CommentType = {
  id: string;
  name: string;
  initials: string;
  gradient: string;
  text: string;
  time: string;
  likes: number;
  liked: boolean;
  replies?: CommentType[];
};

type Post = {
  id: string;
  authorName: string;
  initials: string;
  gradient: string;
  role: string;
  title?: string;
  content: string;
  hasImage?: boolean;
  imagePath?: string;
  time: string;
  likes: number;
  liked: boolean;
  saved: boolean;
  views: number;
  comments: CommentType[];
};

type FeedFilterConfig = { label: string; color: string; bg: string };

type ToastType = "success" | "error";

type ToastMessage = {
  id: number;
  message: string;
  type: ToastType;
};

type SharePopoverState = {
  postId: string;
  url: string;
};

/* ─────────────────────── DATA ─────────────────────── */

const FEED_FILTERS: Record<FeedFilterKey, FeedFilterConfig> = {
  recent: { label: "Recent", color: "#F26522", bg: "rgba(242,101,34,0.14)" },
  mostLiked: {
    label: "Most Liked",
    color: "#1F3A68",
    bg: "rgba(31,58,104,0.14)",
  },
  mostDiscussed: {
    label: "Most Discussed",
    color: "#475569",
    bg: "rgba(71,85,105,0.14)",
  },
  saved: { label: "Saved", color: "#1F3A68", bg: "rgba(31,58,104,0.14)" },
  myPosts: {
    label: "My Posts",
    color: "#F26522",
    bg: "rgba(242,101,34,0.14)",
  },
};

const FEED_MODE_QUERY_MAP: Record<FeedFilterKey, string> = {
  recent: "recent",
  mostLiked: "most-liked",
  mostDiscussed: "most-discussed",
  saved: "saved",
  myPosts: "my-posts",
};

/* ── SVG Icons ── */

const CommentIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const ShareIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
const BookmarkIcon = ({ filled }: { filled: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill={filled ? "#F26522" : "none"}
    stroke={filled ? "#F26522" : "currentColor"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);
const SendSvg = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const ImageSvg = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const CopyIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const BookmarkFolderIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const PencilIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ opacity: 0.3 }}
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

/* ── Avatar ── */
const Avatar = ({
  initials,
  gradient,
  size = 38,
}: {
  initials: string;
  gradient: string;
  size?: number;
}) => (
  <div
    style={{
      width: size,
      height: size,
      minWidth: size,
      borderRadius: "50%",
      background: gradient,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontSize: size * 0.32,
      fontWeight: 700,
      letterSpacing: 0.5,
      flexShrink: 0,
    }}
  >
    {initials}
  </div>
);

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */

export default function EmployeeCorner() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedFilter, setFeedFilter] = useState<FeedFilterKey>("recent");
  const [composing, setComposing] = useState(false);
  const [postText, setPostText] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const taRef = useRef<HTMLTextAreaElement>(null);
  const toastTimersRef = useRef<number[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [user, setUser] = useState<any>(null);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [showRepliesMap, setShowRepliesMap] = useState<Record<string, boolean>>(
    {},
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [sharePopover, setSharePopover] = useState<SharePopoverState | null>(null);
  const sharePopoverRef = useRef<HTMLDivElement | null>(null);
  const [openPostMenuId, setOpenPostMenuId] = useState<string | null>(null);
  const postMenuRef = useRef<HTMLDivElement | null>(null);
  const postMenuButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase();
  };

  const moderatorRoles = new Set(["hr", "management"]);
  const canModerateAnyPost = Array.isArray(user?.roles)
    ? user.roles.some((role: string) => moderatorRoles.has(role.toLowerCase()))
    : false;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const getImagePreviewUrl = (file: File) => {
    return URL.createObjectURL(file);
  };

  const addReply = async (postId: string, parentId: string) => {
    const text = commentTexts[parentId];
    if (!text) return;

    await fetch("/api/ec/posts/comment", {
      method: "POST",
      body: JSON.stringify({
        postId,
        content: text,
        parentId,
      }),
    });

    setCommentTexts((p) => ({ ...p, [parentId]: "" }));
    setReplyTo(null);
    fetchPosts();
  };

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, []);

  useEffect(() => {
    fetch("/api/ec/top-contributors")
      .then((res) => res.json())
      .then((data) => setTopUsers(data))
      .catch((err) => console.error("Top contributors error:", err));
  }, []);

  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = "auto";
      taRef.current.style.height = taRef.current.scrollHeight + "px";
    }
  }, [postText]);

  useEffect(() => {
    return () => {
      toastTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, []);

  useEffect(() => {
    if (!sharePopover) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSharePopover(null);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [sharePopover]);

  useEffect(() => {
    if (!openPostMenuId) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideMenu = postMenuRef.current?.contains(target);
      const clickedMenuButton = Object.values(postMenuButtonRefs.current).some((btn) =>
        btn?.contains(target),
      );

      if (!clickedInsideMenu && !clickedMenuButton) {
        setOpenPostMenuId(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenPostMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openPostMenuId]);

  useEffect(() => {
    fetchPosts(feedFilter);
  }, [feedFilter]);

  const fetchPosts = async (mode: FeedFilterKey = feedFilter) => {
    const res = await fetch(`/api/ec/posts/feed?mode=${FEED_MODE_QUERY_MAP[mode]}`);
    const data = await res.json();

    const mapComments = (comments: any[]): any[] =>
      comments.map((c) => ({
        id: c.id,
        name: c.name,
        initials: getInitials(c.name),
        gradient: "#1F3A68",
        text: c.text,
        time: c.time,
        likes: c.likes || 0,
        liked: c.liked === 1,
        replies: c.replies ? mapComments(c.replies) : [],
      }));

    const formatted = data.map((p: any) => ({
      id: p.id,
      authorName: p.username,
      initials: getInitials(p.username),
      gradient: "#1F3A68",
      role: "",
      title: p.title,
      content: p.content,
      time: new Date(p.created_at).toLocaleString(),
      likes: p.likes,
      liked: p.liked === 1,
      saved: p.saved,
      views: 0,
      comments: mapComments(p.commentsList || []),
      hasImage: p.image_path && p.image_path.trim().length > 0,
      imagePath: p.image_path,
    }));

    setPosts(formatted);
  };

  const handlePost = async () => {
    if (!postText.trim()) return;

    const formData = new FormData();
    formData.append("content", postText);
    formData.append("title", postTitle);

    images.forEach((img) => {
      formData.append("images", img);
    });

    await fetch("/api/ec/posts", {
      method: "POST",
      body: formData,
    });

    setImages([]);
    setPostText("");
    setPostTitle("");
    setComposing(false);

    if (feedFilter !== "recent") {
      setFeedFilter("recent");
      return;
    }

    fetchPosts("recent");
  };

  const toggleLike = async (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? p.likes - 1 : p.likes + 1,
            }
          : p,
      ),
    );

    await fetch("/api/ec/posts/like", {
      method: "POST",
      body: JSON.stringify({ postId: id }),
    });
  };

  const toggleCommentLike = async (postId: string, commentId: string) => {
    const updateComments = (comments: CommentType[]): CommentType[] =>
      comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            liked: !comment.liked,
            likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
          };
        }
        return {
          ...comment,
          replies: comment.replies ? updateComments(comment.replies) : [],
        };
      });

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, comments: updateComments(post.comments) }
          : post,
      ),
    );

    try {
      await fetch("/api/ec/posts/comment/like", {
        method: "POST",
        body: JSON.stringify({ postId, commentId }),
      });
    } catch (error) {
      console.error("Comment like API failed", error);
    }
  };

  const toggleSave = async (id: string) => {
    const res = await fetch("/api/ec/posts/bookmark", {
      method: "POST",
      body: JSON.stringify({ postId: id }),
    });

    const data = await res.json();

    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, saved: data.saved } : p)),
    );

    if (feedFilter === "saved") {
      fetchPosts("saved");
    }
  };

  const toggleComments = (id: string) =>
    setOpenComments((p: Record<string, boolean>) => ({ ...p, [id]: !p[id] }));

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const showToast = (message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message, type }]);

    const timerId = window.setTimeout(() => {
      dismissToast(id);
      toastTimersRef.current = toastTimersRef.current.filter((t) => t !== timerId);
    }, 2600);

    toastTimersRef.current.push(timerId);
  };

  const addComment = async (id: string) => {
    const text = commentTexts[id];
    if (!text) return;

    await fetch("/api/ec/posts/comment", {
      method: "POST",
      body: JSON.stringify({
        postId: id,
        content: text,
        parentId: null,
      }),
    });

    setCommentTexts((p) => ({ ...p, [id]: "" }));
    fetchPosts();
  };

  /* ══════════════════════════════════════════════
     COMMENT ITEM — LinkedIn-style clean threaded
  ══════════════════════════════════════════════ */
  const CommentItem = ({
    comment,
    level = 0,
    postId,
  }: {
    comment: CommentType;
    level?: number;
    postId: string;
  }) => {
    const repliesOpen = showRepliesMap[comment.id] || false;
    const toggleReplies = () =>
      setShowRepliesMap((p) => ({ ...p, [comment.id]: !p[comment.id] }));

    const avatarSize = level === 0 ? 36 : 30;

    return (
      
      <div className="comment-row">
        {/* Avatar column — fixed, never stretches */}
        <div style={{ flexShrink: 0, paddingTop: 2 }}>
          <Avatar
            initials={comment.initials}
            gradient={comment.gradient}
            size={avatarSize}
          />
        </div>

        {/* Right column — everything stacked */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Bubble: name bold, comment text below — no date/time */}
          <div className="li-comment-card">
            <div className="li-comment-header">
              <span className="li-comment-name">{comment.name}</span>
              <span className="li-comment-name-date">· {comment.time}</span>
            </div>

            <p className="li-comment-text">{comment.text}</p>
          </div>

          {/* Action row: Like 1 | Reply 1 — exactly like LinkedIn */}
          <div className="li-comment-actions">
            <span
              className={`li-inline-action${comment.liked ? " li-liked" : ""}`}
              onClick={() => toggleCommentLike(postId, comment.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleCommentLike(postId, comment.id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Like comment"
              title="Like"
            >
              <ThumbsUp
                size={16}
                fill={comment.liked ? "rgba(242,101,34,0.25)" : "none"}
                color={comment.liked ? "#F26522" : "currentColor"}
                strokeWidth={2.1}
              />
              <span>{comment.likes}</span>
            </span>

            <span
              className={`li-inline-reply${replyTo === comment.id ? " li-active" : ""}`}
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setReplyTo(replyTo === comment.id ? null : comment.id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Reply"
              title="Reply"
            >
              Reply
            </span>

            {comment.replies && comment.replies.length > 0 && (
              <span className="li-replies-count">
                · {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
              </span>
            )}
          </div>

          {comment.replies && comment.replies.length > 0 && (
            <div className="li-replies-toggle-row">
              <span
                className={`li-hide-replies-btn ${repliesOpen ? "open" : "closed"}`}
                onClick={toggleReplies}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleReplies();
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={repliesOpen ? "Hide replies" : "View replies"}
                title={repliesOpen ? "Hide replies" : "View replies"}
              >
                {repliesOpen ? "Hide replies" : "View replies"}
              </span>
            </div>
          )}

          {/* Reply input */}
          {replyTo === comment.id && (
            <div className="li-reply-input-row">
              <Avatar
                initials={getInitials(user?.username || "U")}
                gradient="#1F3A68"
                size={28}
              />
              <div className="li-reply-input-box">
                <input
                  type="text"
                  className="li-reply-input"
                  placeholder={`Reply to ${comment.name}…`}
                  value={commentTexts[comment.id] || ""}
                  onChange={(e) =>
                    setCommentTexts((p) => ({
                      ...p,
                      [comment.id]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      addReply(postId, comment.id);
                    }
                  }}
                  autoFocus
                />
                <button
                  className="li-send-btn"
                  onClick={() => addReply(postId, comment.id)}
                  disabled={!commentTexts[comment.id]?.trim()}
                >
                  <SendSvg />
                </button>
              </div>
            </div>
          )}

          {/* Nested replies — indented with thread line */}
          {repliesOpen && comment.replies && comment.replies.length > 0 && (
            <div className="li-replies-thread">
              {comment.replies.map((r) => (
                <CommentItem
                  key={r.id}
                  comment={r}
                  level={level + 1}
                  postId={postId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const openSharePopover = (postId: string) => {
    setOpenPostMenuId(null);
    if (sharePopover?.postId === postId) {
      setSharePopover(null);
      return;
    }

    setSharePopover({
      postId,
      url: `${window.location.origin}/post/${postId}`,
    });
  };

  const handleShare = async () => {
    if (!sharePopover) return;

    try {
      await navigator.clipboard.writeText(sharePopover.url);
      setSharePopover(null);
      showToast("Link copied successfully", "success");
    } catch (error) {
      console.error("Share failed:", error);
      showToast("Unable to copy link. Please try again.", "error");
    }
  };

  const confirmDeletePost = async () => {
    if (!deletePostId) return;

    const targetId = deletePostId;
    const prevPosts = posts;

    setDeletingPostId(targetId);
    setPosts((prev) => prev.filter((p) => p.id !== targetId));
    setDeletePostId(null);

    try {
      const res = await fetch("/api/ec/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: targetId }),
      });

      let responseBody: { error?: string } | null = null;
      try {
        responseBody = await res.json();
      } catch {
        responseBody = null;
      }

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("You do not have permission to delete this post");
        }
        throw new Error(responseBody?.error || "Delete request failed");
      }

      showToast("Post deleted successfully", "success");
    } catch (error) {
      console.error("Delete post failed:", error);
      setPosts(prevPosts);
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to delete post. Please try again.",
        "error",
      );
    } finally {
      setDeletingPostId(null);
    }
  };

  const bookmarkedCount = posts.filter((p) => p.saved).length;

  const getRankIcon = (index: number) => {
    if (index === 0) return <Medal size={16} color="#f59e0b" />;
    if (index === 1) return <Medal size={16} color="#9ca3af" />;
    if (index === 2) return <Medal size={16} color="#b45309" />;
    return <span className="rank-number">{index + 1}</span>;
  };

  return (
    <>
      {sharePopover &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="ec-share-overlay" onClick={() => setSharePopover(null)}>
            <div
              ref={sharePopoverRef}
              className="ec-share-popover"
              role="dialog"
              aria-label="Share this post"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ec-share-title">Share this post</div>
              <div className="ec-share-row">
                <input
                  className="ec-share-link-input"
                  value={sharePopover.url}
                  readOnly
                  onFocus={(e) => e.target.select()}
                  aria-label="Shareable link"
                />
                <button className="ec-share-copy-btn" onClick={handleShare}>
                  <CopyIcon />
                  <span>Copy Link</span>
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {deletePostId &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="ec-delete-overlay"
            onClick={() => {
              if (!deletingPostId) setDeletePostId(null);
            }}
          >
            <div
              className="ec-delete-modal"
              role="dialog"
              aria-label="Delete post confirmation"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="ec-delete-title">Delete Post?</h3>
              <p className="ec-delete-message">
                Are you sure you want to delete this post? This action cannot be undone.
              </p>
              <div className="ec-delete-actions">
                <button
                  className="ec-delete-cancel-btn"
                  onClick={() => setDeletePostId(null)}
                  disabled={Boolean(deletingPostId)}
                >
                  Cancel
                </button>
                <button
                  className="ec-delete-confirm-btn"
                  onClick={confirmDeletePost}
                  disabled={deletingPostId === deletePostId}
                >
                  {deletingPostId === deletePostId ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      <div className="ec-wrapper">
        {/* ═══ FEED ═══ */}
        <div className="ec-feed">
          <div className="ec-toast-stack" aria-live="polite" aria-atomic="true">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={`ec-toast ${toast.type === "error" ? "error" : "success"}`}
                role="status"
              >
                <span className="ec-toast-dot" />
                <span>{toast.message}</span>
              </div>
            ))}
          </div>

          {/* Compose */}
          <div className="ec-card" style={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Avatar
                initials={getInitials(user?.username || "U")}
                gradient="#1F3A68"
              />
              {!composing ? (
                <button
                  className="compose-trigger"
                  onClick={() => setComposing(true)}
                >
                  What&apos;s on your mind? Share an update with your team…
                </button>
              ) : (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <input
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Title"
                    className="compose-title"
                  />
                  <textarea
                    ref={taRef}
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder="Write your post…"
                    rows={3}
                    className="compose-body"
                  />
                  {images.length > 0 && (
                    <div className="image-preview-grid">
                      {images.map((img, idx) => (
                        <div key={idx} className="image-preview-item">
                          <img src={getImagePreviewUrl(img)} alt="Preview" />
                          <button
                            className="remove-image-btn"
                            onClick={() =>
                              setImages(images.filter((_, i) => i !== idx))
                            }
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="compose-toolbar">
                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      <label className="image-upload-btn">
                        <ImageSvg />
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          style={{ display: "none" }}
                        />
                      </label>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="cancel-btn"
                        onClick={() => {
                          setComposing(false);
                          setPostText("");
                          setPostTitle("");
                          setImages([]);
                        }}
                      >
                        Cancel
                      </button>
                      <button className="post-btn" onClick={handlePost}>
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="ec-filters">
            {(Object.keys(FEED_FILTERS) as FeedFilterKey[]).map((k) => {
              const cfg = FEED_FILTERS[k];
              const isActive = feedFilter === k;
              return (
                <button
                  key={k}
                  className={`filter-btn ${isActive ? "active" : ""}`}
                  onClick={() => {
                    setFeedFilter(k);
                  }}
                  style={
                    isActive
                      ? { color: cfg.color, background: cfg.bg }
                      : undefined
                  }
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Posts */}
          {posts.length === 0 ? (
            <div className="ec-card empty-feed">
              <div className="empty-content">
                <div className="empty-icon-wrapper">
                  <PencilIcon />
                </div>
                <p className="empty-title">
                  {feedFilter === "saved"
                    ? "No saved posts yet"
                    : feedFilter === "myPosts"
                      ? "You haven't posted yet"
                      : "No posts yet. Be the first to share!"}
                </p>
                <p className="empty-subtitle">
                  {feedFilter === "saved"
                    ? "Save posts to revisit them quickly"
                    : feedFilter === "myPosts"
                      ? "Create your first post and start a conversation"
                      : "Start a conversation — your team is listening"}
                </p>
              </div>
            </div>
          ) : (
            posts.map((post) => {
              const canDeleteThisPost =
                post.authorName === user?.username || canModerateAnyPost;

              return (
                <div key={post.id} className="ec-card">
                <div className="post-header">
                  <Avatar
                    initials={post.initials}
                    gradient={post.gradient}
                    size={42}
                  />
                  <div className="post-meta">
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span className="author-name">{post.authorName}</span>
                    </div>
                    <span className="post-time">{post.time}</span>
                  </div>

                  {canDeleteThisPost && (
                    <div className="post-menu-wrap">
                      <button
                        className="post-menu-trigger"
                        ref={(el) => {
                          postMenuButtonRefs.current[post.id] = el;
                        }}
                        onClick={() =>
                          setOpenPostMenuId((prev) => (prev === post.id ? null : post.id))
                        }
                        aria-haspopup="menu"
                        aria-expanded={openPostMenuId === post.id}
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {openPostMenuId === post.id && (
                        <div ref={postMenuRef} className="post-menu-dropdown" role="menu">
                          <button
                            className="post-menu-item danger"
                            onClick={() => {
                              setOpenPostMenuId(null);
                              setDeletePostId(post.id);
                            }}
                          >
                            <Trash2 size={14} />
                            <span>Delete Post</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="post-content">
                  {post.title && <h3 className="post-title">{post.title}</h3>}
                  <p
                    style={{
                      fontSize: 13.5,
                      lineHeight: 1.7,
                      color: "var(--text-secondary)",
                      margin: 0,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {post.content}
                  </p>
                  {post.hasImage && post.imagePath && (
                    <img
                      src={post.imagePath}
                      alt="Post"
                      className="post-image"
                    />
                  )}
                </div>

                <div className="post-actions">
                  <button
                    className="action-btn"
                    onClick={() => toggleLike(post.id)}
                  >
                    <ThumbsUp
                      size={16}
                      fill={post.liked ? "rgba(242,101,34,0.25)" : "none"}
                      color={post.liked ? "#F26522" : "currentColor"}
                      strokeWidth={2.1}
                    />
                    <span>{post.likes}</span>
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => toggleComments(post.id)}
                  >
                    <CommentIcon />
                    <span>{post.comments.length}</span>
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => openSharePopover(post.id)}
                    aria-haspopup="dialog"
                    aria-expanded={sharePopover?.postId === post.id}
                  >
                    <ShareIcon />
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => toggleSave(post.id)}
                  >
                    <BookmarkIcon filled={post.saved} />
                  </button>
                </div>

                {/* ── Comments Section ── */}
                {openComments[post.id] && (
                  <div className="comments-section">
                    {/* Existing comments */}
                    {post.comments.length > 0 && (
                      <div className="comments-list">
                        {post.comments.map((c) => (
                          <CommentItem
                            key={c.id}
                            comment={c}
                            postId={post.id}
                          />
                        ))}
                      </div>
                    )}

                    {/* New comment input */}
                    <div className="li-new-comment-row">
                      <Avatar
                        initials={getInitials(user?.username || "U")}
                        gradient="#1F3A68"
                        size={36}
                      />
                      <div className="li-new-comment-box">
                        <input
                          type="text"
                          className="li-new-comment-input"
                          placeholder="Add a comment…"
                          value={commentTexts[post.id] || ""}
                          onChange={(e) =>
                            setCommentTexts((p) => ({
                              ...p,
                              [post.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              addComment(post.id);
                            }
                          }}
                        />
                        <button
                          className="li-send-btn"
                          onClick={() => addComment(post.id)}
                          disabled={!commentTexts[post.id]?.trim()}
                        >
                          <SendSvg />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              );
            })
          )}
        </div>

        {/* ═══ RIGHT SIDEBAR ═══ */}
        <div className="ec-sidebar">
          <div className="ec-panel">
            <div className="panel-header">
              <BookmarkFolderIcon />
              <span>My Bookmarks</span>
              {bookmarkedCount > 0 && (
                <span className="bookmark-count">{bookmarkedCount}</span>
              )}
            </div>
            {bookmarkedCount === 0 ? (
              <div className="panel-empty">No bookmarks yet</div>
            ) : (
              <button
                className={`view-bookmarks-btn ${feedFilter === "saved" ? "active" : ""}`}
                onClick={() => {
                  setFeedFilter((prev) =>
                    prev === "saved" ? "recent" : "saved",
                  );
                }}
              >
                {feedFilter === "saved"
                  ? "← Back to Feed"
                  : `View ${bookmarkedCount} Saved Posts`}
              </button>
            )}
          </div>

          {/* Top Contributors */}
          <div className="ec-panel">
            <div className="panel-header">
              <Trophy size={18} strokeWidth={2} />
              <span>Top Contributors</span>
            </div>
            {topUsers.length === 0 ? (
              <div className="panel-empty">No data available</div>
            ) : (
              topUsers.map((user, index) => (
                <div key={user.userid} className="lb-row">
                  <div className="lb-rank">{getRankIcon(index)}</div>
                  <Avatar
                    initials={getInitials(user.username)}
                    gradient="#1F3A68"
                    size={30}
                  />
                  <div className="lb-info">
                    <div className="lb-name">{user.username}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Trending Topics */}
          <div className="ec-panel">
            <div className="panel-header">
              <Flame size={18} />
              <span>Trending Topics</span>
            </div>
            <div className="panel-empty">No trends yet</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ─── Layout ─── */
        .ec-wrapper {
          display: flex;
          gap: 24px;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          padding: 24px;
          min-height: calc(100vh - 80px);
          align-items: flex-start;
          box-sizing: border-box;
        }

        .ec-toast-stack {
          position: fixed;
          right: 20px;
          bottom: 20px;
          top: auto;
          left: auto;
          z-index: 40;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
        }

        .ec-toast {
          pointer-events: auto;
          min-width: 250px;
          max-width: min(360px, calc(100vw - 32px));
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 12px;
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          background: #1F3A68;
          box-shadow:
            0 12px 24px rgba(31, 58, 104, 0.24),
            0 2px 8px rgba(0, 0, 0, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation:
            toast-slide-in 220ms ease,
            toast-fade-out 220ms ease 2.38s forwards;
          user-select: none;
        }

        .ec-toast.error {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow:
            0 12px 24px rgba(220, 38, 38, 0.25),
            0 2px 8px rgba(0, 0, 0, 0.12);
        }

        .ec-toast-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          flex-shrink: 0;
        }

        @keyframes toast-slide-in {
          from {
            opacity: 0;
            transform: translateY(-8px) translateX(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(0) scale(1);
          }
        }

        @keyframes toast-fade-out {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(-4px) scale(0.98);
          }
        }

        .ec-share-overlay {
          position: fixed;
          inset: 0;
          z-index: 120005;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15, 23, 42, 0.2);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          padding: 16px;
        }

        .ec-share-popover {
          position: fixed;
          z-index: 120010;
          width: min(560px, calc(100vw - 32px));
          background: #ffffff;
          border: 1px solid rgba(31, 58, 104, 0.14);
          border-radius: 14px;
          box-shadow:
            0 16px 32px rgba(31, 58, 104, 0.18),
            0 2px 8px rgba(15, 23, 42, 0.14);
          padding: 12px;
          animation: share-popover-in 170ms ease;
        }

        .ec-share-title {
          font-size: 12px;
          font-weight: 700;
          color: #1F3A68;
          margin-bottom: 8px;
        }

        .ec-share-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .ec-share-link-input {
          flex: 1;
          height: 36px;
          border: 1px solid #ddd6fe;
          background: #faf5ff;
          border-radius: 10px;
          padding: 0 10px;
          font-size: 12px;
          color: #4c1d95;
          outline: none;
        }

        .ec-share-link-input:focus {
          border-color: #F26522;
          box-shadow: 0 0 0 3px rgba(242, 101, 34, 0.2);
        }

        .ec-share-copy-btn {
          height: 36px;
          border: none;
          border-radius: 10px;
          background: #1F3A68;
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .ec-share-copy-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(31, 58, 104, 0.3);
        }

        .ec-share-copy-btn:active {
          transform: translateY(0);
        }

        .ec-delete-overlay {
          position: fixed;
          inset: 0;
          z-index: 120020;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15, 23, 42, 0.26);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          padding: 16px;
          animation: fade-in 180ms ease;
        }

        .ec-delete-modal {
          width: min(460px, calc(100vw - 32px));
          background: #ffffff;
          border: 1px solid rgba(31, 58, 104, 0.14);
          border-radius: 16px;
          box-shadow:
            0 18px 36px rgba(31, 58, 104, 0.22),
            0 2px 8px rgba(15, 23, 42, 0.15);
          padding: 22px;
          animation: modal-in 180ms ease;
        }

        .ec-delete-title {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
        }

        .ec-delete-message {
          margin: 10px 0 0;
          font-size: 14px;
          line-height: 1.6;
          color: #64748b;
        }

        .ec-delete-actions {
          margin-top: 20px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .ec-delete-cancel-btn,
        .ec-delete-confirm-btn {
          height: 38px;
          border-radius: 10px;
          padding: 0 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .ec-delete-cancel-btn {
          background: #f1f5f9;
          color: #475569;
        }

        .ec-delete-cancel-btn:hover {
          background: #e2e8f0;
        }

        .ec-delete-confirm-btn {
          background: #F26522;
          color: #ffffff;
          box-shadow: 0 8px 18px rgba(31, 58, 104, 0.3);
        }

        .ec-delete-confirm-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 24px rgba(242, 101, 34, 0.34);
        }

        .ec-delete-cancel-btn:disabled,
        .ec-delete-confirm-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modal-in {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes share-popover-in {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .ec-feed {
          flex: 1 1 0%;
          min-width: 0;
          width: calc(100% - 344px);
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-height: calc(100vh - 128px);
          position: relative;
        }
        .ec-sidebar {
          width: 320px;
          flex: 0 0 320px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* ─── Card / Panel ─── */
        .ec-card {
          background: white;
          border-radius: 16px;
          box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.06),
            0 1px 2px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.04);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: box-shadow 0.2s ease;
        }
        .ec-card:hover {
          box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.08),
            0 1px 3px rgba(0, 0, 0, 0.06);
        }
        .ec-panel {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.06),
            0 1px 2px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.04);
        }
        .panel-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 14px;
          color: #1e293b;
          margin-bottom: 14px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
        }
        .panel-empty {
          color: #94a3b8;
          font-size: 13px;
          text-align: center;
          padding: 20px 0;
        }

        /* ─── Compose ─── */
        .compose-trigger {
          flex: 1;
          padding: 12px 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          text-align: left;
          color: #94a3b8;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .compose-trigger:hover {
          background: #f1f5f9;
          border-color: #F26522;
          box-shadow: 0 0 0 3px rgba(242, 101, 34, 0.08);
        }
        .compose-title {
          width: 100%;
          padding: 10px 0;
          border: none;
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          outline: none;
        }
        .compose-body {
          width: 100%;
          padding: 0;
          border: none;
          font-size: 14px;
          color: #334155;
          line-height: 1.6;
          resize: none;
          outline: none;
          font-family: inherit;
        }
        .compose-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
        }
        .image-upload-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          color: #64748b;
        }
        .image-upload-btn:hover {
          background: #f1f5f9;
          color: #475569;
        }
        .image-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 8px;
        }
        .image-preview-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
        }
        .image-preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .remove-image-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          border: none;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cancel-btn,
        .post-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .cancel-btn {
          background: #f1f5f9;
          border: none;
          color: #64748b;
        }
        .cancel-btn:hover {
          background: #e2e8f0;
          color: #475569;
        }
        .post-btn {
          background: #F26522;
          border: none;
          color: white;
          box-shadow: 0 2px 8px rgba(31, 58, 104, 0.24);
        }
        .post-btn:hover {
          background: #dc5a1d;
          box-shadow: 0 4px 12px rgba(242, 101, 34, 0.32);
          transform: translateY(-1px);
        }

        /* ─── Filter Tabs ─── */
        .ec-filters {
          display: flex;
          gap: 6px;
          padding: 10px 14px;
          background: white;
          border-radius: 16px;
          box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.06),
            0 1px 2px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.04);
          overflow-x: auto;
        }
        .filter-btn {
          padding: 8px 18px;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .filter-btn:hover {
          background: #f1f5f9;
          color: #475569;
        }
        .filter-btn.active {
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        /* ─── Post ─── */
        .post-header {
          display: flex;
          gap: 12px;
          padding: 16px;
        }
        .post-meta {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .author-name {
          font-weight: 600;
          font-size: 14px;
          color: #1e293b;
        }
        .post-time {
          font-size: 12px;
          color: #94a3b8;
        }
        .post-menu-wrap {
          position: relative;
          margin-left: auto;
        }
        .post-menu-trigger {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .post-menu-trigger:hover {
          background: #f1f5f9;
          color: #475569;
        }
        .post-menu-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          min-width: 170px;
          background: #ffffff;
          border: 1px solid #ede9fe;
          border-radius: 12px;
          box-shadow:
            0 16px 30px rgba(31, 58, 104, 0.16),
            0 2px 8px rgba(15, 23, 42, 0.14);
          padding: 6px;
          z-index: 15;
          animation: menu-in 160ms ease;
        }
        .post-menu-item {
          width: 100%;
          height: 36px;
          border: none;
          background: transparent;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 10px;
          color: #334155;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .post-menu-item:hover {
          background: #f8fafc;
        }
        .post-menu-item.danger {
          color: #dc2626;
        }
        .post-menu-item.danger:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        @keyframes menu-in {
          from {
            opacity: 0;
            transform: translateY(-4px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .post-content {
          padding: 0 16px 16px;
        }
        .post-title {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 8px;
        }
        .post-image {
          width: 50%;
          margin-top: 12px;
          border-radius: 8px;
          margin-left: auto;
          margin-right: auto;
          display: block;
        }
        .post-actions {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
          border-top: 1px solid #f1f5f9;
        }
        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border: none;
          background: transparent;
          border-radius: 8px;
          font-size: 13px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }
        .action-btn:hover {
          background: #f1f5f9;
          color: #475569;
        }

       /* ===============================
   MODERN CLEAN COMMENT UI
=============================== */

:global(.comments-section) {
  padding: 16px;
  background: #ffffff;
  border-top: 1px solid #edf0f3;
}

:global(.comments-list) {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

:global(.comment-row) {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

:global(.li-comment-card) {
  position: relative;
  background: #f1f3f6;
  border-radius: 8px;
  padding: 10px 14px;
  width: 100%;
  border: 1px solid transparent;
}

:global(.li-comment-name) {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

:global(.li-comment-name-date) {
  margin-left: 6px;
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

:global(.li-comment-text) {
  font-size: 14px;
  color: #111827;
  margin: 3px 0 0;
  line-height: 1.45;
}

:global(.li-comment-actions) {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  margin-left: 2px;
  flex-wrap: wrap;
}

:global(.li-comment-time) {
  font-size: 12px;
  color: #64748b;
  margin-right: 2px;
}

:global(.li-inline-action) {
  border: none;
  background: transparent;
  color: #6b7280;
  height: auto;
  min-width: 0;
  padding: 0;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

:global(.li-inline-action:hover) {
  color: #111827;
}

:global(.li-inline-action.li-liked) {
  color: #F26522;
}

:global(.li-inline-reply) {
  border: none;
  background: transparent;
  color: #111827;
  font-size: 13px;
  font-weight: 700;
  padding: 0 2px;
  cursor: pointer;
}

:global(.li-inline-reply.li-active),
:global(.li-inline-reply:hover) {
  color: #F26522;
}

:global(.li-replies-count) {
  font-size: 13px;
  color: #64748b;
}

:global(.li-replies-toggle-row) {
  margin: 8px 0 0 2px;
}

:global(.li-hide-replies-btn) {
  border: none;
  background: transparent;
  color: #475569;
  border-radius: 6px;
  padding: 0;
  min-width: 0;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 2px;
  display: inline-flex;
  align-items: center;
}

:global(.li-hide-replies-btn.closed) {
  color: #3730a3;
}

:global(.li-hide-replies-btn.open) {
  color: #9f1239;
}

:global(.li-hide-replies-btn:hover) {
  text-decoration-color: currentColor;
}

:global(.li-hide-replies-btn.closed:hover) {
  color: #312e81;
}

:global(.li-hide-replies-btn.open:hover) {
  color: #881337;
}

:global(.li-inline-action:focus-visible),
:global(.li-inline-reply:focus-visible),
:global(.li-hide-replies-btn:focus-visible) {
  outline: 2px solid #93c5fd;
  outline-offset: 2px;
}

:global(.li-replies-thread) {
  margin-top: 12px;
  margin-left: 8px;
  padding-left: 10px;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

:global(.li-new-comment-row) {
  display: flex;
  gap: 12px;
  margin-top: 18px;
}

:global(.li-new-comment-box) {
  flex: 1;
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 12px;
  min-height: 44px;
  padding: 0 10px 0 14px;
  border: 1px solid #d7dbe0;
}

:global(.li-new-comment-input) {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #111827;
  background: transparent;
}

:global(.li-reply-input-row) {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

:global(.li-reply-input-box) {
  flex: 1;
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 10px;
  min-height: 40px;
  padding: 0 8px 0 12px;
  border: 1px solid #d7dbe0;
}

:global(.li-reply-input) {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  color: #111827;
  background: transparent;
}

:global(.li-send-btn) {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #ffffff;
  color: #64748b;
  border: 1px solid #d4d8de;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

:global(.li-send-btn:hover) {
  background: #f8fafc;
}
       

        

        /* ─── Sidebar ─── */
        .lb-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 4px;
          border-radius: 8px;
          transition: background 0.2s;
        }
        .lb-row:hover {
          background: rgba(31, 58, 104, 0.06);
        }
        .rank-number {
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
        }
        .lb-info {
          display: flex;
          flex-direction: column;
        }
        .lb-name {
          font-size: 13px;
          font-weight: 700;
        }
        .lb-rank {
          display: flex;
          align-items: center;
        }

        /* ─── Empty state ─── */
        .empty-feed {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }
        .empty-content {
          text-align: center;
          color: #94a3b8;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .empty-icon-wrapper {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(242, 101, 34, 0.14);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }
        .empty-title {
          font-size: 15px;
          font-weight: 600;
          color: #64748b;
          margin: 0;
        }
        .empty-subtitle {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
        }

        /* ─── Bookmark sidebar ─── */
        .bookmark-count {
          margin-left: auto;
          background: rgba(242, 101, 34, 0.15);
          color: #F26522;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
        }
        .view-bookmarks-btn {
          width: 100%;
          padding: 10px 14px;
          background: rgba(242, 101, 34, 0.1);
          border: 1px solid rgba(242, 101, 34, 0.25);
          border-radius: 8px;
          color: #F26522;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .view-bookmarks-btn:hover {
          background: rgba(242, 101, 34, 0.15);
          border-color: rgba(242, 101, 34, 0.32);
        }
        .view-bookmarks-btn.active {
          background: #F26522;
          color: white;
          border-color: #F26522;
        }

        @media (max-width: 1024px) {
          .ec-sidebar {
            display: none;
          }

          .ec-toast-stack {
            bottom: 12px;
            right: 12px;
            left: 12px;
            top: auto;
            align-items: stretch;
          }

          .ec-toast {
            max-width: 100%;
          }

          .ec-share-overlay {
            padding: 12px;
          }

          .ec-share-popover {
            width: calc(100vw - 24px);
          }

          .ec-delete-modal {
            width: calc(100vw - 24px);
            padding: 18px;
          }

          .ec-delete-actions {
            flex-direction: column-reverse;
          }

          .ec-delete-cancel-btn,
          .ec-delete-confirm-btn {
            width: 100%;
          }

          .ec-share-row {
            flex-direction: column;
            align-items: stretch;
          }
        }

        @media (prefers-color-scheme: dark) {
          .ec-wrapper {
            background: #0b1220;
          }

          .ec-card,
          .ec-panel,
          .ec-filters {
            background: #111827;
            border-color: #233047;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.28);
          }

          .panel-header,
          .author-name,
          .post-title,
          .lb-name {
            color: #e5e7eb;
          }

          .panel-empty,
          .post-time,
          .rank-number {
            color: #9ca3af;
          }

          .compose-trigger {
            background: #0f172a;
            border-color: #334155;
            color: #94a3b8;
          }

          .compose-title,
          .compose-body,
          .filter-btn,
          .action-btn {
            color: #d1d5db;
          }

          .filter-btn:hover,
          .action-btn:hover {
            background: #1f2937;
            color: #f3f4f6;
          }

          .post-actions,
          .panel-header,
          .compose-toolbar {
            border-color: #273449;
          }

          :global(.comments-section) {
            background: #0f172a;
            border-top-color: #273449;
          }

          :global(.li-comment-card) {
            background: #111827;
          }

          :global(.li-comment-name),
          :global(.li-comment-text) {
            color: #e5e7eb;
          }

          :global(.li-comment-name-date),
          :global(.li-replies-count) {
            color: #94a3b8;
          }

          :global(.li-inline-action),
          :global(.li-inline-reply) {
            color: #cbd5e1;
          }

          :global(.li-inline-action:hover),
          :global(.li-inline-reply:hover),
          :global(.li-inline-reply.li-active) {
            color: #93c5fd;
          }

          :global(.li-replies-thread) {
            border-left-color: #334155;
          }

          :global(.li-new-comment-box),
          :global(.li-reply-input-box) {
            background: #111827;
            border-color: #334155;
          }

          :global(.li-new-comment-input),
          :global(.li-reply-input) {
            color: #e5e7eb;
          }

          :global(.li-send-btn) {
            background: #1f2937;
            border-color: #334155;
            color: #cbd5e1;
          }

          :global(.li-send-btn:hover) {
            background: #334155;
          }

          :global(.li-hide-replies-btn) {
            background: transparent;
            color: #cbd5e1;
          }

          :global(.li-hide-replies-btn.closed) {
            color: #bfdbfe;
          }

          :global(.li-hide-replies-btn.open) {
            color: #fecdd3;
          }

          :global(.li-hide-replies-btn:hover) {
            text-decoration-color: currentColor;
          }

          .ec-share-popover {
            background: #111827;
            border-color: #374151;
          }

          .ec-delete-modal {
            background: #111827;
            border-color: #374151;
          }

          .ec-delete-title {
            color: #e5e7eb;
          }

          .ec-delete-message {
            color: #94a3b8;
          }

          .ec-share-title {
            color: #f7b596;
          }

          .ec-share-link-input {
            background: #0f172a;
            border-color: #374151;
            color: #e9d5ff;
          }

          .post-menu-trigger {
            color: #cbd5e1;
          }

          .post-menu-trigger:hover {
            background: #1f2937;
            color: #f8fafc;
          }

          .post-menu-dropdown {
            background: #111827;
            border-color: #374151;
          }

          .post-menu-item {
            color: #e5e7eb;
          }

          .post-menu-item:hover {
            background: #1f2937;
          }

          .post-menu-item.danger {
            color: #fca5a5;
          }

          .post-menu-item.danger:hover {
            background: rgba(239, 68, 68, 0.16);
          }
        }

        :global(html[data-theme="dark"]) .ec-wrapper {
          background: #0b1220;
        }

        :global(html[data-theme="dark"]) .ec-card,
        :global(html[data-theme="dark"]) .ec-panel,
        :global(html[data-theme="dark"]) .ec-filters {
          background: #111827;
          border-color: #233047;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.28);
        }

        :global(html[data-theme="dark"]) .panel-header,
        :global(html[data-theme="dark"]) .author-name,
        :global(html[data-theme="dark"]) .post-title,
        :global(html[data-theme="dark"]) .lb-name {
          color: #e5e7eb;
        }

        :global(html[data-theme="dark"]) .panel-empty,
        :global(html[data-theme="dark"]) .post-time,
        :global(html[data-theme="dark"]) .rank-number {
          color: #9ca3af;
        }

        :global(html[data-theme="dark"]) .compose-trigger {
          background: #0f172a;
          border-color: #334155;
          color: #94a3b8;
        }

        :global(html[data-theme="dark"]) .compose-title,
        :global(html[data-theme="dark"]) .compose-body,
        :global(html[data-theme="dark"]) .filter-btn,
        :global(html[data-theme="dark"]) .action-btn {
          color: #d1d5db;
        }

        :global(html[data-theme="dark"]) .filter-btn:hover,
        :global(html[data-theme="dark"]) .action-btn:hover {
          background: #1f2937;
          color: #f3f4f6;
        }

        :global(html[data-theme="dark"]) .post-actions,
        :global(html[data-theme="dark"]) .panel-header,
        :global(html[data-theme="dark"]) .compose-toolbar {
          border-color: #273449;
        }

        :global(html[data-theme="dark"] .comments-section) {
          background: #0f172a;
          border-top-color: #273449;
        }

        :global(html[data-theme="dark"] .li-comment-card) {
          background: #111827;
        }

        :global(html[data-theme="dark"] .li-comment-name),
        :global(html[data-theme="dark"] .li-comment-text) {
          color: #e5e7eb;
        }

        :global(html[data-theme="dark"] .li-comment-name-date),
        :global(html[data-theme="dark"] .li-replies-count) {
          color: #94a3b8;
        }

        :global(html[data-theme="dark"] .li-inline-action),
        :global(html[data-theme="dark"] .li-inline-reply) {
          color: #cbd5e1;
        }

        :global(html[data-theme="dark"] .li-inline-action:hover),
        :global(html[data-theme="dark"] .li-inline-reply:hover),
        :global(html[data-theme="dark"] .li-inline-reply.li-active) {
          color: #93c5fd;
        }

        :global(html[data-theme="dark"] .li-replies-thread) {
          border-left-color: #334155;
        }

        :global(html[data-theme="dark"] .li-new-comment-box),
        :global(html[data-theme="dark"] .li-reply-input-box) {
          background: #111827;
          border-color: #334155;
        }

        :global(html[data-theme="dark"] .li-new-comment-input),
        :global(html[data-theme="dark"] .li-reply-input) {
          color: #e5e7eb;
        }

        :global(html[data-theme="dark"] .li-send-btn) {
          background: #1f2937;
          border-color: #334155;
          color: #cbd5e1;
        }

        :global(html[data-theme="dark"] .li-send-btn:hover) {
          background: #334155;
        }

        :global(html[data-theme="dark"] .li-hide-replies-btn) {
          background: transparent;
          color: #cbd5e1;
        }

        :global(html[data-theme="dark"] .li-hide-replies-btn.closed) {
          color: #bfdbfe;
        }

        :global(html[data-theme="dark"] .li-hide-replies-btn.open) {
          color: #fecdd3;
        }

        :global(html[data-theme="dark"] .li-hide-replies-btn:hover) {
          text-decoration-color: currentColor;
        }

        :global(html[data-theme="dark"]) .ec-share-popover {
          background: #111827;
          border-color: #374151;
        }

        :global(html[data-theme="dark"]) .ec-delete-modal {
          background: #111827;
          border-color: #374151;
        }

        :global(html[data-theme="dark"]) .ec-delete-title {
          color: #e5e7eb;
        }

        :global(html[data-theme="dark"]) .ec-delete-message {
          color: #94a3b8;
        }

        :global(html[data-theme="dark"]) .ec-share-title {
          color: #f7b596;
        }

        :global(html[data-theme="dark"]) .ec-share-link-input {
          background: #0f172a;
          border-color: #374151;
          color: #e9d5ff;
        }

        :global(html[data-theme="dark"]) .post-menu-trigger {
          color: #cbd5e1;
        }

        :global(html[data-theme="dark"]) .post-menu-trigger:hover {
          background: #1f2937;
          color: #f8fafc;
        }

        :global(html[data-theme="dark"]) .post-menu-dropdown {
          background: #111827;
          border-color: #374151;
        }

        :global(html[data-theme="dark"]) .post-menu-item {
          color: #e5e7eb;
        }

        :global(html[data-theme="dark"]) .post-menu-item:hover {
          background: #1f2937;
        }

        :global(html[data-theme="dark"]) .post-menu-item.danger {
          color: #fca5a5;
        }

        :global(html[data-theme="dark"]) .post-menu-item.danger:hover {
          background: rgba(239, 68, 68, 0.16);
        }
      `}</style>
    </>
  );
}
