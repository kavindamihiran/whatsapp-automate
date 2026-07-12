"use client";

import { useMemo, useCallback } from "react";
import { MessageCircle, FileText, AlertTriangle } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TextAreaWithUpload } from "@/components/TextAreaWithUpload";
import { MessageEditor } from "@/components/MessageEditor";
import { NumberList } from "@/components/NumberList";
import { BulkActions } from "@/components/BulkActions";
import { Templates } from "@/components/Templates";
import { parseFile, parseNumbers } from "@/lib/phone";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { DEFAULT_MESSAGE } from "@/lib/constants";
import type { Campaign } from "@/components/Templates";

function hash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

export default function HomePage() {
  const [numbersRaw, setNumbersRaw] = useLocalStorage("wa-numbers", "");
  const [message, setMessage] = useLocalStorage("wa-message", "");

  const sentStorageKey = "wa-sent-" + hash(numbersRaw + message);
  const [sentIndices, setSentIndices] = useLocalStorage<number[]>(sentStorageKey, []);

  const sentIndexes = useMemo(() => new Set(sentIndices), [sentIndices]);

  const markSent = useCallback(
    (index: number) => {
      setSentIndices((prev) => {
        if (prev.includes(index)) return prev;
        return [...prev, index];
      });
    },
    [setSentIndices],
  );

  const results = useMemo(() => parseNumbers(numbersRaw), [numbersRaw]);

  const validCount = useMemo(
    () => results.filter((r) => r.valid).length,
    [results],
  );
  const invalidCount = results.length - validCount;

  function loadCampaign(c: Campaign) {
    setNumbersRaw(c.numbers);
    setMessage(c.message);
  }

  return (
    <div className="wa-gradient min-h-screen">
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/60 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
              <MessageCircle size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">
                WhatsApp Bulk Sender
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Sri Lanka &bull; WhatsApp Web
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="text-xl font-bold sm:text-2xl">Send WhatsApp messages</h2>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Add recipients, write a message, then open their WhatsApp chats.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <TextAreaWithUpload
              label="Phone Numbers"
              hint="One per line"
              value={numbersRaw}
              onChange={setNumbersRaw}
              placeholder={
                "0771234567\n+94 77 234 5678\n071-234-5678"
              }
              onFileLoad={(text) =>
                parseFile(text)
                  .map((result) => result.raw)
                  .join("\n")
              }
            />

            <MessageEditor
              value={message}
              onChange={setMessage}
              placeholder={DEFAULT_MESSAGE}
            />
          </div>

          <div className="space-y-4 lg:col-span-2">
            {results.length > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 dark:border-amber-800/40 dark:bg-amber-900/20">
                {invalidCount > 0 ? (
                  <>
                    <AlertTriangle size={14} className="shrink-0 text-amber-600" />
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      {invalidCount} number{invalidCount > 1 ? "s" : ""} need{" "}
                      correction &mdash; Sri Lankan mobile numbers must be 9 digits
                      (e.g. 0771234567).
                    </p>
                  </>
                ) : (
                  <>
                    <FileText size={14} className="shrink-0 text-brand-600" />
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      All {validCount} number{validCount > 1 ? "s" : ""} are
                      valid Sri Lankan mobile numbers.
                    </p>
                  </>
                )}
              </div>
            )}

            <NumberList
              results={results}
              message={message}
              sentIndexes={sentIndexes}
              onMarkSent={markSent}
            />

            {validCount > 0 && message.trim() && (
              <BulkActions
                results={results}
                message={message}
                onMarkSent={markSent}
              />
            )}

            <Templates
              onLoad={loadCampaign}
              currentNumbers={numbersRaw}
              currentMessage={message}
            />
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-slate-500">
          Local-only automation. Your WhatsApp login stays on this computer.
        </p>
      </main>
    </div>
  );
}
