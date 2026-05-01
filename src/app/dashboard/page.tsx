"use client";
import { useState, useEffect, useCallback } from "react";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Conversation {
  id: string;
  title: string;
  pinned: boolean;
  updatedAt: string;
  provider: string;
  model: string;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [prefs, setPrefs] = useState({ provider: "openai", model: "gpt-4o", assistantName: "JARVIS" });

  const loadConversations = useCallback(async () => {
    const res = await fetch("/api/conversations");
    const data = await res.json();
    if (Array.isArray(data)) setConversations(data);
  }, []);

  const loadKeys = useCallback(async () => {
    const res = await fetch("/api/keys");
    const data = await res.json();
    if (Array.isArray(data)) {
      setAvailableProviders(data.filter((k: { isActive: boolean }) => k.isActive).map((k: { provider: string }) => k.provider));
    }
  }, []);

  const loadPrefs = useCallback(async () => {
    const res = await fetch("/api/preferences");
    const data = await res.json();
    if (data?.defaultProvider) {
      setPrefs({
        provider: data.defaultProvider,
        model: data.defaultModel,
        assistantName: data.assistantName || "JARVIS",
      });
    }
  }, []);

  useEffect(() => {
    loadConversations();
    loadKeys();
    loadPrefs();
  }, [loadConversations, loadKeys, loadPrefs]);

  const createConversation = async () => {
    const res = await fetch("/api/conversations", { method: "POST" });
    const conv = await res.json();
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
  };

  const deleteConversation = async (id: string) => {
    await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
    toast.success("Conversation supprimée");
  };

  const pinConversation = async (id: string, pinned: boolean) => {
    await fetch(`/api/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned }),
    });
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, pinned } : c)));
  };

  const active = conversations.find((c) => c.id === activeId);

  return (
    <div className="flex h-full">
      {/* Conversation list */}
      <div
        className={cn(
          "flex-shrink-0 border-r border-slate-800/50 bg-slate-950/30 transition-all duration-300 overflow-hidden",
          sidebarOpen ? "w-64" : "w-0"
        )}
      >
        <div className="w-64 h-full p-3">
          <ConversationSidebar
            conversations={conversations}
            activeId={activeId}
            onSelect={setActiveId}
            onNew={createConversation}
            onDelete={deleteConversation}
            onPin={pinConversation}
          />
        </div>
      </div>

      {/* Toggle sidebar */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute left-[calc(var(--sidebar-w,0px)+56px)] top-1/2 -translate-y-1/2 z-10 w-5 h-10 glass border border-slate-700/50 rounded-r-lg flex items-center justify-center text-slate-600 hover:text-slate-400 transition-all"
        style={{
          left: sidebarOpen ? "calc(256px + 56px)" : "56px",
        }}
      >
        {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>

      {/* Chat area */}
      <div className="flex-1 overflow-hidden">
        {activeId ? (
          <ChatWindow
            conversationId={activeId}
            provider={active?.provider || prefs.provider}
            model={active?.model || prefs.model}
            assistantName={prefs.assistantName}
            availableProviders={availableProviders}
            onModelChange={async (p, m) => {
              if (!activeId) return;
              await fetch(`/api/conversations/${activeId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider: p, model: m }),
              });
              setConversations((prev) =>
                prev.map((c) => (c.id === activeId ? { ...c, provider: p, model: m } : c))
              );
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-cyan-500/5 border-2 border-cyan-500/20 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center glow animate-pulse">
                  <span className="text-2xl font-bold text-cyan-400 glow-text">J</span>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-200 mb-2">
              Bienvenue dans {prefs.assistantName}
            </h2>
            <p className="text-slate-500 mb-6 max-w-sm">
              Votre assistant IA personnel. Créez une nouvelle conversation pour commencer.
            </p>
            <button
              onClick={createConversation}
              className="px-6 py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-medium hover:bg-cyan-500/30 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              Démarrer une conversation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
