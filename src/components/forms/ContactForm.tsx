"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const COMMON_ROLES = ["Buyer", "Advisor", "Lender", "Counsel", "Investor"];

interface ContactFormProps {
  dealId: string;
}

export default function ContactForm({ dealId }: ContactFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const effectiveRole = role === "__custom__" ? customRole : role;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/deals/${dealId}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role: effectiveRole }),
    });

    if (!res.ok) {
      const data = await res.json() as { error?: string };
      setError(data.error ?? "Failed to add contact");
      setLoading(false);
      return;
    }

    setName("");
    setEmail("");
    setRole("");
    setCustomRole("");
    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 space-y-3">
      <div>
        <label className="label">Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Smith"
          className="input"
        />
      </div>

      <div>
        <label className="label">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@example.com"
          className="input"
        />
      </div>

      <div>
        <label className="label">Role</label>
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
          <option value="__custom__">Custom…</option>
        </select>
      </div>

      {role === "__custom__" && (
        <div>
          <label className="label">Custom role</label>
          <input
            type="text"
            required
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            placeholder="e.g. Franchisor"
            className="input"
          />
        </div>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Adding…" : "Add contact"}
      </button>
    </form>
  );
}
