import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

async function requireOwnedDeal(dealId: string, userId: string) {
  const deal = await prisma.deal.findFirst({ where: { id: dealId, userId } });
  return deal;
}

export async function GET(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deal = await prisma.deal.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      contacts: true,
      documents: true,
      rules: true,
      _count: { select: { logs: true } },
    },
  });

  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(deal);
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deal = await requireOwnedDeal(params.id, session.user.id);
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json() as { name?: string };
  const updated = await prisma.deal.update({
    where: { id: params.id },
    data: { name: body.name?.trim() ?? deal.name },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deal = await requireOwnedDeal(params.id, session.user.id);
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.deal.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
