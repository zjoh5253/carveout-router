"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { applyRoutingRules } from "@/lib/routing-engine";
import type { RoutingContact, RoutingDocument, RoutingRule } from "@/lib/routing-engine";

interface RoutingPreviewProps {
  dealId: string;
  contacts: RoutingContact[];
  documents: RoutingDocument[];
  rules: RoutingRule[];
}

export default function RoutingPreview({ dealId, contacts, documents, rules }: RoutingPreviewProps) {
  const router = useRouter();
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState<{ count: number } | null>(null);
  const [error, setError] = useState("");

  const preview = applyRoutingRules(contacts, documents, rules);

  async function handleApply() {
    setApplying(true);
    setError("");
    setApplied(null);

    const res = await fetch(`/api/deals/${dealId}/route-documents`, { method: "POST" });
    if (!res.ok) {
      const data = await res.json() as { error?: string };
      setError(data.error ?? "Failed to apply routing");
      setApplying(false);
      return;
    }

    const data = await res.json() as { logged: number };
    setApplied({ count: data.logged });
    setApplying(false);
    router.refresh();
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">
            Preview: {preview.length} route{preview.length !== 1 ? "s" : ""} matched
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""} ·{" "}
            {documents.length} document{documents.length !== 1 ? "s" : ""} ·{" "}
            {rules.length} rule{rules.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={handleApply}
          disabled={applying || preview.length === 0}
          className="btn-primary"
        >
          {applying ? "Applying…" : "Apply & log routes"}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {applied && (
        <p className="text-green-600 text-sm mb-4">
          ✓ {applied.count} route{applied.count !== 1 ? "s" : ""} logged to the audit trail.
        </p>
      )}

      {preview.length === 0 ? (
        <p className="text-gray-400 text-sm">
          No matches. Make sure contacts have roles, documents have tags, and rules connect them.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 border border-gray-200">
                  Contact
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 border border-gray-200">
                  Role
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 border border-gray-200">
                  Document
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 border border-gray-200">
                  Tag
                </th>
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border border-gray-200">
                    <div className="font-medium text-gray-900">{row.contactName}</div>
                    <div className="text-gray-400 text-xs">{row.contactEmail}</div>
                  </td>
                  <td className="px-3 py-2 border border-gray-200">
                    <span className="tag bg-blue-100 text-blue-700">{row.roleMatched}</span>
                  </td>
                  <td className="px-3 py-2 border border-gray-200 text-gray-700">
                    {row.documentName}
                  </td>
                  <td className="px-3 py-2 border border-gray-200">
                    <span className="tag bg-gray-100 text-gray-700">{row.documentTag}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
