import { notFound } from "next/navigation";

async function getPost(id: string) {
  try {
    const res = await fetch(`http://localhost:3000/api/public/post?id=${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.log("API failed:", res.status);
      return null;
    }

    return res.json();
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
}

export default async function PublicPost({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);

  // 🔥 TEMP DEBUG (remove later)
  if (!post) {
    return <div style={{ padding: 40 }}>❌ Post not found or API failed</div>;
  }

  return (
  <div
    style={{
      minHeight: "100vh",
      background: "#f5f7fb",
      padding: "40px 16px",
      display: "flex",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: 650,
        background: "#ffffff",
        borderRadius: 16,
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        padding: 24,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Author */}
      <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  }}
>
  {/* Avatar */}
  <div
    style={{
      width: 42,
      height: 42,
      borderRadius: "50%",
      background: "linear-gradient(135deg,#7c3aed,#a855f7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontWeight: 700,
      fontSize: 14,
    }}
  >
    {post.username?.charAt(0).toUpperCase()}
  </div>

  {/* User Info */}
  <div>
    <div style={{ fontSize: 14, fontWeight: 600 }}>
      Posted by <b>{post.username}</b>
    </div>
  </div>
</div>

      {/* Title */}
      {post.title && (
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 10,
            lineHeight: 1.4,
          }}
        >
          {post.title}
        </h2>
      )}

      {/* Content */}
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: "#444",
          whiteSpace: "pre-wrap",
          marginBottom: 16,
        }}
      >
        {post.content}
      </p>

      {/* Image */}
      {post.image_path && (
        <img
          src={post.image_path}
          style={{
            width: "100%",
            borderRadius: 12,
            marginTop: 10,
            objectFit: "cover",
            maxHeight: 400,
          }}
        />
      )}

      
      </div>
    </div>

);
}