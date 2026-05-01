"use client";
import { useRef, useState } from "react";
import { Paperclip, X, FileText, Image, File, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export interface UploadedFile {
  filename: string;
  type: "image" | "pdf" | "text";
  content: string | null;
  base64?: string;
  mimeType: string;
  pages?: number;
  size: number;
}

interface FileUploadProps {
  onFileReady: (file: UploadedFile) => void;
  onRemove: () => void;
  currentFile: UploadedFile | null;
}

const ACCEPT = "image/*,.pdf,.txt,.md,.csv,.json,.xml,.js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.go,.rs,.html,.css,.sql,.sh,.yaml,.yml";

export function FileUpload({ onFileReady, onRemove, currentFile }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erreur d'upload");
        return;
      }
      onFileReady(data as UploadedFile);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  if (currentFile) {
    const Icon = currentFile.type === "image" ? Image : currentFile.type === "pdf" ? FileText : File;
    const sizeKb = Math.round(currentFile.size / 1024);
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs">
        <Icon size={13} className="text-cyan-400 flex-shrink-0" />
        <span className="text-cyan-300 truncate max-w-[160px]">{currentFile.filename}</span>
        <span className="text-slate-600">{sizeKb} Ko</span>
        <button onClick={onRemove} className="ml-auto text-slate-600 hover:text-red-400 transition-colors">
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <>
      <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={handleChange} />
      <button
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        disabled={uploading}
        className={cn(
          "p-2 rounded-lg transition-all",
          uploading ? "text-cyan-400" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
        )}
        title="Joindre un fichier (PDF, image, code, texte)"
      >
        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
      </button>
    </>
  );
}
