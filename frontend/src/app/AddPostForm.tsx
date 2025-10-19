"use client";

import { useState } from "react";

export default function AddPostForm({ onPostAdded }: { onPostAdded?: () => void }) {
  const [platform, setPlatform] = useState("twitter");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:8080/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, content, status }),
      });

      if (response.ok) {
        setMessage("✅ Post added successfully!");
        setContent("");
        onPostAdded?.(); // refresh post list if passed
      } else {
        setMessage("❌ Failed to add post.");
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Error connecting to backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow-sm space-y-3 bg-white">
      <h2 className="text-xl font-semibold">Add New Post</h2>

      <div>
        <label className="block text-sm font-medium">Platform</label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="w-full border rounded px-2 py-1"
        >
          <option value="twitter">Twitter</option>
          <option value="facebook">Facebook</option>
          <option value="linkedin">LinkedIn</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border rounded px-2 py-1"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border rounded px-2 py-1"
        >
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Adding..." : "Add Post"}
      </button>

      {message && <p className="text-sm mt-2">{message}</p>}
    </form>
  );
}
