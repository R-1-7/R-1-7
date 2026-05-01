"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Save, Info, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface ConfigEntry {
  key: string;
  label: string;
  value: string;
  isSet: boolean;
  isFromEnv: boolean;
}

export default function AppTab() {
  const [configs, setConfigs] = useState<ConfigEntry[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const load = () => {
    fetch("/api/admin/config?group=app")
      .then((r) => r.json())
      .then((data: ConfigEntry[]) => setConfigs(data));
  };

  useEffect(() => { load(); }, []);

  const setValue = (key: string, value: string) => {
    setEdits((prev) => ({ ...prev, [key]: value }));
  };

  const getDisplayValue = (entry: ConfigEntry) => {
    if (entry.key in edits) return edits[entry.key];
    return entry.isFromEnv ? entry.value : entry.value;
  };

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
        toast.success("Configuration sauvegardée");
        setEdits({});
        load();
      } else {
        toast.error("Erreur lors de la sauvegarde");
      }
    } finally {
      setLoading(false);
    }
  };

  const DESCRIPTIONS: Record<string, string> = {
    APP_NAME: "Nom affiché dans l'interface et les emails",
    APP_URL: "URL publique de l'application (ex: https://jarvis.monsite.com)",
    NEXTAUTH_URL: "URL de callback NextAuth — doit correspondre à APP_URL",
    REGISTRATION_ENABLED: "Autoriser les nouvelles inscriptions (true/false)",
  };

  return (
    <div className="p-6 max-w-lg space-y-6">
      <div className="flex gap-2 p-3 rounded-lg bg-slate-800/40 border border-slate-700/20 text-xs text-slate-500">
        <Info size={14} className="flex-shrink-0 mt-0.5 text-slate-600" />
        <p>
          Ces paramètres configurent l&apos;application globalement. Les valeurs vides utilisent les variables d&apos;environnement.
        </p>
      </div>

      <section className="glass rounded-xl p-5 border border-slate-700/20 space-y-4">
        <h2 className="text-sm font-semibold text-slate-300">Configuration générale</h2>
        {configs.map((entry) => (
          <div key={entry.key}>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
              {entry.label}
              {entry.isFromEnv && (
                <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400/80 normal-case text-[10px] border border-amber-500/20">
                  depuis .env
                </span>
              )}
            </label>
            {DESCRIPTIONS[entry.key] && (
              <p className="text-xs text-slate-600 mb-1.5">{DESCRIPTIONS[entry.key]}</p>
            )}
            <input
              value={getDisplayValue(entry)}
              onChange={(e) => setValue(entry.key, e.target.value)}
              disabled={entry.isFromEnv}
              placeholder={entry.isFromEnv ? entry.value : `Valeur pour ${entry.key}`}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        ))}
      </section>

      <div className="flex gap-2">
        <Button variant="primary" onClick={save} loading={loading} disabled={Object.keys(edits).length === 0}>
          <Save size={14} /> Sauvegarder
        </Button>
        <Button variant="ghost" onClick={load}>
          <RefreshCw size={14} /> Rafraîchir
        </Button>
      </div>
    </div>
  );
}
