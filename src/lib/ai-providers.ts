import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

export function getAIModel(provider: string, model: string, apiKey: string): LanguageModel {
  switch (provider) {
    case "openai": {
      const openai = createOpenAI({ apiKey });
      return openai(model);
    }
    case "anthropic": {
      const anthropic = createAnthropic({ apiKey });
      return anthropic(model);
    }
    case "google": {
      const google = createGoogleGenerativeAI({ apiKey });
      return google(model);
    }
    case "mistral": {
      const openai = createOpenAI({
        apiKey,
        baseURL: "https://api.mistral.ai/v1",
      });
      return openai(model);
    }
    case "groq": {
      const openai = createOpenAI({
        apiKey,
        baseURL: "https://api.groq.com/openai/v1",
      });
      return openai(model);
    }
    default:
      throw new Error(`Provider inconnu: ${provider}`);
  }
}

export const SYSTEM_TOOLS = [
  {
    name: "web_search",
    description: "Effectue une recherche sur internet pour trouver des informations récentes",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "La requête de recherche" },
      },
      required: ["query"],
    },
  },
  {
    name: "calculate",
    description: "Effectue des calculs mathématiques complexes",
    parameters: {
      type: "object",
      properties: {
        expression: { type: "string", description: "L'expression mathématique à calculer" },
      },
      required: ["expression"],
    },
  },
  {
    name: "get_datetime",
    description: "Obtient la date et l'heure actuelle",
    parameters: {
      type: "object",
      properties: {
        timezone: { type: "string", description: "Le fuseau horaire (ex: Europe/Paris)" },
      },
      required: [],
    },
  },
  {
    name: "generate_code",
    description: "Génère du code dans n'importe quel langage de programmation",
    parameters: {
      type: "object",
      properties: {
        language: { type: "string", description: "Le langage de programmation" },
        description: { type: "string", description: "Description de ce que le code doit faire" },
      },
      required: ["language", "description"],
    },
  },
] as const;
