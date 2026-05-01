import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const [totalConversations, totalMessages, activeKeys, tokensData] = await Promise.all([
    prisma.conversation.count({ where: { userId: session.user.id } }),
    prisma.message.count({
      where: { conversation: { userId: session.user.id } },
    }),
    prisma.apiKey.count({ where: { userId: session.user.id, isActive: true } }),
    prisma.message.aggregate({
      where: { conversation: { userId: session.user.id }, tokens: { not: null } },
      _sum: { tokens: true },
    }),
  ]);

  return NextResponse.json({
    totalConversations,
    totalMessages,
    activeKeys,
    totalTokens: tokensData._sum.tokens || 0,
  });
}
