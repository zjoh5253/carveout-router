import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DealNav from "@/components/nav/DealNav";
import RuleForm from "@/components/forms/RuleForm";
import RoutingPreview from "@/components/routing/RoutingPreview";

type Props = { params: { id: string } };

export default async function RulesPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const deal = await prisma.deal.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { contacts: true, documents: true, rules: true },
  });

  if (!deal) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href="/deals" className="text-sm text-brand-600 hover:underline">← Deals</Link>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">{deal.name}</h1>
        </div>
        <DealNav dealId={params.id} active="rules" />
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add / update rule</h2>
            <RuleForm dealId={params.id} />
          </div>

          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Rules ({deal.rules.length})
            </h2>
            {deal.rules.length === 0 ? (
              <div className="card p-8 text-center text-gray-400">
                No rules yet. A rule maps a contact role to a set of document tags.
              </div>
            ) : (
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Role</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Gets tags</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {deal.rules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="tag bg-blue-100 text-blue-700">{rule.role}</span>
                        </td>
                        <td className="px-4 py-3 flex flex-wrap gap-1">
                          {rule.tags.map((tag) => (
                            <span key={tag} className="tag bg-gray-100 text-gray-700">
                              {tag}
                            </span>
                          ))}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DeleteRuleButton dealId={params.id} ruleId={rule.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Routing preview & apply</h2>
          <RoutingPreview dealId={params.id} contacts={deal.contacts} documents={deal.documents} rules={deal.rules} />
        </div>
      </main>
    </div>
  );
}

function DeleteRuleButton({ dealId, ruleId }: { dealId: string; ruleId: string }) {
  return (
    <form
      action={async () => {
        "use server";
        const { prisma: db } = await import("@/lib/prisma");
        await db.routingRule.delete({ where: { id: ruleId, dealId } });
        const { revalidatePath } = await import("next/cache");
        revalidatePath(`/deals/${dealId}/rules`);
      }}
    >
      <button type="submit" className="text-red-500 hover:text-red-700 text-xs">
        Delete
      </button>
    </form>
  );
}
