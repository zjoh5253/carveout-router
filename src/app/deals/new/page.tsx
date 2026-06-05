"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function NewDealPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const data = await res.json() as { error?: string };
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    const deal = await res.json() as { id: string };
    router.push(`/deals/${deal.id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href="/deals" className="text-sm text-brand-600 hover:underline">
            ← Back to deals
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create a new deal</h1>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="label">
                Deal name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Corp Acquisition 2024"
                className="input"
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Creating…" : "Create deal"}
              </button>
              <Link href="/deals" className="btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
