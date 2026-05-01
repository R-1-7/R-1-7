import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

export function maskApiKey(key: string): string {
  if (key.length <= 8) return "****";
  return key.slice(0, 4) + "..." + key.slice(-4);
}

export const AI_PROVIDERS = [
  {
    id: "openai",
    name: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo", "o1-preview", "o1-mini"],
    color: "#10a37f",
    icon: "🤖",
    keyPrefix: "sk-",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    models: ["claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5-20251001"],
    color: "#d4a574",
    icon: "🧠",
    keyPrefix: "sk-ant-",
  },
  {
    id: "google",
    name: "Google Gemini",
    models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    color: "#4285f4",
    icon: "✨",
    keyPrefix: "AI",
  },
  {
    id: "mistral",
    name: "Mistral AI",
    models: ["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest", "open-mistral-7b"],
    color: "#ff6b2b",
    icon: "🌪️",
    keyPrefix: "",
  },
  {
    id: "groq",
    name: "Groq",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
    color: "#f59e0b",
    icon: "⚡",
    keyPrefix: "gsk_",
  },
  {
    id: "brave",
    name: "Brave Search",
    models: ["web-search"],
    color: "#fb542b",
    icon: "🔍",
    keyPrefix: "BSA",
    isAddon: true,
  },
] as const;

export type ProviderId = (typeof AI_PROVIDERS)[number]["id"];

export function getProvider(id: string) {
  return AI_PROVIDERS.find((p) => p.id === id);
}
