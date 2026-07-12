"use client";

import { useMemo } from "react";
import { CheckCircle2, Phone, Send, XCircle } from "lucide-react";
import type { ValidationResult } from "@/lib/phone";
import { buildWhatsAppLink } from "@/lib/phone";

type Props = {
  results: ValidationResult[];
  message: string;
  sentIndexes: Set<number>;
  onMarkSent: (index: number) => void;
};

export function NumberList({ results, message, sentIndexes, onMarkSent }: Props) {
  const counts = useMemo(() => {
    let valid = 0;
    let invalid = 0;
    for (const result of results) result.valid ? valid++ : invalid++;
    return { valid, invalid };
  }, [results]);

  if (results.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-slate-500">
        Add phone numbers to preview recipients here.
      </div>
    );
  }

  return (
    <section className="card overflow-hidden" aria-labelledby="recipients-heading">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
        <h3 id="recipients-heading" className="text-sm font-semibold">
          Recipients
        </h3>
        <div className="flex items-center gap-2">
          <span className="chip bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            <CheckCircle2 size={12} /> {counts.valid}
          </span>
          {counts.invalid > 0 && (
            <span className="chip bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
              <XCircle size={12} /> {counts.invalid}
            </span>
          )}
        </div>
      </div>
      <ul className="scrollbar-thin max-h-[420px] divide-y divide-slate-200 overflow-y-auto dark:divide-slate-800">
        {results.map((result, index) => {
          const opened = sentIndexes.has(index);
          return (
            <li
              key={`${result.raw}-${index}`}
              className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {index + 1}
                </span>
                {result.valid ? (
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-mono text-slate-800 dark:text-slate-200">
                      <Phone size={13} className="text-brand-600" />
                      {result.normalized}
                    </div>
                    {opened && <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">Chat opened</p>}
                  </div>
                ) : (
                  <div className="min-w-0">
                    <div className="font-mono text-rose-600">{result.raw}</div>
                    <div className="text-xs text-rose-500">{result.reason}</div>
                  </div>
                )}
              </div>
              {result.valid && (
                <a
                  href={buildWhatsAppLink(result.normalized!, message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onMarkSent(index)}
                  aria-disabled={!message.trim()}
                  className="btn-primary !px-3 !py-1.5 text-xs aria-disabled:pointer-events-none aria-disabled:opacity-50"
                >
                  <Send size={14} /> Send
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
