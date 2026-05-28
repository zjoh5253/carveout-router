import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import DealNav from "@/components/nav/DealNav";

type Props = { params: { id: string } };

export default async function LogPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const deal = await prisma.deal.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!deal) notFound();

  const logs = await prisma.routingLog.findMany({
    where: { dealId: params.id },
    include: { contact: true, document: true, rule: true },
    orderBy: { routedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href="/deals" className="text-sm text-brand-600 hover:underline">← Deals</Link>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">{deal.name}</h1>
        </div>
        <DealNav dealId={params.id} active="log" />
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Routing audit log ({logs.length} entries)
        </h2>

        {logs.length === 0 ? (
          <div className="card p-10 text-center text-gray-400">
            No routing events yet. Go to <strong>Rules</strong> to route documents.
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Timestamp</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Contact</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Document</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Rule matched</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {formatDate(log.routedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{log.contact.name}</div>
                      <div className="text-gray-400 text-xs">{log.contact.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{log.document.name}</div>
                      <div className="text-gray-400 text-xs">{log.document.tag}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="tag bg-blue-100 text-blue-700">{log.rule.role}</span>
                      <span className="text-gray-400 text-xs ml-1">→ {log.rule.tags.join(", ")}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
