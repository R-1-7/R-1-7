"use client";
import { useState, useEffect } from "react";
import { AI_PROVIDERS } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Save } from "lucide-react";
import toast from "react-hot-toast";

interface Prefs {
  defaultProvider: string;
  defaultModel: string;
  language: string;
  voiceEnabled: boolean;
  assistantName: string;
  systemPrompt: string;
}

export default function ModelTab() {
  const [prefs, setPrefs] = useState<Prefs>({
    defaultProvider: "openai",
    defaultModel: "gpt-4o",
    language: "fr",
    voiceEnabled: true,
    assistantName: "JARVIS",
    systemPrompt: "Tu es JARVIS, un assistant IA intelligent, autonome et polyvalent. Tu réponds toujours de manière précise, concise et proactive.",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/preferences").then((r) => r.json()).then((d) => { if (d?.defaultProvider) setPrefs(d); });
  }, []);

  const save = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      if (res.ok) toast.success("Paramètres IA sauvegardés");
      else toast.error("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const currentProv = AI_PROVIDERS.find((p) => p.id === prefs.defaultProvider);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aiProviders = AI_PROVIDERS.filter((p) => !(p as any).isAddon);

  return (
    <div className="p-6 max-w-lg space-y-6">
      {/* Assistant identity */}
      <section className="glass rounded-xl p-5 border border-slate-700/20">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Identité de l&apos;assistant</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1.5">Nom de l&apos;assistant</label>
            <input
              value={prefs.assistantName}
              onChange={(e) => setPrefs({ ...prefs, assistantName: e.target.value })}
              placeholder="JARVIS"
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1.5">Prompt système</label>
            <textarea
              value={prefs.systemPrompt}
              onChange={(e) => setPrefs({ ...prefs, systemPrompt: e.target.value })}
              rows={4}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 resize-none transition-all"
            />
          </div>
        </div>
      </section>

      {/* Provider */}
      <section className="glass rounded-xl p-5 border border-slate-700/20">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Modèle par défaut</h2>
        <div className="space-y-3">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {aiProviders.map((p) => (
              <button
                key={p.id}
                onClick={() => setPrefs({ ...prefs, defaultProvider: p.id, defaultModel: p.models[0] })}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${
                  prefs.defaultProvider === p.id
                    ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
                    : "border-slate-700/50 text-slate-500 hover:border-slate-600"
                }`}
              >
                <span className="text-xl">{p.icon}</span>
                <span className="leading-tight text-center">{p.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1.5">Modèle</label>
            <select
              value={prefs.defaultModel}
              onChange={(e) => setPrefs({ ...prefs, defaultModel: e.target.value })}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/60 transition-all"
            >
              {(currentProv?.models || []).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Voice & language */}
      <section className="glass rounded-xl p-5 border border-slate-700/20">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Voix & langue</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">Synthèse vocale</p>
              <p className="text-xs text-slate-600">Lire les réponses à voix haute</p>
            </div>
            <button
              onClick={() => setPrefs({ ...prefs, voiceEnabled: !prefs.voiceEnabled })}
              className={`relative w-11 h-6 rounded-full transition-colors ${prefs.voiceEnabled ? "bg-cyan-500/60" : "bg-slate-700"}`}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                style={{ transform: prefs.voiceEnabled ? "translateX(22px)" : "translateX(2px)" }}
              />
            </button>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1.5">Langue</label>
            <select
              value={prefs.language}
              onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/60 transition-all"
            >
              <option value="fr">🇫🇷 Français</option>
              <option value="en">🇬🇧 English</option>
              <option value="es">🇪🇸 Español</option>
              <option value="de">🇩🇪 Deutsch</option>
              <option value="it">🇮🇹 Italiano</option>
              <option value="pt">🇵🇹 Português</option>
              <option value="ja">🇯🇵 日本語</option>
              <option value="zh">🇨🇳 中文</option>
              <option value="ar">🇸🇦 العربية</option>
            </select>
          </div>
        </div>
      </section>

      <Button variant="primary" onClick={save} loading={loading}>
        <Save size={14} /> Sauvegarder les paramètres IA
      </Button>
    </div>
  );
}
