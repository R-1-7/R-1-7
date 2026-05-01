"use client";
"use client";
import { useChat, type Message } from "ai/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";
import { ModelSelector } from "./ModelSelector";
import { cn } from "@/lib/utils";
import { Bot, Sparkles, Volume2, VolumeX } from "lucide-react";
import toast from "react-hot-toast";

interface ChatWindowProps {
  conversationId: string | null;
  provider: string;
  model: string;
  assistantName?: string;
  availableProviders?: string[];
  onModelChange?: (provider: string, model: string) => void;
}

export function ChatWindow({
  conversationId,
  provider,
  model,
  assistantName = "JARVIS",
  availableProviders = [],
  onModelChange,
}: ChatWindowProps) {
  const [currentProvider, setCurrentProvider] = useState(provider);
  const [currentModel, setCurrentModel] = useState(model);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const { messages, input, setInput, handleSubmit, append, isLoading, stop, setMessages } = useChat({
    api: "/api/chat",
    body: { conversationId, provider: currentProvider, model: currentModel },
    onError: (err: Error) => {
      toast.error(err.message || "Erreur lors de la communication avec l'IA");
    },
    onFinish: (message: Message) => {
      if (ttsEnabled && message.role === "assistant") {
        speak(message.content);
      }
    },
  });
  void input; void setInput; void handleSubmit; // used by ChatInput indirectly

  // Load existing messages when conversation changes
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    fetch(`/api/conversations/${conversationId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.messages) {
          setMessages(
            data.messages.map((m: { id: string; role: string; content: string }) => ({
              id: m.id,
              role: m.role as "user" | "assistant",
              content: m.content,
            }))
          );
          setCurrentProvider(data.provider);
          setCurrentModel(data.model);
        }
      })
      .catch(() => {});
  }, [conversationId, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[#*`>\[\]]/g, "").slice(0, 500);
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = "fr-FR";
    utt.rate = 1.1;
    utteranceRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, []);

  const handleSend = useCallback((message: string) => {
    if (!message.trim() || isLoading) return;
    append({ role: "user", content: message });
  }, [append, isLoading]);

  const handleModelChange = (p: string, m: string) => {
    setCurrentProvider(p);
    setCurrentModel(m);
    onModelChange?.(p, m);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Bot size={16} className="text-cyan-400" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border border-slate-900" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">{assistantName}</p>
            <p className="text-xs text-slate-600">Système opérationnel</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ModelSelector
            provider={currentProvider}
            model={currentModel}
            onChange={handleModelChange}
            availableProviders={availableProviders}
          />
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={cn(
              "p-2 rounded-lg border transition-all",
              ttsEnabled
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                : "border-slate-700/50 text-slate-600 hover:text-slate-400"
            )}
            title={ttsEnabled ? "Désactiver la synthèse vocale" : "Activer la synthèse vocale"}
          >
            {ttsEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full bg-cyan-500/10 border-2 border-cyan-500/30 flex items-center justify-center glow">
                <Sparkles size={32} className="text-cyan-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-300 glow-text mb-1">
              Bonjour, je suis {assistantName}
            </h3>
            <p className="text-sm text-slate-600 max-w-sm">
              Votre assistant IA personnel. Posez-moi n&apos;importe quelle question ou confiez-moi une tâche complexe.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2 max-w-sm w-full">
              {[
                "Explique-moi le machine learning",
                "Écris du code Python pour une API",
                "Quelle heure est-il ?",
                "Analyse ce texte pour moi",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSend(suggestion)}
                  className="text-left px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700/30 text-xs text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m: Message, i: number) => {
          const isLast = i === messages.length - 1;
          return (
            <MessageBubble
              key={m.id}
              role={m.role as "user" | "assistant"}
              content={m.content}
              isStreaming={isLast && isLoading && m.role === "assistant"}
            />
          );
        })}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <TypingIndicator />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2">
        {availableProviders.length === 0 ? (
          <div className="glass rounded-2xl p-4 text-center border border-amber-500/20">
            <p className="text-sm text-amber-400">
              Configurez une clé API dans les{" "}
              <a href="/dashboard/settings" className="underline hover:text-amber-300">
                paramètres
              </a>{" "}
              pour commencer à utiliser {assistantName}.
            </p>
          </div>
        ) : (
          <ChatInput
            onSend={handleSend}
            onStop={stop}
            isLoading={isLoading}
            disabled={!conversationId}
          />
        )}
      </div>
    </div>
  );
}
