"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const COMMON_ROLES = ["Buyer", "Advisor", "Lender", "Counsel", "Investor"];
const COMMON_TAGS = ["financials", "legal", "operations", "hr", "tax", "environmental"];

interface RuleFormProps {
  dealId: string;
}

export default function RuleForm({ dealId }: RuleFormProps) {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (selectedTags.length === 0) {
      setError("Select at least one tag");
      setLoading(false);
      return;
    }

    const res = await fetch(`/api/deals/${dealId}/rules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, tags: selectedTags }),
    });

    if (!res.ok) {
      const data = await res.json() as { error?: string };
      setError(data.error ?? "Failed to save rule");
      setLoading(false);
      return;
    }

    setSuccess(`Rule saved: ${role} → ${selectedTags.join(", ")}`);
    setRole("");
    setSelectedTags([]);
    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 space-y-4">
      <div>
        <label className="label">Contact role</label>
        <select
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="input"
        >
          <option value="">Select role…</option>
          {COMMON_ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Gets document tags</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {COMMON_TAGS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleTag(t)}
              className={`tag cursor-pointer transition-colors ${
                selectedTags.includes(t)
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Selected: {selectedTags.length > 0 ? selectedTags.join(", ") : "none"}
        </p>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Saving…" : "Save rule"}
      </button>
    </form>
  );
}
