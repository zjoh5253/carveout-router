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

  const documents = await prisma.document.findMany({ where: { dealId: params.id } });
  return NextResponse.json(documents);
}

export async function POST(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deal = await prisma.deal.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json() as { name?: string; tag?: string; fileRef?: string };
  if (!body.name?.trim() || !body.tag?.trim()) {
    return NextResponse.json({ error: "name and tag are required" }, { status: 400 });
  }

  const document = await prisma.document.create({
    data: {
      name: body.name.trim(),
      tag: body.tag.trim().toLowerCase(),
      fileRef: body.fileRef?.trim() ?? `ref:${Date.now()}`,
      dealId: params.id,
    },
  });

  return NextResponse.json(document, { status: 201 });
}

export async function DELETE(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deal = await prisma.deal.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = new URL(req.url);
  const documentId = url.searchParams.get("documentId");
  if (!documentId) return NextResponse.json({ error: "documentId required" }, { status: 400 });

  await prisma.document.delete({ where: { id: documentId, dealId: params.id } });
  return new NextResponse(null, { status: 204 });
}
