"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Save, Eye, EyeOff, ExternalLink, CheckCircle2, XCircle, Info } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface ConfigEntry {
  key: string;
  label: string;
  sensitive: boolean;
  value: string;
  isSet: boolean;
  isFromEnv: boolean;
}

interface ProviderConfig {
  id: "google" | "github";
  name: string;
  icon: string;
  color: string;
  docUrl: string;
  callbackPath: string;
  fields: { key: string; placeholder: string }[];
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: "google",
    name: "Google",
    icon: "G",
    color: "text-blue-400",
    docUrl: "https://console.cloud.google.com/apis/credentials",
    callbackPath: "/api/auth/callback/google",
    fields: [
      { key: "GOOGLE_CLIENT_ID", placeholder: "xxxx.apps.googleusercontent.com" },
      { key: "GOOGLE_CLIENT_SECRET", placeholder: "GOCSPX-••••••••" },
    ],
  },
  {
    id: "github",
    name: "GitHub",
    icon: "GH",
    color: "text-slate-300",
    docUrl: "https://github.com/settings/applications/new",
    callbackPath: "/api/auth/callback/github",
    fields: [
      { key: "GITHUB_ID", placeholder: "Ov23lixxxxxxxx" },
      { key: "GITHUB_SECRET", placeholder: "••••••••••••••••••••••••••••••••••••••••" },
    ],
  },
];

export default function OAuthTab() {
  const [configs, setConfigs] = useState<Record<string, ConfigEntry>>({});
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [show, setShow] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [appUrl, setAppUrl] = useState("");

  useEffect(() => {
    setAppUrl(window.location.origin);
    fetch("/api/admin/config?group=oauth")
      .then((r) => r.json())
      .then((data: ConfigEntry[]) => {
        const map: Record<string, ConfigEntry> = {};
        for (const entry of data) map[entry.key] = entry;
        setConfigs(map);
        setInitialLoading(false);
      })
      .catch(() => setInitialLoading(false));
  }, []);

  const getDisplayValue = (key: string) => {
    if (key in edits) return edits[key];
    return ""; // Don't pre-fill with masked values
  };

  const isProviderActive = (p: ProviderConfig) =>
    p.fields.every((f) => configs[f.key]?.isSet);

  const save = async () => {
    setLoading(true);
    try {
      const toSave = Object.entries(edits)
        .filter(([, v]) => v !== undefined)
        .map(([key, value]) => ({ key, value }));

      if (toSave.length === 0) {
        toast("Aucune modification à sauvegarder", { icon: "ℹ️" });
        return;
      }

      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configs: toSave }),
      });

      if (res.ok) {
        toast.success("Configuration OAuth sauvegardée. Reconnectez-vous pour activer les nouveaux providers.");
        setEdits({});
        // Reload display
        const fresh = await fetch("/api/admin/config?group=oauth").then((r) => r.json());
        const map: Record<string, ConfigEntry> = {};
        for (const entry of fresh) map[entry.key] = entry;
        setConfigs(map);
      } else {
        toast.error("Erreur lors de la sauvegarde");
      }
    } finally {
      setLoading(false);
    }
  };

  const clearProvider = async (p: ProviderConfig) => {
    if (!confirm(`Supprimer la configuration ${p.name} ?`)) return;
    await fetch("/api/admin/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ configs: p.fields.map((f) => ({ key: f.key, value: "" })) }),
    });
    toast.success(`${p.name} OAuth désactivé`);
    const fresh = await fetch("/api/admin/config?group=oauth").then((r) => r.json());
    const map: Record<string, ConfigEntry> = {};
    for (const entry of fresh) map[entry.key] = entry;
    setConfigs(map);
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-cyan-500/40 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  const hasEdits = Object.keys(edits).length > 0;

  return (
    <div className="p-6 max-w-xl space-y-6">
      {/* Info banner */}
      <div className="flex gap-2 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-xs text-cyan-400/80">
        <Info size={14} className="flex-shrink-0 mt-0.5" />
        <p>
          Les credentials OAuth sont chiffrés en base de données (AES-256).
          Ils sont utilisés pour la connexion sociale sur la page de login.
        </p>
      </div>

      {PROVIDERS.map((p) => {
        const active = isProviderActive(p);
        return (
          <section key={p.id} className="glass rounded-xl border border-slate-700/20 overflow-hidden">
            {/* Provider header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center text-xs font-bold text-slate-400">
                  {p.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">Connexion {p.name}</p>
                  <p className="text-xs text-slate-600">{p.name} OAuth 2.0</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {active ? (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle2 size={13} /> Actif
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-slate-600">
                    <XCircle size={13} /> Inactif
                  </span>
                )}
                {active && (
                  <button
                    onClick={() => clearProvider(p)}
                    className="text-xs text-slate-700 hover:text-red-400 transition-colors ml-2"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Callback URL info */}
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/60">
                <p className="text-xs text-slate-500 mb-1 font-medium">URL de callback à renseigner dans {p.name} :</p>
                <code className="text-xs text-cyan-400/80 break-all">
                  {appUrl}{p.callbackPath}
                </code>
                <a
                  href={p.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-400 mt-2 transition-colors"
                >
                  <ExternalLink size={10} /> Créer une application {p.name}
                </a>
              </div>

              {/* Fields */}
              {p.fields.map((f) => {
                const entry = configs[f.key];
                const isSensitive = entry?.sensitive;
                const isSet = entry?.isSet;
                const isFromEnv = entry?.isFromEnv;
                const showField = show[f.key];

                return (
                  <div key={f.key}>
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
                      {entry?.label || f.key}
                      {isFromEnv && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400/80 normal-case text-[10px] border border-amber-500/20">
                          depuis .env
                        </span>
                      )}
                      {isSet && !isFromEnv && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-green-500/10 text-green-400/80 normal-case text-[10px] border border-green-500/20">
                          configuré
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type={isSensitive && !showField ? "password" : "text"}
                        placeholder={isSet ? (isFromEnv ? "Depuis variable d'env" : "••••• (configuré — laissez vide pour conserver)") : f.placeholder}
                        value={getDisplayValue(f.key)}
                        onChange={(e) => setEdits({ ...edits, [f.key]: e.target.value })}
                        disabled={isFromEnv}
                        className={cn(
                          "w-full bg-slate-900/60 border rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600",
                          "focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 transition-all",
                          isFromEnv
                            ? "border-slate-800/40 opacity-50 cursor-not-allowed"
                            : "border-slate-700/50",
                          f.key in edits && edits[f.key] && "border-cyan-500/40"
                        )}
                      />
                      {isSensitive && !isFromEnv && (
                        <button
                          type="button"
                          onClick={() => setShow({ ...show, [f.key]: !showField })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                        >
                          {showField ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Save button */}
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          onClick={save}
          loading={loading}
          disabled={!hasEdits}
          className={cn(!hasEdits && "opacity-50")}
        >
          <Save size={14} /> Sauvegarder les credentials
        </Button>
        {hasEdits && (
          <span className="text-xs text-amber-400/70">
            {Object.keys(edits).length} champ(s) modifié(s)
          </span>
        )}
      </div>

      {/* Help */}
      <div className="glass rounded-xl p-4 border border-slate-700/20 text-xs text-slate-600 space-y-1">
        <p className="font-semibold text-slate-500">Comment configurer Google OAuth :</p>
        <ol className="list-decimal list-inside space-y-1 mt-2">
          <li>Allez sur Google Cloud Console → APIs &amp; Services → Credentials</li>
          <li>Créez un OAuth 2.0 Client ID (type: Web application)</li>
          <li>Ajoutez l&apos;URL de callback ci-dessus dans &quot;Authorized redirect URIs&quot;</li>
          <li>Copiez le Client ID et Client Secret ici</li>
        </ol>
      </div>
    </div>
  );
}
