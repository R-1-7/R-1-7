"use client";
import { useEffect, useState } from "react";
import { MessageSquare, Zap, Key, BarChart3 } from "lucide-react";

interface Stats {
  totalConversations: number;
  totalMessages: number;
  activeKeys: number;
  totalTokens: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  sub?: string;
}) {
  return (
    <div className="glass rounded-xl p-5 border border-slate-700/20 hover:border-slate-600/30 transition-all">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-200">{value.toLocaleString("fr-FR")}</p>
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </div>
  );
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-cyan-500/40 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
            <BarChart3 size={24} className="text-cyan-400" />
            Statistiques
          </h1>
          <p className="text-sm text-slate-500 mt-1">Vue d&apos;ensemble de votre utilisation</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={MessageSquare}
            label="Conversations"
            value={stats?.totalConversations || 0}
            color="bg-cyan-500/10 text-cyan-400"
          />
          <StatCard
            icon={Zap}
            label="Messages"
            value={stats?.totalMessages || 0}
            color="bg-violet-500/10 text-violet-400"
          />
          <StatCard
            icon={Key}
            label="Clés actives"
            value={stats?.activeKeys || 0}
            color="bg-green-500/10 text-green-400"
          />
          <StatCard
            icon={BarChart3}
            label="Tokens utilisés"
            value={stats?.totalTokens || 0}
            color="bg-amber-500/10 text-amber-400"
            sub="sur toutes les conversations"
          />
        </div>

        {/* Usage info */}
        <div className="glass rounded-xl p-6 border border-slate-700/20">
          <h2 className="text-sm font-semibold text-slate-400 mb-4">Informations système</h2>
          <div className="space-y-3">
            {[
              { label: "Statut du système", value: "Opérationnel", ok: true },
              { label: "Base de données", value: "SQLite local", ok: true },
              { label: "Modèle par défaut", value: "Configuré dans les paramètres", ok: true },
              { label: "Chiffrement des clés", value: "Stockage sécurisé", ok: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{item.label}</span>
                <span className={item.ok ? "text-green-400" : "text-red-400"}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
