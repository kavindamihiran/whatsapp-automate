"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCheck, LoaderCircle, Send, Square } from "lucide-react";
import type { ValidationResult } from "@/lib/phone";

type Props = {
  results: ValidationResult[];
  message: string;
  onMarkSent: (index: number) => void;
};

type Job = {
  id: string;
  status: "starting" | "waiting_for_login" | "running" | "completed" | "failed" | "stopped";
  total: number;
  current: number;
  sent: number;
  failed: number;
  sentPositions: number[];
  errors: string[];
  message: string;
};

async function readResponse(response: Response) {
  const data = (await response.json()) as Job | { error: string };
  if (!response.ok) throw new Error("error" in data ? data.error : "Automation request failed.");
  return data as Job;
}

export function BulkActions({ results, message, onMarkSent }: Props) {
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState("");
  const [hasConsent, setHasConsent] = useState(false);
  const markedPositions = useRef(new Set<number>());

  const validRecipients = useMemo(
    () => results.flatMap((result, index) => (result.valid ? [{ result, index }] : [])),
    [results],
  );
  const running = Boolean(
    job && ["starting", "waiting_for_login", "running"].includes(job.status),
  );

  useEffect(() => {
    if (!job || !running) return;
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/automation/status?id=${encodeURIComponent(job.id)}`, {
          cache: "no-store",
        });
        setJob(await readResponse(response));
      } catch (pollError) {
        setError(pollError instanceof Error ? pollError.message : "Could not read automation status.");
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [job, running]);

  useEffect(() => {
    if (!job) return;
    job.sentPositions.forEach((position) => {
      if (markedPositions.current.has(position)) return;
      const recipient = validRecipients[position];
      if (recipient) onMarkSent(recipient.index);
      markedPositions.current.add(position);
    });
  }, [job, onMarkSent, validRecipients]);

  const start = useCallback(async () => {
    setError("");
    markedPositions.current.clear();
    try {
      const response = await fetch("/api/automation/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numbers: validRecipients.map(({ result }) => result.normalized),
          message,
          delay: 5,
        }),
      });
      setJob(await readResponse(response));
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : "Could not start automation.");
    }
  }, [message, validRecipients]);

  const stop = useCallback(async () => {
    if (!job) return;
    try {
      const response = await fetch("/api/automation/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: job.id }),
      });
      setJob(await readResponse(response));
    } catch (stopError) {
      setError(stopError instanceof Error ? stopError.message : "Could not stop automation.");
    }
  }, [job]);

  if (validRecipients.length === 0 || !message.trim()) return null;

  const finished = (job?.sent ?? 0) + (job?.failed ?? 0);
  const progress = job?.total ? Math.round((finished / job.total) * 100) : 0;

  return (
    <section className="card p-5 animate-fade-in" aria-labelledby="send-all-heading">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 id="send-all-heading" className="text-sm font-semibold">Send all automatically</h3>
          <p className="mt-1 text-xs text-slate-500">
            Uses one WhatsApp window with a 5-second delay.
          </p>
        </div>
        <span className="chip">{validRecipients.length} recipients</span>
      </div>

      {!running && (
        <label className="mt-4 flex cursor-pointer items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={hasConsent}
            onChange={(event) => setHasConsent(event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-emerald-600"
          />
          I have permission from these recipients to message them.
        </label>
      )}

      {running ? (
        <button type="button" onClick={stop} className="btn mt-4 w-full bg-rose-600 text-white hover:bg-rose-700">
          <Square size={15} /> Stop sending
        </button>
      ) : (
        <button type="button" onClick={start} disabled={!hasConsent} className="btn-primary mt-4 w-full">
          <Send size={16} /> Send all {validRecipients.length} messages
        </button>
      )}

      {job && (
        <div className="mt-4" aria-live="polite">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
              {running && <LoaderCircle size={14} className="animate-spin" />}
              {job.message}
            </span>
            <span className="shrink-0 text-slate-500">{job.sent} sent · {job.failed} failed</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {job?.status === "completed" && job.failed === 0 && (
        <p className="mt-3 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCheck size={15} /> All messages were submitted to WhatsApp.
        </p>
      )}

      {(error || job?.status === "failed") && (
        <p className="mt-3 text-xs text-rose-600 dark:text-rose-400">{error || job?.message}</p>
      )}

      {job && job.errors.length > 0 && (
        <details className="mt-3 text-xs text-rose-600 dark:text-rose-400">
          <summary className="cursor-pointer">Show failure details</summary>
          <ul className="mt-2 space-y-1 pl-4">
            {job.errors.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
          </ul>
        </details>
      )}

      <p className="mt-3 text-[11px] text-slate-500">
        Keep this page open. The same browser window is reused for every recipient.
      </p>
    </section>
  );
}
