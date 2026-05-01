import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAIModel } from "@/lib/ai-providers";
import { streamText, tool } from "ai";
import { z } from "zod";
import { decrypt } from "@/lib/crypto";
import { webSearch } from "@/lib/web-search";

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

  // Check if Brave Search is configured
  const braveKey = await prisma.apiKey.findUnique({
    where: { userId_provider: { userId: session.user.id, provider: "brave" } },
  });

  const systemPrompt =
    prefs?.systemPrompt ||
    "Tu es JARVIS, un assistant IA intelligent et autonome. Tu réponds toujours en français par défaut, de manière précise et proactive. La date actuelle est " +
      new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) + ".";

  const decryptedKey = decrypt(apiKeyRecord.keyHash);
  const aiModel = getAIModel(provider, model, decryptedKey);

  const result = streamText({
    model: aiModel,
    system: systemPrompt,
    messages,
    tools: {
      get_datetime: tool({
        description: "Obtient la date et l'heure actuelle avec le fuseau horaire",
        parameters: z.object({
          timezone: z.string().optional().default("Europe/Paris"),
        }),
        execute: async ({ timezone }) => {
          const now = new Date();
          return {
            datetime: now.toLocaleString("fr-FR", { timeZone: timezone, weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
            timestamp: now.toISOString(),
            timezone,
          };
        },
      }),
      calculate: tool({
        description: "Effectue des calculs mathématiques précis",
        parameters: z.object({
          expression: z.string().describe("Expression mathématique (ex: 2 + 2 * 3, Math.sqrt(144))"),
        }),
        execute: async ({ expression }) => {
          try {
            const sanitized = expression.replace(/[^0-9+\-*/().%\s,Math.sqrtpowabsroundfloorceillognexp]/g, "");
            // eslint-disable-next-line no-new-func
            const result = new Function(`"use strict"; const Math = globalThis.Math; return (${sanitized})`)();
            return { result: String(result), expression };
          } catch {
            return { error: "Impossible d'évaluer cette expression", expression };
          }
        },
      }),
      web_search: tool({
        description: "Recherche des informations sur internet en temps réel",
        parameters: z.object({
          query: z.string().describe("La requête de recherche"),
          count: z.number().optional().default(5).describe("Nombre de résultats (1-10)"),
        }),
        execute: async ({ query, count }) => {
          if (braveKey?.isActive) {
            const braveApiKey = decrypt(braveKey.keyHash);
            return await webSearch(query, braveApiKey, count);
          }
          return {
            message: "Recherche web non configurée. Ajoutez une clé Brave Search dans vos paramètres pour des résultats réels.",
            tip: "Obtenez une clé gratuite sur search.brave.com/api",
            query,
          };
        },
      }),
      generate_image: tool({
        description: "Génère une image à partir d'une description textuelle (nécessite OpenAI)",
        parameters: z.object({
          prompt: z.string().describe("Description détaillée de l'image à générer"),
          size: z.enum(["1024x1024", "1792x1024", "1024x1792"]).optional().default("1024x1024"),
        }),
        execute: async ({ prompt, size }) => {
          if (provider !== "openai") {
            return { error: "La génération d'images nécessite une clé OpenAI configurée." };
          }
          try {
            const response = await fetch("https://api.openai.com/v1/images/generations", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${decryptedKey}` },
              body: JSON.stringify({ model: "dall-e-3", prompt, n: 1, size }),
            });
            const data = await response.json();
            if (data.data?.[0]?.url) {
              return { imageUrl: data.data[0].url, prompt, revisedPrompt: data.data[0].revised_prompt };
            }
            return { error: data.error?.message || "Erreur de génération d'image" };
          } catch {
            return { error: "Impossible de contacter l'API OpenAI Images" };
          }
        },
      }),
      read_file: tool({
        description: "Lit le contenu d'un fichier précédemment uploadé dans cette conversation",
        parameters: z.object({
          filename: z.string().describe("Nom du fichier à lire"),
        }),
        execute: async ({ filename }) => {
          return { message: `Fichier "${filename}" — utilisez l'upload dans l'interface pour partager des fichiers.` };
        },
      }),
    },
    maxSteps: 5,
    onFinish: async ({ text, usage }) => {
      if (conversationId && text) {
        const userMsg = messages[messages.length - 1];
        const userContent = typeof userMsg.content === "string" ? userMsg.content : JSON.stringify(userMsg.content);

        // Avoid duplicate saves — check if last message already saved
        const lastMsg = await prisma.message.findFirst({
          where: { conversationId },
          orderBy: { createdAt: "desc" },
        });

        if (lastMsg?.content !== text) {
          await prisma.message.createMany({
            data: [
              { conversationId, role: "user", content: userContent },
              { conversationId, role: "assistant", content: text, tokens: usage?.totalTokens },
            ],
          });

          const msgCount = await prisma.message.count({ where: { conversationId } });
          if (msgCount <= 2) {
            await prisma.conversation.update({
              where: { id: conversationId },
              data: { title: userContent.slice(0, 60) },
            });
          }
        }
      }
    },
  });

  return result.toDataStreamResponse();
}
