import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const format = req.nextUrl.searchParams.get("format") || "markdown";

  const conversation = await prisma.conversation.findFirst({
    where: { id, userId: session.user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!conversation) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  if (format === "json") {
    return NextResponse.json(conversation, {
      headers: { "Content-Disposition": `attachment; filename="jarvis-${id}.json"` },
    });
  }

  // Markdown export
  const date = new Date(conversation.createdAt).toLocaleDateString("fr-FR");
  const lines = [
    `# ${conversation.title}`,
    ``,
    `**Date :** ${date}  `,
    `**Modèle :** ${conversation.provider} / ${conversation.model}`,
    ``,
    `---`,
    ``,
    ...conversation.messages.map((m) => {
      const role = m.role === "user" ? "**Vous**" : "**JARVIS**";
      const time = new Date(m.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      return `### ${role} — ${time}\n\n${m.content}\n`;
    }),
  ];

  const markdown = lines.join("\n");

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="jarvis-${conversation.title.slice(0, 30).replace(/\s+/g, "-")}.md"`,
    },
  });
}
