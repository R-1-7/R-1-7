import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const conversations = await prisma.conversation.findMany({
    where: { userId: session.user.id },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    include: { messages: { take: 1, orderBy: { createdAt: "desc" } } },
  });

  return NextResponse.json(conversations);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const prefs = await prisma.userPreferences.findUnique({ where: { userId: session.user.id } });

  const conversation = await prisma.conversation.create({
    data: {
      userId: session.user.id,
      provider: prefs?.defaultProvider || "openai",
      model: prefs?.defaultModel || "gpt-4o",
    },
  });

  return NextResponse.json(conversation);
}
