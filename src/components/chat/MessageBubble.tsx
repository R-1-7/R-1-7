"use client";
import { cn } from "@/lib/utils";
import { Bot, User, Copy, Check, Zap } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageBubbleProps {
  role: "user" | "assistant" | "tool";
  content: string;
  isStreaming?: boolean;
  timestamp?: string;
}

export function MessageBubble({ role, content, isStreaming, timestamp }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (role === "tool") {
    return (
      <div className="flex items-start gap-2 text-xs text-slate-500 px-2">
        <Zap size={12} className="mt-0.5 text-amber-500/60 flex-shrink-0" />
        <span className="font-mono">{content}</span>
      </div>
    );
  }

  const isUser = role === "user";

  return (
    <div
      className={cn(
        "group flex gap-3 animate-fade-in-up",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border",
          isUser
            ? "bg-slate-700/60 border-slate-600/50"
            : "bg-cyan-500/10 border-cyan-500/30 glow"
        )}
      >
        {isUser ? (
          <User size={14} className="text-slate-400" />
        ) : (
          <Bot size={14} className="text-cyan-400" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "relative max-w-[80%] rounded-2xl px-4 py-3 text-sm",
          isUser
            ? "bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-tr-sm"
            : "bg-slate-900/60 border border-cyan-500/15 text-slate-200 rounded-tl-sm"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="message-content prose prose-invert prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-cyan-400 ml-1 animate-blink rounded-sm" />
            )}
          </div>
        )}

        {/* Copy button */}
        {!isStreaming && (
          <button
            onClick={copy}
            className={cn(
              "absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity",
              "p-1 rounded-md bg-slate-800 border border-slate-700/50 text-slate-500 hover:text-slate-300"
            )}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
          </button>
        )}

        {timestamp && (
          <span className="block text-xs text-slate-600 mt-1">{timestamp}</span>
        )}
      </div>
    </div>
  );
}
