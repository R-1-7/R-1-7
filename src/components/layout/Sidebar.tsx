"use client";
import { cn } from "@/lib/utils";
import { MessageSquare, Settings, Key, BarChart3, LogOut, Menu, X, Cpu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", icon: MessageSquare, label: "Chat" },
  { href: "/dashboard/keys", icon: Key, label: "Clés API" },
  { href: "/dashboard/stats", icon: BarChart3, label: "Statistiques" },
  { href: "/dashboard/settings", icon: Settings, label: "Paramètres" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800/50">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center glow">
          <Cpu size={18} className="text-cyan-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-200 tracking-wider">JARVIS</p>
          <p className="text-xs text-cyan-500/70">Assistant IA</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                active
                  ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent"
              )}
            >
              <Icon size={16} />
              <span>{label}</span>
              {active && (
                <span className="ml-auto w-1 h-1 rounded-full bg-cyan-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-4 border-t border-slate-800/50">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 border-r border-slate-800/50 bg-slate-950/50 h-screen sticky top-0">
        <NavContent />
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-40 p-2 rounded-lg glass border border-slate-700/50 text-slate-400"
      >
        <Menu size={18} />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-56 flex flex-col bg-slate-950 border-r border-slate-800/50">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 p-1 rounded text-slate-500 hover:text-slate-300"
            >
              <X size={18} />
            </button>
            <NavContent />
          </aside>
        </div>
      )}
    </>
  );
}
