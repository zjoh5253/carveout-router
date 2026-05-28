import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyRoutingRules } from "@/lib/routing-engine";

type Params = { params: { id: string } };

// GET  → preview (dry-run, no writes)
export async function GET(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deal = await prisma.deal.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { contacts: true, documents: true, rules: true },
  });
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const preview = applyRoutingRules(deal.contacts, deal.documents, deal.rules);
  return NextResponse.json({ preview });
}

// POST → apply rules and persist to RoutingLog
export async function POST(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deal = await prisma.deal.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { contacts: true, documents: true, rules: true },
  });
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const results = applyRoutingRules(deal.contacts, deal.documents, deal.rules);

  if (results.length === 0) {
    return NextResponse.json({ message: "No routes matched", logged: 0 });
  }

  await prisma.routingLog.createMany({
    data: results.map((r) => ({
      dealId: params.id,
      contactId: r.contactId,
      documentId: r.documentId,
      ruleId: r.ruleId,
    })),
  });

  return NextResponse.json({ message: "Routing applied", logged: results.length, results });
}
