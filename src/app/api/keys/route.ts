import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { maskApiKey } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    select: { id: true, provider: true, keyPreview: true, label: true, isActive: true, createdAt: true },
  });

  return NextResponse.json(keys);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { provider, apiKey, label } = await req.json();

  if (!provider || !apiKey) {
    return NextResponse.json({ error: "Provider et clé API requis" }, { status: 400 });
  }

  const keyPreview = maskApiKey(apiKey);

  await prisma.apiKey.upsert({
    where: { userId_provider: { userId: session.user.id, provider } },
    update: { keyHash: apiKey, keyPreview, label, isActive: true },
    create: {
      userId: session.user.id,
      provider,
      keyHash: apiKey,
      keyPreview,
      label,
    },
  });

  return NextResponse.json({ success: true, keyPreview });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { provider } = await req.json();
  await prisma.apiKey.deleteMany({
    where: { userId: session.user.id, provider },
  });

  return NextResponse.json({ success: true });
}
