"use client";
import { useState } from "react";
import { Settings, User, Cpu, Globe, Shield, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import ProfileTab from "./_tabs/ProfileTab";
import ModelTab from "./_tabs/ModelTab";
import OAuthTab from "./_tabs/OAuthTab";
import AppTab from "./_tabs/AppTab";
import SmtpTab from "./_tabs/SmtpTab";

const TABS = [
  { id: "profile", label: "Profil", icon: User },
  { id: "model", label: "Modèle IA", icon: Cpu },
  { id: "oauth", label: "OAuth", icon: Shield },
  { id: "app", label: "Application", icon: Globe },
  { id: "smtp", label: "Email SMTP", icon: Mail },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SettingsPage() {
  const [active, setActive] = useState<TabId>("profile");

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-800/50 flex-shrink-0">
        <h1 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <Settings size={20} className="text-cyan-400" />
          Paramètres
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Configurez JARVIS et vos intégrations</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar tabs */}
        <nav className="w-44 flex-shrink-0 border-r border-slate-800/50 p-3 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all",
                active === id
                  ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 border border-transparent"
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {active === "profile" && <ProfileTab />}
          {active === "model" && <ModelTab />}
          {active === "oauth" && <OAuthTab />}
          {active === "app" && <AppTab />}
          {active === "smtp" && <SmtpTab />}
        </div>
      </div>
    </div>
  );
}
