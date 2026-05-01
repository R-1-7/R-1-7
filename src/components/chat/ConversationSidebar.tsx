"use client";
import { cn, formatDate, truncate } from "@/lib/utils";
import { Plus, Pin, Trash2, MessageSquare, Search } from "lucide-react";
import { useState } from "react";

interface Conversation {
  id: string;
  title: string;
  pinned: boolean;
  updatedAt: string;
  provider: string;
  model: string;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onPin: (id: string, pinned: boolean) => void;
}

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onPin,
}: ConversationSidebarProps) {
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );
  const pinned = filtered.filter((c) => c.pinned);
  const recent = filtered.filter((c) => !c.pinned);

  const ConvItem = ({ conv }: { conv: Conversation }) => (
    <div
      key={conv.id}
      onMouseEnter={() => setHoveredId(conv.id)}
      onMouseLeave={() => setHoveredId(null)}
      onClick={() => onSelect(conv.id)}
      className={cn(
        "group flex items-start gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all",
        "border border-transparent",
        activeId === conv.id
          ? "bg-cyan-500/10 border-cyan-500/30 text-slate-200"
          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-300"
      )}
    >
      <MessageSquare size={14} className="mt-0.5 flex-shrink-0 text-slate-600" />
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{truncate(conv.title, 35)}</p>
        <p className="text-xs text-slate-600">{formatDate(conv.updatedAt)}</p>
      </div>
      <div
        className={cn(
          "flex items-center gap-1 flex-shrink-0 transition-opacity",
          hoveredId === conv.id ? "opacity-100" : "opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onPin(conv.id, !conv.pinned)}
          className={cn(
            "p-1 rounded hover:bg-slate-700/50",
            conv.pinned ? "text-cyan-400" : "text-slate-600 hover:text-slate-400"
          )}
        >
          <Pin size={11} />
        </button>
        <button
          onClick={() => onDelete(conv.id)}
          className="p-1 rounded text-slate-600 hover:text-red-400 hover:bg-slate-700/50"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* New chat button */}
      <button
        onClick={onNew}
        className="flex items-center gap-2 w-full px-3 py-2.5 mb-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 transition-all"
      >
        <Plus size={16} />
        Nouvelle conversation
      </button>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="w-full bg-slate-900/40 border border-slate-800/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-400 placeholder:text-slate-700 focus:outline-none focus:border-slate-600 transition-colors"
        />
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {pinned.length > 0 && (
          <div className="mb-2">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-2 mb-1">
              Épinglées
            </p>
            {pinned.map((c) => <ConvItem key={c.id} conv={c} />)}
          </div>
        )}
        {recent.length > 0 && (
          <div>
            {pinned.length > 0 && (
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-2 mb-1">
                Récentes
              </p>
            )}
            {recent.map((c) => <ConvItem key={c.id} conv={c} />)}
          </div>
        )}
        {filtered.length === 0 && (
          <p className="text-xs text-slate-700 text-center py-8">
            {search ? "Aucun résultat" : "Aucune conversation"}
          </p>
        )}
      </div>
    </div>
  );
}
