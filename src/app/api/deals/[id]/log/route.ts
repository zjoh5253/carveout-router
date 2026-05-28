import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deal = await prisma.deal.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const logs = await prisma.routingLog.findMany({
    where: { dealId: params.id },
    include: { contact: true, document: true, rule: true },
    orderBy: { routedAt: "desc" },
  });

  return NextResponse.json(logs);
}
