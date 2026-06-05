"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type Tab = "overview" | "contacts" | "documents" | "rules" | "log";

interface DealNavProps {
  dealId: string;
  active: Tab;
}

const tabs: { key: Tab; label: string; href: (id: string) => string }[] = [
  { key: "overview", label: "Overview", href: (id) => `/deals/${id}` },
  { key: "contacts", label: "Contacts", href: (id) => `/deals/${id}/contacts` },
  { key: "documents", label: "Documents", href: (id) => `/deals/${id}/documents` },
  { key: "rules", label: "Rules & Route", href: (id) => `/deals/${id}/rules` },
  { key: "log", label: "Audit Log", href: (id) => `/deals/${id}/log` },
];

export default function DealNav({ dealId, active }: DealNavProps) {
  return (
    <nav className="max-w-5xl mx-auto px-4">
      <div className="flex space-x-1 border-b border-gray-200 -mb-px">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href(dealId)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
              active === tab.key
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
