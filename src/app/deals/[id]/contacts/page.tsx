import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DealNav from "@/components/nav/DealNav";
import ContactForm from "@/components/forms/ContactForm";

type Props = { params: { id: string } };

export default async function ContactsPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const deal = await prisma.deal.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { contacts: { orderBy: { name: "asc" } } },
  });

  if (!deal) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href="/deals" className="text-sm text-brand-600 hover:underline">← Deals</Link>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">{deal.name}</h1>
        </div>
        <DealNav dealId={params.id} active="contacts" />
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add contact</h2>
          <ContactForm dealId={params.id} />
        </div>

        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Contacts ({deal.contacts.length})
          </h2>
          {deal.contacts.length === 0 ? (
            <div className="card p-8 text-center text-gray-400">No contacts yet.</div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Role</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {deal.contacts.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                      <td className="px-4 py-3 text-gray-500">{c.email}</td>
                      <td className="px-4 py-3">
                        <span className="tag bg-blue-100 text-blue-700">{c.role}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DeleteContactButton dealId={params.id} contactId={c.id} />
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

function DeleteContactButton({ dealId, contactId }: { dealId: string; contactId: string }) {
  return (
    <form
      action={async () => {
        "use server";
        const { prisma: db } = await import("@/lib/prisma");
        await db.contact.delete({ where: { id: contactId, dealId } });
        const { revalidatePath } = await import("next/cache");
        revalidatePath(`/deals/${dealId}/contacts`);
      }}
    >
      <button type="submit" className="text-red-500 hover:text-red-700 text-xs">
        Remove
      </button>
    </form>
  );
}
