"use client";
import { cn } from "@/lib/utils";
import { Send, Mic, MicOff, StopCircle } from "lucide-react";
import { useRef, useState, useCallback, useEffect } from "react";
import { FileUpload, type UploadedFile } from "./FileUpload";

interface SpeechRecognitionEvent {
  results: { [i: number]: { [i: number]: { transcript: string } }; length: number };
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

interface ChatInputProps {
  onSend: (message: string, file?: UploadedFile | null) => void;
  onStop?: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, onStop, isLoading, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [attachedFile, setAttachedFile] = useState<UploadedFile | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, []);

  useEffect(() => { adjustHeight(); }, [input, adjustHeight]);

  // Focus on mount
  useEffect(() => { textareaRef.current?.focus(); }, []);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if ((!trimmed && !attachedFile) || isLoading || disabled) return;
    onSend(trimmed, attachedFile);
    setInput("");
    setAttachedFile(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [input, attachedFile, isLoading, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Global keyboard shortcut: Ctrl/Cmd+K focuses the input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const toggleVoice = useCallback(() => {
    const w = window as unknown as Record<string, unknown>;
    const SpeechRec = (w["SpeechRecognition"] || w["webkitSpeechRecognition"]) as (new () => SpeechRecognitionInstance) | undefined;
    if (!SpeechRec) {
      alert("Reconnaissance vocale non supportée par ce navigateur.");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const rec = new SpeechRec();
    rec.lang = "fr-FR";
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from({ length: e.results.length }, (_, i) => e.results[i][0].transcript).join("");
      setInput(transcript);
    };
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  }, [isListening]);

  const canSend = (input.trim() || attachedFile) && !isLoading && !disabled;

  return (
    <div className="glass border border-cyan-500/20 rounded-2xl p-3">
      {/* Attached file preview */}
      {attachedFile && (
        <div className="mb-2">
          <FileUpload onFileReady={setAttachedFile} onRemove={() => setAttachedFile(null)} currentFile={attachedFile} />
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={attachedFile ? "Posez une question sur ce fichier..." : "Parlez à JARVIS... (Ctrl+K pour focus, Entrée pour envoyer)"}
        rows={1}
        disabled={isLoading || disabled}
        className={cn(
          "w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-600 resize-none",
          "focus:outline-none max-h-[200px] overflow-y-auto transition-all duration-200"
        )}
        style={{ scrollbarWidth: "thin" }}
      />

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/30">
        <div className="flex items-center gap-1">
          {/* Voice */}
          <button
            onClick={toggleVoice}
            className={cn(
              "p-2 rounded-lg transition-all",
              isListening
                ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
                : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            )}
            title={isListening ? "Arrêter la dictée" : "Dicter un message (voix)"}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          {/* File upload */}
          {!attachedFile && (
            <FileUpload onFileReady={setAttachedFile} onRemove={() => setAttachedFile(null)} currentFile={null} />
          )}

          <span className="text-xs text-slate-700 ml-1 hidden sm:block">
            {isListening ? "Écoute..." : "Ctrl+K · Maj+Entrée"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {input.length > 50 && (
            <span className="text-xs text-slate-700">{input.length}</span>
          )}
          {isLoading && onStop ? (
            <button
              onClick={onStop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-xs hover:bg-red-500/30 transition-all"
            >
              <StopCircle size={14} />
              Arrêter
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                canSend
                  ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  : "text-slate-700 cursor-not-allowed"
              )}
            >
              <Send size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
