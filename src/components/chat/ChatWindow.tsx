"use client";
import { useChat, type Message } from "ai/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";
import { ModelSelector } from "./ModelSelector";
import { cn } from "@/lib/utils";
import { Bot, Sparkles, Volume2, VolumeX, Download, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import type { UploadedFile } from "./FileUpload";

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

  const { messages, append, isLoading, stop, setMessages } = useChat({
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

  useEffect(() => {
    if (!conversationId) { setMessages([]); return; }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Sync provider/model when parent changes
  useEffect(() => { setCurrentProvider(provider); }, [provider]);
  useEffect(() => { setCurrentModel(model); }, [model]);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[#*`>\[\]!]/g, "").slice(0, 600);
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = "fr-FR";
    utt.rate = 1.05;
    window.speechSynthesis.speak(utt);
  }, []);

  const handleSend = useCallback((message: string, file?: UploadedFile | null) => {
    if ((!message.trim() && !file) || isLoading) return;

    if (file) {
      // Build rich message content with file context
      let contextBlock = "";
      if (file.type === "image") {
        contextBlock = `[IMAGE: ${file.filename}]\n(Image jointe — analyse visuelle demandée)`;
        // For vision models, we'd attach base64. For now, describe it.
        append({
          role: "user",
          content: message
            ? `${message}\n\n_Fichier joint : ${file.filename} (${file.type})_`
            : `Analyse cette image : ${file.filename}`,
        });
        return;
      } else if (file.type === "pdf") {
        contextBlock = `[PDF: ${file.filename} — ${file.pages} page(s)]\n\`\`\`\n${file.content?.slice(0, 8000)}\n\`\`\``;
      } else {
        contextBlock = `[FICHIER: ${file.filename}]\n\`\`\`\n${file.content?.slice(0, 8000)}\n\`\`\``;
      }
      append({
        role: "user",
        content: message
          ? `${message}\n\n${contextBlock}`
          : `Voici le contenu de ${file.filename}, analyse-le :\n\n${contextBlock}`,
      });
    } else {
      append({ role: "user", content: message });
    }
  }, [append, isLoading]);

  const handleModelChange = (p: string, m: string) => {
    setCurrentProvider(p);
    setCurrentModel(m);
    onModelChange?.(p, m);
  };

  const exportConversation = async () => {
    if (!conversationId) return;
    const url = `/api/conversations/${conversationId}/export?format=markdown`;
    const a = document.createElement("a");
    a.href = url;
    a.click();
  };

  const clearMessages = () => {
    setMessages([]);
    toast.success("Messages effacés (conversation conservée)");
  };

  const suggestions = [
    "Explique-moi le machine learning en 3 points",
    "Écris un script Python pour lire un CSV",
    "Quelle est la date et l'heure ?",
    "Recherche les dernières actualités tech",
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Bot size={16} className="text-cyan-400" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#020817]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">{assistantName}</p>
            <p className="text-xs text-slate-600">
              {isLoading ? (
                <span className="text-cyan-500/70">En cours de réflexion...</span>
              ) : (
                "Système opérationnel"
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
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
                : "border-slate-800/60 text-slate-600 hover:text-slate-400 hover:border-slate-700"
            )}
            title={ttsEnabled ? "Désactiver la lecture vocale" : "Activer la lecture vocale"}
          >
            {ttsEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>

          {conversationId && messages.length > 0 && (
            <>
              <button
                onClick={exportConversation}
                className="p-2 rounded-lg border border-slate-800/60 text-slate-600 hover:text-slate-400 hover:border-slate-700 transition-all"
                title="Exporter en Markdown"
              >
                <Download size={14} />
              </button>
              <button
                onClick={clearMessages}
                className="p-2 rounded-lg border border-slate-800/60 text-slate-600 hover:text-red-400 hover:border-red-500/30 transition-all"
                title="Effacer l'affichage"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full bg-cyan-500/10 border-2 border-cyan-500/20 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center glow">
                  <Sparkles size={24} className="text-cyan-400" />
                </div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-200 mb-1">
              Bonjour, je suis {assistantName}
            </h3>
            <p className="text-sm text-slate-600 max-w-sm mb-6">
              Posez-moi n&apos;importe quelle question, joignez un fichier, ou demandez-moi de générer du code ou une image.
            </p>
            <div className="grid grid-cols-2 gap-2 max-w-md w-full">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-left px-3 py-2.5 rounded-xl bg-slate-800/30 border border-slate-700/20 text-xs text-slate-500 hover:text-slate-300 hover:border-slate-600/40 hover:bg-slate-800/60 transition-all"
                >
                  {s}
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

        {isLoading && (messages.length === 0 || messages[messages.length - 1]?.role !== "assistant") && (
          <TypingIndicator />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input zone */}
      <div className="px-4 pb-4 pt-2 flex-shrink-0">
        {availableProviders.length === 0 ? (
          <div className="glass rounded-2xl p-4 text-center border border-amber-500/20">
            <p className="text-sm text-amber-400/80">
              Configurez une clé API dans les{" "}
              <a href="/dashboard/keys" className="underline hover:text-amber-300">
                Clés API
              </a>{" "}
              pour activer {assistantName}.
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
