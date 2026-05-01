"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Cpu, User, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erreur lors de la création du compte");
        return;
      }

      toast.success("Compte créé ! Connexion en cours...");
      await signIn("credentials", { email, password, redirect: false });
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] bg-grid flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/4 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 mb-3 glow">
            <Cpu size={28} className="text-cyan-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-200">Créer votre JARVIS</h1>
          <p className="text-sm text-slate-600 mt-1">Votre assistant IA personnel vous attend</p>
        </div>

        <div className="glass rounded-2xl p-6 border border-slate-700/30">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nom"
              type="text"
              placeholder="Tony Stark"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User size={14} />}
              autoComplete="name"
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="tony@stark.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={14} />}
              autoComplete="email"
              required
            />
            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={14} />}
              autoComplete="new-password"
              required
              minLength={6}
            />
            <Button
              type="submit"
              variant="solid"
              className="w-full"
              loading={loading}
            >
              Créer mon compte
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-600 mt-4">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            Se connecter
          </Link>
        </p>

        <p className="text-center mt-4">
          <Link href="/" className="text-xs text-slate-700 hover:text-slate-500 transition-colors">
            ← Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
