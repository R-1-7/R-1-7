import { prisma } from "./prisma";
import { encrypt, decrypt } from "./crypto";

export type ConfigKey =
  | "GOOGLE_CLIENT_ID"
  | "GOOGLE_CLIENT_SECRET"
  | "GITHUB_ID"
  | "GITHUB_SECRET"
  | "SMTP_HOST"
  | "SMTP_PORT"
  | "SMTP_USER"
  | "SMTP_PASS"
  | "SMTP_FROM"
  | "APP_NAME"
  | "APP_URL"
  | "REGISTRATION_ENABLED"
  | "NEXTAUTH_URL";

const SENSITIVE_KEYS: ConfigKey[] = [
  "GOOGLE_CLIENT_SECRET",
  "GITHUB_SECRET",
  "SMTP_PASS",
];

/** Get a config value: DB first, then env var fallback */
export async function getConfig(key: ConfigKey): Promise<string | null> {
  const record = await prisma.appConfig.findUnique({ where: { key } });
  if (record) {
    return record.encrypted ? decrypt(record.value) : record.value;
  }
  return process.env[key] ?? null;
}

/** Get multiple config values at once */
export async function getConfigs(keys: ConfigKey[]): Promise<Record<string, string | null>> {
  const records = await prisma.appConfig.findMany({
    where: { key: { in: keys } },
  });
  const fromDB = Object.fromEntries(
    records.map((r) => [r.key, r.encrypted ? decrypt(r.value) : r.value])
  );
  return Object.fromEntries(
    keys.map((k) => [k, fromDB[k] ?? process.env[k] ?? null])
  );
}

/** Set a config value */
export async function setConfig(key: ConfigKey, value: string, label?: string, group?: string): Promise<void> {
  const sensitive = SENSITIVE_KEYS.includes(key);
  const stored = sensitive ? encrypt(value) : value;
  await prisma.appConfig.upsert({
    where: { key },
    update: { value: stored, encrypted: sensitive, label, group: group ?? "general" },
    create: { key, value: stored, encrypted: sensitive, label, group: group ?? "general" },
  });
}

/** Delete a config key */
export async function deleteConfig(key: ConfigKey): Promise<void> {
  await prisma.appConfig.deleteMany({ where: { key } });
}

/** Get all configs for a group (values of sensitive keys masked) */
export async function getConfigGroup(group: string): Promise<Array<{ key: string; value: string; encrypted: boolean; label?: string | null }>> {
  const records = await prisma.appConfig.findMany({ where: { group } });
  return records.map((r) => ({
    key: r.key,
    value: r.encrypted ? maskValue(decrypt(r.value)) : r.value,
    encrypted: r.encrypted,
    label: r.label,
  }));
}

function maskValue(v: string): string {
  if (v.length <= 8) return "••••••••";
  return v.slice(0, 4) + "••••" + v.slice(-4);
}

/** Build OAuth provider configs for NextAuth (server-side) */
export async function getOAuthProviderConfigs() {
  const cfg = await getConfigs([
    "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET",
    "GITHUB_ID", "GITHUB_SECRET",
  ]);
  return {
    google:
      cfg.GOOGLE_CLIENT_ID && cfg.GOOGLE_CLIENT_SECRET
        ? { clientId: cfg.GOOGLE_CLIENT_ID, clientSecret: cfg.GOOGLE_CLIENT_SECRET }
        : null,
    github:
      cfg.GITHUB_ID && cfg.GITHUB_SECRET
        ? { clientId: cfg.GITHUB_ID, clientSecret: cfg.GITHUB_SECRET }
        : null,
  };
}
