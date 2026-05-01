import crypto from "crypto";

const ALGO = "aes-256-gcm";
const KEY_ENV = process.env.ENCRYPTION_KEY;

function getDerivedKey(): Buffer {
  const secret = KEY_ENV || process.env.AUTH_SECRET || "fallback-dev-key-change-in-production";
  return crypto.createHash("sha256").update(secret).digest();
}

export function encrypt(plaintext: string): string {
  const key = getDerivedKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Format: iv(12):tag(16):ciphertext — all base64
  return [iv.toString("base64"), tag.toString("base64"), encrypted.toString("base64")].join(":");
}

export function decrypt(ciphertext: string): string {
  try {
    const [ivB64, tagB64, dataB64] = ciphertext.split(":");
    if (!ivB64 || !tagB64 || !dataB64) return ciphertext; // legacy plain key
    const key = getDerivedKey();
    const iv = Buffer.from(ivB64, "base64");
    const tag = Buffer.from(tagB64, "base64");
    const data = Buffer.from(dataB64, "base64");
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    return decipher.update(data).toString("utf8") + decipher.final("utf8");
  } catch {
    return ciphertext; // fallback: return as-is (plain stored key)
  }
}
