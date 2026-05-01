"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Save, Eye, EyeOff, Send, Info } from "lucide-react";
import toast from "react-hot-toast";

interface ConfigEntry {
  key: string;
  label: string;
  sensitive: boolean;
  value: string;
  isSet: boolean;
  isFromEnv: boolean;
}

export default function SmtpTab() {
  const [configs, setConfigs] = useState<ConfigEntry[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testing, setTesting] = useState(false);

  const load = () => {
    fetch("/api/admin/config?group=smtp")
      .then((r) => r.json())
      .then((data: ConfigEntry[]) => setConfigs(data));
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setLoading(true);
    try {
      const toSave = Object.entries(edits).map(([key, value]) => ({ key, value }));
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configs: toSave }),
      });
      if (res.ok) {
        toast.success("Configuration SMTP sauvegardée");
        setEdits({});
        load();
      } else {
        toast.error("Erreur lors de la sauvegarde");
      }
    } finally {
      setLoading(false);
    }
  };

  const sendTest = async () => {
    if (!testEmail) { toast.error("Entrez un email de test"); return; }
    setTesting(true);
    try {
      const res = await fetch("/api/admin/smtp-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmail }),
      });
      if (res.ok) toast.success(`Email de test envoyé à ${testEmail}`);
      else toast.error("Échec — vérifiez vos paramètres SMTP");
    } finally {
      setTesting(false);
    }
  };

  const PLACEHOLDERS: Record<string, string> = {
    SMTP_HOST: "smtp.gmail.com",
    SMTP_PORT: "587",
    SMTP_USER: "votre@email.com",
    SMTP_PASS: "••••••••",
    SMTP_FROM: "JARVIS <noreply@monsite.com>",
  };

  return (
    <div className="p-6 max-w-lg space-y-6">
      <div className="flex gap-2 p-3 rounded-lg bg-slate-800/40 border border-slate-700/20 text-xs text-slate-500">
        <Info size={14} className="flex-shrink-0 mt-0.5" />
        <div>
          <p>Configuration du serveur email pour les notifications et la réinitialisation de mot de passe.</p>
          <p className="mt-1 text-slate-600">Pour Gmail : activez l&apos;authentification à 2 facteurs et utilisez un mot de passe d&apos;application.</p>
        </div>
      </div>

      <section className="glass rounded-xl p-5 border border-slate-700/20 space-y-4">
        <h2 className="text-sm font-semibold text-slate-300">Serveur SMTP</h2>
        {configs.map((entry) => {
          const isPass = entry.key === "SMTP_PASS";
          return (
            <div key={entry.key}>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
                {entry.label}
                {entry.isSet && !entry.isFromEnv && (
                  <span className="ml-2 px-1.5 py-0.5 rounded bg-green-500/10 text-green-400/80 normal-case text-[10px] border border-green-500/20">configuré</span>
                )}
                {entry.isFromEnv && (
                  <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400/80 normal-case text-[10px] border border-amber-500/20">depuis .env</span>
                )}
              </label>
              <div className="relative">
                <input
                  type={isPass && !showPass ? "password" : "text"}
                  placeholder={entry.isSet ? "••••• (configuré — laissez vide pour conserver)" : PLACEHOLDERS[entry.key] || ""}
                  value={edits[entry.key] ?? ""}
                  onChange={(e) => setEdits({ ...edits, [entry.key]: e.target.value })}
                  disabled={entry.isFromEnv}
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 transition-all pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {isPass && !entry.isFromEnv && (
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </section>

      <div className="flex gap-2">
        <Button variant="primary" onClick={save} loading={loading} disabled={Object.keys(edits).length === 0}>
          <Save size={14} /> Sauvegarder
        </Button>
      </div>

      {/* Test email */}
      <section className="glass rounded-xl p-5 border border-slate-700/20">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Tester la configuration</h2>
        <div className="flex gap-2">
          <input
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="email@test.com"
            type="email"
            className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 transition-all"
          />
          <Button variant="secondary" onClick={sendTest} loading={testing}>
            <Send size={14} /> Test
          </Button>
        </div>
      </section>
    </div>
  );
}
