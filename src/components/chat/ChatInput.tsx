"use client";
import { cn } from "@/lib/utils";
import { Send, Mic, MicOff, StopCircle } from "lucide-react";
import { useRef, useState, useCallback, useEffect } from "react";

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}
interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, onStop, isLoading, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, []);

  useEffect(() => { adjustHeight(); }, [input, adjustHeight]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || disabled) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoice = useCallback(() => {
    const w = window as unknown as Record<string, unknown>;
    const SpeechRec = (w["SpeechRecognition"] || w["webkitSpeechRecognition"]) as (new () => SpeechRecognitionInstance) | undefined;

    if (!SpeechRec) {
      alert("La reconnaissance vocale n'est pas supportée par ce navigateur.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRec();
    recognition.lang = "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from({ length: event.results.length }, (_, i) => event.results[i][0].transcript).join("");
      setInput(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  return (
    <div className="glass border border-cyan-500/20 rounded-2xl p-3">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Parlez à JARVIS... (Entrée pour envoyer, Maj+Entrée pour nouvelle ligne)"
        rows={1}
        disabled={isLoading || disabled}
        className={cn(
          "w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-600 resize-none",
          "focus:outline-none max-h-[200px] overflow-y-auto",
          "transition-all duration-200"
        )}
        style={{ scrollbarWidth: "thin" }}
      />

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/30">
        <div className="flex items-center gap-1">
          <button
            onClick={toggleVoice}
            className={cn(
              "p-2 rounded-lg transition-all",
              isListening
                ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
                : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            )}
            title={isListening ? "Arrêter la dictée" : "Dicter un message"}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          <span className="text-xs text-slate-600">
            {isListening ? "En écoute..." : "Entrée pour envoyer"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {input.length > 0 && (
            <span className="text-xs text-slate-700">{input.length} car.</span>
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
              disabled={!input.trim() || isLoading || disabled}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                input.trim() && !isLoading && !disabled
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
