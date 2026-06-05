import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function DealsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const deals = await prisma.deal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { contacts: true, documents: true, logs: true } } },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Carveout Router</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{session.user.email}</span>
            <Link href="/api/auth/signout" className="btn-secondary text-xs">
              Sign out
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Deals</h2>
          <Link href="/deals/new" className="btn-primary">
            + New deal
          </Link>
        </div>

        {deals.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-500 text-lg">No deals yet.</p>
            <p className="text-gray-400 mt-1 text-sm">Create your first deal to get started.</p>
            <Link href="/deals/new" className="btn-primary mt-4 inline-flex">
              Create deal
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {deals.map((deal) => (
              <Link
                key={deal.id}
                href={`/deals/${deal.id}`}
                className="card p-5 flex items-center justify-between hover:border-brand-500 transition-colors group"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600">
                    {deal.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {deal._count.contacts} contacts · {deal._count.documents} documents ·{" "}
                    {deal._count.logs} log entries
                  </p>
                </div>
                <div className="text-right text-sm text-gray-400">
                  <div>{formatDate(deal.createdAt)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
