"use client";
import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { Keyboard } from "lucide-react";

const SHORTCUTS = [
  { keys: ["Ctrl", "K"], desc: "Focaliser le champ de saisie" },
  { keys: ["Entrée"], desc: "Envoyer le message" },
  { keys: ["Maj", "Entrée"], desc: "Nouvelle ligne" },
  { keys: ["Ctrl", "N"], desc: "Nouvelle conversation" },
  { keys: ["Ctrl", "E"], desc: "Exporter la conversation" },
  { keys: ["Ctrl", "/"], desc: "Afficher les raccourcis" },
  { keys: ["Échap"], desc: "Fermer les modales" },
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg border border-slate-800/60 text-slate-700 hover:text-slate-400 hover:border-slate-700 transition-all"
        title="Raccourcis clavier (Ctrl+/)"
      >
        <Keyboard size={14} />
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Raccourcis clavier">
        <div className="space-y-2">
          {SHORTCUTS.map((s) => (
            <div key={s.desc} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-slate-400">{s.desc}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="px-2 py-0.5 text-xs bg-slate-800 border border-slate-700 rounded text-slate-400 font-mono"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-700 mt-4 text-center">Ctrl = ⌘ sur Mac</p>
      </Modal>
    </>
  );
}
