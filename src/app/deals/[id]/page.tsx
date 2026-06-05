import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import DealNav from "@/components/nav/DealNav";

type Props = { params: { id: string } };

export default async function DealPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const deal = await prisma.deal.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      contacts: true,
      documents: true,
      rules: true,
      _count: { select: { logs: true } },
    },
  });

  if (!deal) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link href="/deals" className="text-sm text-brand-600 hover:underline">
              ← Deals
            </Link>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">{deal.name}</h1>
          </div>
          <span className="text-sm text-gray-400">{formatDate(deal.createdAt)}</span>
        </div>
        <DealNav dealId={params.id} active="overview" />
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Contacts", value: deal.contacts.length, href: `/deals/${params.id}/contacts` },
            { label: "Documents", value: deal.documents.length, href: `/deals/${params.id}/documents` },
            { label: "Rules", value: deal.rules.length, href: `/deals/${params.id}/rules` },
            { label: "Log entries", value: deal._count.logs, href: `/deals/${params.id}/log` },
          ].map((stat) => (
            <Link key={stat.label} href={stat.href} className="card p-5 hover:border-brand-500 transition-colors">
              <div className="text-3xl font-bold text-brand-600">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </Link>
          ))}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href={`/deals/${params.id}/contacts`} className="btn-secondary">
              Manage contacts
            </Link>
            <Link href={`/deals/${params.id}/documents`} className="btn-secondary">
              Manage documents
            </Link>
            <Link href={`/deals/${params.id}/rules`} className="btn-secondary">
              Configure rules
            </Link>
            <Link href={`/deals/${params.id}/rules`} className="btn-primary">
              Route documents →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
