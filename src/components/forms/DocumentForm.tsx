"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const COMMON_TAGS = ["financials", "legal", "operations", "hr", "tax", "environmental"];

interface DocumentFormProps {
  dealId: string;
}

export default function DocumentForm({ dealId }: DocumentFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [fileRef, setFileRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const effectiveTag = tag === "__custom__" ? customTag : tag;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/deals/${dealId}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, tag: effectiveTag, fileRef: fileRef || undefined }),
    });

    if (!res.ok) {
      const data = await res.json() as { error?: string };
      setError(data.error ?? "Failed to add document");
      setLoading(false);
      return;
    }

    setName("");
    setTag("");
    setCustomTag("");
    setFileRef("");
    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 space-y-3">
      <div>
        <label className="label">Document name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Q3 2024 P&L Statement"
          className="input"
        />
      </div>

      <div>
        <label className="label">Tag (category)</label>
        <select
          required
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="input"
        >
          <option value="">Select tag…</option>
          {COMMON_TAGS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
          <option value="__custom__">Custom…</option>
        </select>
      </div>

      {tag === "__custom__" && (
        <div>
          <label className="label">Custom tag</label>
          <input
            type="text"
            required
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            placeholder="e.g. insurance"
            className="input"
          />
        </div>
      )}

      <div>
        <label className="label">File reference (optional)</label>
        <input
          type="text"
          value={fileRef}
          onChange={(e) => setFileRef(e.target.value)}
          placeholder="e.g. gdrive://folder/file.pdf"
          className="input"
        />
        <p className="text-xs text-gray-400 mt-1">URL, path, or any identifier for this file.</p>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Adding…" : "Add document"}
      </button>
    </form>
  );
}
