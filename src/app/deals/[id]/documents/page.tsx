import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DealNav from "@/components/nav/DealNav";
import DocumentForm from "@/components/forms/DocumentForm";

type Props = { params: { id: string } };

const TAG_COLORS: Record<string, string> = {
  financials: "bg-green-100 text-green-700",
  legal: "bg-purple-100 text-purple-700",
  operations: "bg-orange-100 text-orange-700",
  hr: "bg-yellow-100 text-yellow-700",
};

function tagColor(tag: string): string {
  return TAG_COLORS[tag] ?? "bg-gray-100 text-gray-700";
}

export default async function DocumentsPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const deal = await prisma.deal.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { documents: { orderBy: { name: "asc" } } },
  });

  if (!deal) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href="/deals" className="text-sm text-brand-600 hover:underline">← Deals</Link>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">{deal.name}</h1>
        </div>
        <DealNav dealId={params.id} active="documents" />
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add document</h2>
          <DocumentForm dealId={params.id} />
        </div>

        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Documents ({deal.documents.length})
          </h2>
          {deal.documents.length === 0 ? (
            <div className="card p-8 text-center text-gray-400">No documents yet.</div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Tag</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">File ref</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {deal.documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{doc.name}</td>
                      <td className="px-4 py-3">
                        <span className={`tag ${tagColor(doc.tag)}`}>{doc.tag}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono">{doc.fileRef}</td>
                      <td className="px-4 py-3 text-right">
                        <DeleteDocumentButton dealId={params.id} documentId={doc.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function DeleteDocumentButton({ dealId, documentId }: { dealId: string; documentId: string }) {
  return (
    <form
      action={async () => {
        "use server";
        const { prisma: db } = await import("@/lib/prisma");
        await db.document.delete({ where: { id: documentId, dealId } });
        const { revalidatePath } = await import("next/cache");
        revalidatePath(`/deals/${dealId}/documents`);
      }}
    >
      <button type="submit" className="text-red-500 hover:text-red-700 text-xs">
        Remove
      </button>
    </form>
  );
}
