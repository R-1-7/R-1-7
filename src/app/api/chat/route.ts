import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAIModel } from "@/lib/ai-providers";
import { streamText, tool } from "ai";
import { z } from "zod";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { messages, conversationId, provider, model } = await req.json();

  const apiKeyRecord = await prisma.apiKey.findUnique({
    where: { userId_provider: { userId: session.user.id, provider } },
  });

  if (!apiKeyRecord || !apiKeyRecord.isActive) {
    return NextResponse.json(
      { error: `Aucune clé API configurée pour ${provider}. Configurez-la dans les paramètres.` },
      { status: 400 }
    );
  }

  const prefs = await prisma.userPreferences.findUnique({
    where: { userId: session.user.id },
  });

  const systemPrompt =
    prefs?.systemPrompt ||
    "Tu es JARVIS, un assistant IA intelligent et autonome. Tu réponds toujours en français par défaut, de manière précise et proactive.";

  const aiModel = getAIModel(provider, model, apiKeyRecord.keyHash);

  const result = streamText({
    model: aiModel,
    system: systemPrompt,
    messages,
    tools: {
      get_datetime: tool({
        description: "Obtient la date et l'heure actuelle",
        parameters: z.object({
          timezone: z.string().optional().default("Europe/Paris"),
        }),
        execute: async ({ timezone }) => {
          const now = new Date();
          return {
            datetime: now.toLocaleString("fr-FR", { timeZone: timezone }),
            timestamp: now.toISOString(),
            timezone,
          };
        },
      }),
      calculate: tool({
        description: "Effectue des calculs mathématiques",
        parameters: z.object({
          expression: z.string(),
        }),
        execute: async ({ expression }) => {
          try {
            const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, "");
            // eslint-disable-next-line no-new-func
            const result = new Function(`"use strict"; return (${sanitized})`)();
            return { result, expression };
          } catch {
            return { error: "Impossible d'évaluer cette expression", expression };
          }
        },
      }),
      web_search: tool({
        description: "Simule une recherche web",
        parameters: z.object({
          query: z.string(),
        }),
        execute: async ({ query }) => {
          return {
            message: `Recherche effectuée pour: "${query}". Pour des résultats réels, configurez une API de recherche (SerpAPI, Brave Search, etc.).`,
            query,
          };
        },
      }),
    },
    maxSteps: 5,
    onFinish: async ({ text, usage }) => {
      if (conversationId) {
        const userMsg = messages[messages.length - 1];
        await prisma.message.create({
          data: {
            conversationId,
            role: "user",
            content: typeof userMsg.content === "string" ? userMsg.content : JSON.stringify(userMsg.content),
          },
        });
        await prisma.message.create({
          data: {
            conversationId,
            role: "assistant",
            content: text,
            tokens: usage?.totalTokens,
          },
        });
        const msgCount = await prisma.message.count({ where: { conversationId } });
        if (msgCount <= 2) {
          const userContent =
            typeof userMsg.content === "string" ? userMsg.content : "Nouvelle conversation";
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { title: userContent.slice(0, 60) },
          });
        }
      }
    },
  });

  return result.toDataStreamResponse();
}
