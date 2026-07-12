"use client";

import { useState } from "react";
import { Save, FileDown, Trash2, Clock, MessageSquare } from "lucide-react";
import { useLocalStorage } from "@/lib/useLocalStorage";

export type Campaign = {
  id: string;
  name: string;
  numbers: string;
  message: string;
  createdAt: number;
};

type Props = {
  onLoad: (c: Campaign) => void;
  currentNumbers: string;
  currentMessage: string;
};

export function Templates({
  onLoad,
  currentNumbers,
  currentMessage,
}: Props) {
  const [saved, setSaved] = useLocalStorage<Campaign[]>("wa-templates", []);
  const [name, setName] = useState("");
  const [showSave, setShowSave] = useState(false);

  function save() {
    if (!name.trim()) return;
    const campaign: Campaign = {
      id: Date.now().toString(),
      name: name.trim(),
      numbers: currentNumbers,
      message: currentMessage,
      createdAt: Date.now(),
    };
    setSaved([campaign, ...saved.filter((c) => c.id !== campaign.id)]);
    setName("");
    setShowSave(false);
  }

  function remove(id: string) {
    setSaved(saved.filter((c) => c.id !== id));
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <FileDown size={16} />
          Saved Campaigns
        </h3>
        <button
          type="button"
          onClick={() => setShowSave(!showSave)}
          className="btn-primary !py-1.5 !px-3 text-xs"
          disabled={!currentNumbers.trim() || !currentMessage.trim()}
        >
          <Save size={14} />
          {showSave ? "Cancel" : "Save Current"}
        </button>
      </div>

      {showSave && (
        <div className="mt-3 flex items-center gap-2 animate-fade-in">
          <input
            className="input flex-1 !py-1.5 text-sm"
            placeholder="Campaign name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && save()}
          />
          <button
            type="button"
            onClick={save}
            className="btn-primary !py-1.5 !px-3 text-xs"
            disabled={!name.trim()}
          >
            Save
          </button>
        </div>
      )}

      {saved.length === 0 && !showSave && (
        <p className="mt-3 text-xs text-slate-500">
          Your saved campaigns will appear here.
        </p>
      )}

      {saved.length > 0 && (
        <div className="mt-3 space-y-2">
          {saved.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/30"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                    {c.name}
                  </span>
                  <span className="chip text-[10px]">
                    <MessageSquare size={10} />
                    {c.numbers.split(/[\n,;]+/).filter(Boolean).length}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {formatDate(c.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onLoad(c)}
                  className="btn-ghost !py-1.5 !px-2.5 text-xs"
                  title="Load this campaign"
                >
                  Load
                </button>
                <button
                  type="button"
                  onClick={() => remove(c.id)}
                  className="btn-ghost !py-1.5 !px-2 text-xs text-rose-500 hover:text-rose-600"
                  title="Delete campaign"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
