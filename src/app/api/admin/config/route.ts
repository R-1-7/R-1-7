import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setConfig, deleteConfig, type ConfigKey } from "@/lib/app-config";
import { decrypt } from "@/lib/crypto";

const SENSITIVE_KEYS = ["GOOGLE_CLIENT_SECRET", "GITHUB_SECRET", "SMTP_PASS"];

const CONFIG_GROUPS: Record<string, { key: ConfigKey; label: string; group: string; sensitive?: boolean }[]> = {
  oauth: [
    { key: "GOOGLE_CLIENT_ID", label: "Google Client ID", group: "oauth" },
    { key: "GOOGLE_CLIENT_SECRET", label: "Google Client Secret", group: "oauth", sensitive: true },
    { key: "GITHUB_ID", label: "GitHub Client ID", group: "oauth" },
    { key: "GITHUB_SECRET", label: "GitHub Client Secret", group: "oauth", sensitive: true },
  ],
  app: [
    { key: "APP_NAME", label: "Nom de l'application", group: "app" },
    { key: "APP_URL", label: "URL de l'application", group: "app" },
    { key: "NEXTAUTH_URL", label: "URL NextAuth (callback URL)", group: "app" },
    { key: "REGISTRATION_ENABLED", label: "Inscription ouverte", group: "app" },
  ],
  smtp: [
    { key: "SMTP_HOST", label: "Serveur SMTP", group: "smtp" },
    { key: "SMTP_PORT", label: "Port SMTP", group: "smtp" },
    { key: "SMTP_USER", label: "Utilisateur SMTP", group: "smtp" },
    { key: "SMTP_PASS", label: "Mot de passe SMTP", group: "smtp", sensitive: true },
    { key: "SMTP_FROM", label: "Email expéditeur", group: "smtp" },
  ],
};

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const group = req.nextUrl.searchParams.get("group") || "oauth";

  const records = await prisma.appConfig.findMany({ where: { group } });
  const configMap = Object.fromEntries(records.map((r) => [r.key, r]));

  const defs = CONFIG_GROUPS[group] || [];
  const result = defs.map((def) => {
    const record = configMap[def.key];
    const rawValue = record
      ? record.encrypted
        ? decrypt(record.value)
        : record.value
      : (process.env[def.key] ?? "");

    const isFromEnv = !record && !!process.env[def.key];

    return {
      key: def.key,
      label: def.label,
      group: def.group,
      sensitive: def.sensitive ?? false,
      value: def.sensitive ? maskValue(rawValue) : rawValue,
      isSet: !!rawValue,
      isFromEnv,
    };
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { configs }: { configs: { key: string; value: string }[] } = body;

  if (!Array.isArray(configs)) {
    return NextResponse.json({ error: "Format invalide" }, { status: 400 });
  }

  for (const { key, value } of configs) {
    if (!value.trim()) {
      // Delete if empty
      await deleteConfig(key as ConfigKey);
      continue;
    }
    // Find the def to get the group and label
    const def = Object.values(CONFIG_GROUPS).flat().find((d) => d.key === key);
    if (!def) continue;
    await setConfig(key as ConfigKey, value.trim(), def.label, def.group);
  }

  return NextResponse.json({ success: true });
}

function maskValue(v: string): string {
  if (!v) return "";
  if (v.length <= 8) return "••••••••";
  return v.slice(0, 4) + "••••" + v.slice(-4);
}

