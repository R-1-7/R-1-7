import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const prefs = await prisma.userPreferences.findUnique({ where: { userId: session.user.id } });
  return NextResponse.json(prefs);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { defaultProvider, defaultModel, language, voiceEnabled, voiceId, theme, assistantName, systemPrompt } = body;

  const prefs = await prisma.userPreferences.upsert({
    where: { userId: session.user.id },
    update: { defaultProvider, defaultModel, language, voiceEnabled, voiceId, theme, assistantName, systemPrompt },
    create: {
      userId: session.user.id,
      defaultProvider,
      defaultModel,
      language,
      voiceEnabled,
      voiceId,
      theme,
      assistantName,
      systemPrompt,
    },
  });

  return NextResponse.json(prefs);
}
