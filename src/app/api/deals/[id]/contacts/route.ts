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

  const contacts = await prisma.contact.findMany({ where: { dealId: params.id } });
  return NextResponse.json(contacts);
}

export async function POST(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deal = await prisma.deal.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json() as { name?: string; email?: string; role?: string };
  if (!body.name?.trim() || !body.email?.trim() || !body.role?.trim()) {
    return NextResponse.json({ error: "name, email, and role are required" }, { status: 400 });
  }

  const contact = await prisma.contact.create({
    data: { name: body.name.trim(), email: body.email.trim(), role: body.role.trim(), dealId: params.id },
  });

  return NextResponse.json(contact, { status: 201 });
}

export async function DELETE(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deal = await prisma.deal.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = new URL(req.url);
  const contactId = url.searchParams.get("contactId");
  if (!contactId) return NextResponse.json({ error: "contactId required" }, { status: 400 });

  await prisma.contact.delete({ where: { id: contactId, dealId: params.id } });
  return new NextResponse(null, { status: 204 });
}
