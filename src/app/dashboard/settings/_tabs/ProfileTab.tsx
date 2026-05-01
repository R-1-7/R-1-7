"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Save, User } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function ProfileTab() {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session]);

  const saveName = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        await update({ name });
        toast.success("Profil mis à jour");
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Le nouveau mot de passe doit faire au moins 6 caractères");
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Mot de passe modifié");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        toast.error(data.error || "Erreur");
      }
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4 p-4 glass rounded-xl border border-slate-700/20">
        <div className="w-14 h-14 rounded-full bg-cyan-500/10 border-2 border-cyan-500/30 flex items-center justify-center text-xl font-bold text-cyan-400">
          {session?.user?.name?.[0]?.toUpperCase() || <User size={24} />}
        </div>
        <div>
          <p className="font-semibold text-slate-200">{session?.user?.name || "—"}</p>
          <p className="text-sm text-slate-500">{session?.user?.email}</p>
        </div>
      </div>

      {/* Name */}
      <section className="glass rounded-xl p-5 border border-slate-700/20">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Informations</h2>
        <div className="space-y-4">
          <Input
            label="Nom affiché"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Votre nom"
          />
          <Button variant="primary" onClick={saveName} loading={loading}>
            <Save size={14} /> Sauvegarder
          </Button>
        </div>
      </section>

      {/* Password */}
      <section className="glass rounded-xl p-5 border border-slate-700/20">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Changer le mot de passe</h2>
        <div className="space-y-4">
          <Input
            label="Mot de passe actuel"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label="Nouveau mot de passe"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Button variant="primary" onClick={changePassword} loading={pwLoading}>
            <Save size={14} /> Modifier le mot de passe
          </Button>
        </div>
      </section>
    </div>
  );
}
