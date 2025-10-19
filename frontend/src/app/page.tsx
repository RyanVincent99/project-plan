"use client";
import { useEffect, useState } from "react";

interface Post {
  id: number;
  platform: string;
  content: string;
  status: string;
}

export default function Page() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [platform, setPlatform] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  async function fetchPosts() {
    try {
      const res = await fetch(`${API_BASE}/api/posts`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!platform || !content) return alert("Please fill in all fields.");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, content, status }),
      });

      if (!res.ok) throw new Error("Failed to add post");

      const newPost = await res.json();
      setPosts([...posts, newPost]);
      setPlatform("");
      setContent("");
      setStatus("draft");
    } catch (err) {
      console.error(err);
      alert("Error adding post.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Project Plan</h1>

      {/* Add New Post Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-8 p-4 border rounded-lg shadow-sm bg-white"
      >
        <h2 className="text-xl font-semibold mb-4">Add New Post</h2>

        <div className="mb-4">
          <label className="block mb-1">Platform</label>
          <input
            type="text"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            placeholder="e.g. Twitter, Facebook"
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full border p-2 rounded"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Add Post"}
        </button>
      </form>

      {/* Posts List */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
        <h2 className="text-xl font-semibold mb-4">All Posts</h2>
        {posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          <ul>
            {posts.map((p) => (
              <li
                key={p.id}
                className="border-b py-2 flex flex-col sm:flex-row sm:justify-between"
              >
                <span>
                  <strong>{p.platform}</strong>: {p.content}
                </span>
                <span className="text-sm text-gray-500">({p.status})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
