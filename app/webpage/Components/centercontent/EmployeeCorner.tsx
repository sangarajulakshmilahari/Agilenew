"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Trophy, Flame, Medal } from "lucide-react";

/* ─────────────────────── TYPES ─────────────────────── */

type PostCategory = "update" | "blog" | "tech" | "photography" | "announcement";

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
  category: PostCategory;
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

type FilterKey = PostCategory | "all";

type CategoryConfig = { label: string; color: string; bg: string };

/* ─────────────────────── DATA ─────────────────────── */

const CATEGORIES: Record<string, CategoryConfig> = {
  all: { label: "All Posts", color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
  update: { label: "Update", color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
  blog: { label: "Blog", color: "#0ea5e9", bg: "rgba(14,165,233,0.1)" },
  tech: { label: "Tech", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  photography: {
    label: "Photography",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
  },
  announcement: {
    label: "Announcement",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
  },
};

/* ── SVG Icons ── */

const Heart = ({ filled }: { filled: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill={filled ? "#ef4444" : "none"}
    stroke={filled ? "#ef4444" : "currentColor"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
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
    fill={filled ? "#7c3aed" : "none"}
    stroke={filled ? "#7c3aed" : "currentColor"}
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
  const [filter, setFilter] = useState<FilterKey>("all");
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [composing, setComposing] = useState(false);
  const [postText, setPostText] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postCat, setPostCat] = useState<PostCategory>("update");
  const [catOpen, setCatOpen] = useState(false);
  const [catPos, setCatPos] = useState({ top: 0, left: 0 });
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const taRef = useRef<HTMLTextAreaElement>(null);
  const catBtnRef = useRef<HTMLButtonElement>(null);
  const [images, setImages] = useState<File[]>([]);
  const [user, setUser] = useState<any>(null);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [showRepliesMap, setShowRepliesMap] = useState<Record<string, boolean>>(
    {},
  );

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleCatToggle = () => {
    if (catBtnRef.current) {
      const rect = catBtnRef.current.getBoundingClientRect();
      setCatPos({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
    setCatOpen(!catOpen);
  };

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
    const handleClickOutside = () => {
      if (catOpen) setCatOpen(false);
    };
    if (catOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [catOpen]);

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
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const res = await fetch("/api/ec/posts/feed");
    const data = await res.json();

    const mapComments = (comments: any[]): any[] =>
      comments.map((c) => ({
        id: c.id,
        name: c.name,
        initials: getInitials(c.name),
        gradient: "linear-gradient(135deg,#7c3aed,#a855f7)",
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
      gradient: "linear-gradient(135deg,#7c3aed,#a855f7)",
      role: "",
      category: p.category,
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
    formData.append("category", postCat);
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

    fetchPosts();
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
  };

  const toggleComments = (id: string) =>
    setOpenComments((p: Record<string, boolean>) => ({ ...p, [id]: !p[id] }));

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
  </div>

  <p className="li-comment-text">{comment.text}</p>
</div>

          {/* Action row: Like 1 | Reply 1 — exactly like LinkedIn */}
          <div className="li-comment-actions">
            {/* Like button: shows "Like" text when 0, or "👍 N" when liked/has likes */}
            <button
              className={`li-action-btn${comment.liked ? " li-liked" : ""}`}
              onClick={() => toggleCommentLike(postId, comment.id)}
            >
              {comment.likes > 0 ? (
                <>
                  <Heart filled={comment.liked} />
                  <span className="li-action-count">{comment.likes}</span>
                </>
              ) : (
                <span className="li-action-label">Like</span>
              )}
            </button>

            <span className="li-action-sep">|</span>

            <button
              className={`li-action-btn${replyTo === comment.id ? " li-active" : ""}`}
              onClick={() =>
                setReplyTo(replyTo === comment.id ? null : comment.id)
              }
            >
              <span className="li-action-label">Reply</span>
              {comment.replies && comment.replies.length > 0 && (
                <span className="li-action-count">
                  {comment.replies.length}
                </span>
              )}
            </button>

            {comment.replies && comment.replies.length > 0 && (
              <>
                <span className="li-action-sep">·</span>
                <button
                  className="li-action-btn li-replies-toggle"
                  onClick={toggleReplies}
                >
                  {repliesOpen
                    ? "Hide replies"
                    : `${comment.replies.length} ${comment.replies.length === 1 ? "reply" : "replies"}`}
                </button>
              </>
            )}
          </div>

          {/* Reply input */}
          {replyTo === comment.id && (
            <div className="li-reply-input-row">
              <Avatar
                initials={getInitials(user?.username || "U")}
                gradient="linear-gradient(135deg,#7c3aed,#a855f7)"
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

  const handleShare = (postId: string) => {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url);
    alert("🔗 Link copied! You can share it anywhere.");
  };

  const filtered = showBookmarked
    ? posts.filter((p) => p.saved)
    : filter === "all"
      ? posts
      : posts.filter((p) => p.category === filter);

  const bookmarkedCount = posts.filter((p) => p.saved).length;

  const getRankIcon = (index: number) => {
    if (index === 0) return <Medal size={16} color="#f59e0b" />;
    if (index === 1) return <Medal size={16} color="#9ca3af" />;
    if (index === 2) return <Medal size={16} color="#b45309" />;
    return <span className="rank-number">{index + 1}</span>;
  };

  return (
    <>
      <div className="ec-wrapper">
        {/* ═══ FEED ═══ */}
        <div className="ec-feed">
          {/* Compose */}
          <div className="ec-card" style={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Avatar
                initials={getInitials(user?.username || "U")}
                gradient="linear-gradient(135deg,#7c3aed,#a855f7)"
              />
              {!composing ? (
                <button
                  className="compose-trigger"
                  onClick={() => setComposing(true)}
                >
                  What&apos;s on your mind? Share a post, blog, or update…
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
                    placeholder="Title (optional — for blogs & articles)"
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
                      <div style={{ position: "relative" }}>
                        <button
                          ref={catBtnRef}
                          className="cat-toggle"
                          onClick={handleCatToggle}
                          style={{
                            color: CATEGORIES[postCat].color,
                            background: CATEGORIES[postCat].bg,
                          }}
                        >
                          {CATEGORIES[postCat].label}
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                      </div>
                      {catOpen &&
                        createPortal(
                          <div
                            className="cat-dropdown"
                            style={{
                              position: "fixed",
                              top: `${catPos.top}px`,
                              left: `${catPos.left}px`,
                              zIndex: 100000,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {(Object.keys(CATEGORIES) as string[])
                              .filter((k) => k !== "all")
                              .map((k) => {
                                const cfg = CATEGORIES[k];
                                return (
                                  <button
                                    key={k}
                                    className={`cat-option ${postCat === k ? "selected" : ""}`}
                                    onClick={() => {
                                      setPostCat(k as PostCategory);
                                      setCatOpen(false);
                                    }}
                                    style={{ color: cfg.color }}
                                  >
                                    <span
                                      className="cat-dot"
                                      style={{ background: cfg.color }}
                                    />
                                    {cfg.label}
                                  </button>
                                );
                              })}
                          </div>,
                          document.body,
                        )}
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
            {(Object.keys(CATEGORIES) as FilterKey[]).map((k) => {
              const cfg = CATEGORIES[k];
              const isActive = filter === k && !showBookmarked;
              return (
                <button
                  key={k}
                  className={`filter-btn ${isActive ? "active" : ""}`}
                  onClick={() => {
                    setFilter(k);
                    setShowBookmarked(false);
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
          {filtered.length === 0 ? (
            <div className="ec-card empty-feed">
              <div className="empty-content">
                <div className="empty-icon-wrapper">
                  <PencilIcon />
                </div>
                <p className="empty-title">
                  {showBookmarked
                    ? "No bookmarked posts yet"
                    : "No posts yet. Be the first to share!"}
                </p>
                <p className="empty-subtitle">
                  {showBookmarked
                    ? "Bookmark posts you want to revisit later"
                    : "Start a conversation — your team is listening"}
                </p>
              </div>
            </div>
          ) : (
            filtered.map((post) => (
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
                      <span
                        className="category-badge"
                        style={{
                          color: CATEGORIES[post.category].color,
                          background: CATEGORIES[post.category].bg,
                        }}
                      >
                        {CATEGORIES[post.category].label}
                      </span>
                    </div>
                    <span className="post-time">{post.time}</span>
                  </div>
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
                    <Heart filled={post.liked} />
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
                    onClick={() => handleShare(post.id)}
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
                        gradient="linear-gradient(135deg,#7c3aed,#a855f7)"
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
            ))
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
                className={`view-bookmarks-btn ${showBookmarked ? "active" : ""}`}
                onClick={() => {
                  setShowBookmarked(!showBookmarked);
                  if (!showBookmarked) setFilter("all");
                }}
              >
                {showBookmarked
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
                    gradient="linear-gradient(135deg,#7c3aed,#a855f7)"
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
        .ec-feed {
          flex: 1 1 0%;
          min-width: 0;
          width: calc(100% - 344px);
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-height: calc(100vh - 128px);
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
          border-color: #c4b5fd;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.06);
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
        .cat-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .cat-dropdown {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 6px;
          min-width: 160px;
        }
        .cat-option {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border: none;
          background: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .cat-option:hover {
          background: rgba(0, 0, 0, 0.04);
        }
        .cat-option.selected {
          background: rgba(124, 58, 237, 0.1);
        }
        .cat-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
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
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          border: none;
          color: white;
          box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
        }
        .post-btn:hover {
          background: linear-gradient(135deg, #6d28d9, #9333ea);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
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
        .category-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }
        .post-time {
          font-size: 12px;
          color: #94a3b8;
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

.comments-section {
  padding: 20px;
  background: #f8fafc;
  border-top: 1px solid #eef2f7;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ROW */
.comment-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

/* CARD */
.li-comment-card {
  background: white;
  border-radius: 16px;
  padding: 14px 16px;
  border: 1px solid #edf2f7;
  box-shadow: 0 3px 8px rgba(0,0,0,0.05);
  width: 100%;
  transition: all 0.2s ease;
}

.li-comment-card:hover {
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
}

/* NAME */
.li-comment-name {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

/* TEXT */
.li-comment-text {
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
}

/* ACTIONS */
.li-comment-actions {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  padding-left: 4px;
}

.li-action-btn {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
}

.li-action-btn:hover {
  color: #7c3aed;
}

.li-action-btn.li-liked {
  color: #ef4444;
}

/* REPLIES */
.li-replies-thread {
  margin-top: 12px;
  padding-left: 20px;
  border-left: 2px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* INPUT */
.li-new-comment-row {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.li-new-comment-box {
  flex: 1;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 30px;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.li-new-comment-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
}

/* SEND */
.li-send-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg,#7c3aed,#a855f7);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.li-send-btn:hover {
  transform: scale(1.05);
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
          background: rgba(124, 58, 237, 0.04);
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
          background: linear-gradient(
            135deg,
            rgba(124, 58, 237, 0.08),
            rgba(168, 85, 247, 0.12)
          );
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
          background: rgba(124, 58, 237, 0.15);
          color: #7c3aed;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
        }
        .view-bookmarks-btn {
          width: 100%;
          padding: 10px 14px;
          background: rgba(124, 58, 237, 0.08);
          border: 1px solid rgba(124, 58, 237, 0.2);
          border-radius: 8px;
          color: #7c3aed;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .view-bookmarks-btn:hover {
          background: rgba(124, 58, 237, 0.12);
          border-color: rgba(124, 58, 237, 0.3);
        }
        .view-bookmarks-btn.active {
          background: #7c3aed;
          color: white;
          border-color: #7c3aed;
        }

        @media (max-width: 1024px) {
          .ec-sidebar {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
