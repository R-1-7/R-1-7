import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getConfigs } from "@/lib/app-config";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { to } = await req.json();
  if (!to) return NextResponse.json({ error: "Email destinataire requis" }, { status: 400 });

  const cfg = await getConfigs(["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"]);

  if (!cfg.SMTP_HOST || !cfg.SMTP_USER) {
    return NextResponse.json({ error: "Configuration SMTP incomplète" }, { status: 400 });
  }

  try {
    // Dynamic import of nodemailer to avoid bundle issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: cfg.SMTP_HOST,
      port: parseInt(cfg.SMTP_PORT || "587"),
      secure: parseInt(cfg.SMTP_PORT || "587") === 465,
      auth: { user: cfg.SMTP_USER, pass: cfg.SMTP_PASS || undefined },
    });
    await transporter.sendMail({
      from: cfg.SMTP_FROM || cfg.SMTP_USER,
      to,
      subject: "Test JARVIS — Configuration SMTP",
      text: "Félicitations ! Votre configuration SMTP fonctionne correctement.",
      html: `<p style="font-family:sans-serif">Félicitations ! Votre configuration SMTP fonctionne correctement.<br><br>— <strong>JARVIS</strong></p>`,
    });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
