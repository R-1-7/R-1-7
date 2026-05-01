"use client";
import { useState, useEffect } from "react";
import { AI_PROVIDERS, getProvider } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Key, Plus, Trash2, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

interface StoredKey {
  id: string;
  provider: string;
  keyPreview: string;
  label: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function KeysPage() {
  const [keys, setKeys] = useState<StoredKey[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const load = async () => {
    const res = await fetch("/api/keys");
    const data = await res.json();
    if (Array.isArray(data)) setKeys(data);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!apiKey.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: selectedProvider, apiKey: apiKey.trim(), label }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Clé API enregistrée avec succès");
        setModalOpen(false);
        setApiKey("");
        setLabel("");
        load();
      } else {
        toast.error(data.error || "Erreur lors de l'enregistrement");
      }
    } finally {
      setLoading(false);
    }
  };

  const remove = async (provider: string) => {
    if (!confirm("Supprimer cette clé API ?")) return;
    await fetch("/api/keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    });
    toast.success("Clé supprimée");
    load();
  };

  const configuredProviders = keys.map((k) => k.provider);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
              <Key size={24} className="text-cyan-400" />
              Clés API
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gérez vos clés API pour chaque provider d&apos;IA
            </p>
          </div>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Ajouter une clé
          </Button>
        </div>

        {/* Configured keys */}
        {keys.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Clés configurées ({keys.length})
            </h2>
            <div className="space-y-3">
              {keys.map((key) => {
                const prov = getProvider(key.provider);
                return (
                  <div
                    key={key.id}
                    className="glass rounded-xl p-4 border border-slate-700/30 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{prov?.icon || "🔑"}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-200">{prov?.name || key.provider}</p>
                          <Badge variant={key.isActive ? "success" : "danger"}>
                            {key.isActive ? (
                              <><CheckCircle size={10} /> Actif</>
                            ) : (
                              <><AlertCircle size={10} /> Inactif</>
                            )}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 font-mono mt-0.5">
                          {key.keyPreview}
                          {key.label && <span className="ml-2 text-slate-500">• {key.label}</span>}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      size="icon-sm"
                      onClick={() => remove(key.provider)}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available providers */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Providers IA disponibles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {AI_PROVIDERS.filter((p) => !(p as any).isAddon).map((p) => {
              const configured = configuredProviders.includes(p.id);
              return (
                <div
                  key={p.id}
                  className="glass rounded-xl p-4 border border-slate-700/20 cursor-pointer hover:border-slate-600/40 transition-all"
                  onClick={() => {
                    if (!configured) {
                      setSelectedProvider(p.id);
                      setModalOpen(true);
                    }
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{p.icon}</span>
                    <p className="text-sm font-semibold text-slate-300">{p.name}</p>
                    {configured && (
                      <CheckCircle size={14} className="ml-auto text-green-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    {p.models.length} modèles disponibles
                  </p>
                  <p className="text-xs text-slate-700 mt-1 font-mono">
                    Préfixe: {p.keyPrefix || "(variable)"}
                  </p>
                  {!configured && (
                    <p className="text-xs text-cyan-500/60 mt-2 flex items-center gap-1">
                      <Plus size={10} /> Configurer
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add-ons section */}
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Add-ons & outils
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {AI_PROVIDERS.filter((p) => (p as any).isAddon).map((p) => {
                const configured = configuredProviders.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className="glass rounded-xl p-4 border border-slate-700/20 cursor-pointer hover:border-slate-600/40 transition-all"
                    onClick={() => { if (!configured) { setSelectedProvider(p.id); setModalOpen(true); } }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{p.icon}</span>
                      <p className="text-sm font-semibold text-slate-300">{p.name}</p>
                      {configured && <CheckCircle size={14} className="ml-auto text-green-400" />}
                    </div>
                    <p className="text-xs text-slate-600">
                      {p.id === "brave" ? "Recherche web en temps réel dans le chat" : ""}
                    </p>
                    {p.id === "brave" && (
                      <p className="text-xs text-slate-700 mt-1">
                        Clé gratuite : search.brave.com/api
                      </p>
                    )}
                    {!configured && (
                      <p className="text-xs text-cyan-500/60 mt-2 flex items-center gap-1">
                        <Plus size={10} /> Configurer
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal add key */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter une clé API">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-2">
              Provider
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AI_PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProvider(p.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${
                    selectedProvider === p.id
                      ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
                      : "border-slate-700/50 text-slate-500 hover:border-slate-600"
                  }`}
                >
                  <span className="text-lg">{p.icon}</span>
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Input
              label="Clé API"
              type={showKey ? "text" : "password"}
              placeholder={`${getProvider(selectedProvider)?.keyPrefix || ""}...`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-8 text-slate-600 hover:text-slate-400"
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          <Input
            label="Label (optionnel)"
            placeholder="Ex: Compte personnel"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />

          <div className="glass rounded-lg p-3 border border-amber-500/20">
            <p className="text-xs text-amber-400/80">
              🔒 Vos clés sont stockées localement et jamais partagées avec des tiers.
              Elles sont utilisées uniquement pour les requêtes vers les APIs.
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="primary" className="flex-1" onClick={save} loading={loading} disabled={!apiKey.trim()}>
              Enregistrer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
