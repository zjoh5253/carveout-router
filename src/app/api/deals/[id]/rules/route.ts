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

  const rules = await prisma.routingRule.findMany({ where: { dealId: params.id } });
  return NextResponse.json(rules);
}

export async function POST(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deal = await prisma.deal.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json() as { role?: string; tags?: string[] };
  if (!body.role?.trim() || !Array.isArray(body.tags) || body.tags.length === 0) {
    return NextResponse.json({ error: "role and tags[] are required" }, { status: 400 });
  }

  // Upsert — one rule per role per deal
  const existing = await prisma.routingRule.findFirst({
    where: { dealId: params.id, role: body.role.trim() },
  });

  if (existing) {
    const updated = await prisma.routingRule.update({
      where: { id: existing.id },
      data: { tags: body.tags.map((t) => t.toLowerCase().trim()) },
    });
    return NextResponse.json(updated);
  }

  const rule = await prisma.routingRule.create({
    data: {
      role: body.role.trim(),
      tags: body.tags.map((t) => t.toLowerCase().trim()),
      dealId: params.id,
    },
  });

  return NextResponse.json(rule, { status: 201 });
}

export async function DELETE(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deal = await prisma.deal.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = new URL(req.url);
  const ruleId = url.searchParams.get("ruleId");
  if (!ruleId) return NextResponse.json({ error: "ruleId required" }, { status: 400 });

  await prisma.routingRule.delete({ where: { id: ruleId, dealId: params.id } });
  return new NextResponse(null, { status: 204 });
}
