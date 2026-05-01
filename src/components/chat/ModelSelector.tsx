"use client";
import { AI_PROVIDERS, getProvider } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
  provider: string;
  model: string;
  onChange: (provider: string, model: string) => void;
  availableProviders?: string[];
}

export function ModelSelector({ provider, model, onChange, availableProviders }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = getProvider(provider);
  const filtered = availableProviders
    ? AI_PROVIDERS.filter((p) => availableProviders.includes(p.id))
    : AI_PROVIDERS;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-sm text-slate-300 hover:border-slate-600 transition-all"
      >
        <span>{current?.icon}</span>
        <span className="hidden sm:block text-xs font-medium">{current?.name}</span>
        <span className="text-xs text-slate-500 hidden md:block">/ {model}</span>
        <ChevronDown size={12} className={cn("transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 glass rounded-xl border border-cyan-500/20 shadow-2xl min-w-[300px] p-2">
          {filtered.length === 0 ? (
            <p className="text-xs text-slate-500 p-3 text-center">
              Aucun provider configuré. Ajoutez vos clés API dans les paramètres.
            </p>
          ) : (
            filtered.map((p) => (
              <div key={p.id} className="mb-1">
                <div className="flex items-center gap-2 px-2 py-1">
                  <span>{p.icon}</span>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{p.name}</span>
                </div>
                {p.models.map((m) => (
                  <button
                    key={m}
                    onClick={() => { onChange(p.id, m); setOpen(false); }}
                    className={cn(
                      "w-full text-left px-4 py-1.5 rounded-lg text-sm transition-all",
                      provider === p.id && model === m
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
