import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Cpu, Zap, Shield, Globe, MessageSquare, Mic, ArrowRight, Check } from "lucide-react";

export default async function LandingPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#020817] bg-grid text-slate-200 overflow-x-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Cpu size={16} className="text-cyan-400" />
          </div>
          <span className="font-bold text-slate-200 tracking-wider">JARVIS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
            Connexion
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-sm font-medium hover:bg-cyan-500/30 transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            Commencer
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-20 pb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Système opérationnel — Multi-IA
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 leading-tight">
          <span className="text-slate-200">Votre assistant</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
            JARVIS Personnel
          </span>
        </h1>

        <p className="text-lg text-slate-500 max-w-xl mx-auto mb-8">
          Un assistant IA autonome et intelligent. Branchez vos propres clés API,
          choisissez votre modèle favori, et conversez naturellement — même à la voix.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-slate-900 font-semibold hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)]"
          >
            Créer mon assistant
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all"
          >
            Se connecter
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 py-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: Zap,
              title: "Multi-IA",
              desc: "OpenAI GPT-4, Claude, Gemini, Mistral, Groq — branchez vos clés API et choisissez votre modèle.",
              color: "text-amber-400",
              bg: "bg-amber-500/10 border-amber-500/20",
            },
            {
              icon: Mic,
              title: "Commandes vocales",
              desc: "Dictez vos messages et écoutez les réponses grâce à la synthèse vocale intégrée.",
              color: "text-cyan-400",
              bg: "bg-cyan-500/10 border-cyan-500/20",
            },
            {
              icon: MessageSquare,
              title: "Historique complet",
              desc: "Retrouvez toutes vos conversations, épinglez les importantes, recherchez rapidement.",
              color: "text-violet-400",
              bg: "bg-violet-500/10 border-violet-500/20",
            },
            {
              icon: Globe,
              title: "Outils autonomes",
              desc: "L'assistant peut calculer, récupérer l'heure, générer du code et bien plus encore.",
              color: "text-green-400",
              bg: "bg-green-500/10 border-green-500/20",
            },
            {
              icon: Shield,
              title: "Données privées",
              desc: "Vos clés API et conversations restent sur votre serveur. Aucune donnée partagée.",
              color: "text-red-400",
              bg: "bg-red-500/10 border-red-500/20",
            },
            {
              icon: Cpu,
              title: "Interface Jarvis",
              desc: "Un design futuriste inspiré de l'IA emblématique d'Iron Man, optimisé mobile.",
              color: "text-indigo-400",
              bg: "bg-indigo-500/10 border-indigo-500/20",
            },
          ].map((f) => (
            <div
              key={f.title}
              className={`glass rounded-xl p-5 border ${f.bg} hover:scale-[1.02] transition-transform`}
            >
              <div className={`w-9 h-9 rounded-lg ${f.bg} flex items-center justify-center mb-3`}>
                <f.icon size={18} className={f.color} />
              </div>
              <h3 className="font-semibold text-slate-200 mb-1">{f.title}</h3>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Providers */}
      <section className="relative z-10 px-6 py-8 text-center">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-6">
          Compatible avec tous les grands providers
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {["🤖 OpenAI", "🧠 Anthropic", "✨ Google", "🌪️ Mistral", "⚡ Groq"].map((p) => (
            <span
              key={p}
              className="px-4 py-2 rounded-lg border border-slate-800/50 bg-slate-900/30 text-sm text-slate-500"
            >
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-16 max-w-xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-slate-200 mb-2">100% gratuit et open source</h2>
        <p className="text-slate-500 mb-6 text-sm">
          Hébergez vous-même ou déployez sur Vercel. Vous payez uniquement les APIs que vous utilisez.
        </p>
        <div className="glass rounded-2xl p-6 border border-cyan-500/20">
          <p className="text-3xl font-bold text-cyan-400 mb-1">0€</p>
          <p className="text-slate-500 text-sm mb-4">Auto-hébergé</p>
          <ul className="text-sm text-left space-y-2 mb-6">
            {[
              "Conversations illimitées",
              "Tous les providers IA",
              "Voix et reconnaissance vocale",
              "Historique complet",
              "Données 100% privées",
              "Code source disponible",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-slate-400">
                <Check size={14} className="text-green-400 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-cyan-500 text-slate-900 font-semibold hover:bg-cyan-400 transition-all"
          >
            Commencer maintenant
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 px-6 py-6 text-center text-xs text-slate-700">
        JARVIS — Assistant IA Personnel &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
