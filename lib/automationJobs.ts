import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { randomUUID } from "node:crypto";
import path from "node:path";

export type AutomationStatus =
  | "starting"
  | "waiting_for_login"
  | "running"
  | "completed"
  | "failed"
  | "stopped";

type AutomationEvent = {
  type: "waiting_for_login" | "running" | "sending" | "sent" | "failed" | "completed";
  position?: number;
  phone?: string;
  error?: string;
};

export type AutomationJobView = {
  id: string;
  status: AutomationStatus;
  total: number;
  current: number;
  sent: number;
  failed: number;
  sentPositions: number[];
  errors: string[];
  message: string;
};

type AutomationJob = AutomationJobView & {
  child: ChildProcessWithoutNullStreams;
};

const globalJobs = globalThis as typeof globalThis & {
  whatsappAutomationJobs?: Map<string, AutomationJob>;
  whatsappAutomationCleanupRegistered?: boolean;
};

const jobs = globalJobs.whatsappAutomationJobs ?? new Map<string, AutomationJob>();
globalJobs.whatsappAutomationJobs = jobs;

if (!globalJobs.whatsappAutomationCleanupRegistered) {
  process.once("exit", () => {
    for (const job of jobs.values()) {
      if (!job.child.killed) job.child.kill("SIGTERM");
    }
  });
  globalJobs.whatsappAutomationCleanupRegistered = true;
}

function publicJob(job: AutomationJob): AutomationJobView {
  const { child: _child, ...view } = job;
  return view;
}

function consumeLines(
  stream: NodeJS.ReadableStream,
  onLine: (line: string) => void,
) {
  let buffer = "";
  stream.on("data", (chunk: Buffer | string) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";
    lines.forEach(onLine);
  });
  stream.on("end", () => {
    if (buffer) onLine(buffer);
  });
}

export function startAutomation(input: {
  numbers: string[];
  message: string;
  delay: number;
}): AutomationJobView {
  const active = Array.from(jobs.values()).find((job) =>
    ["starting", "waiting_for_login", "running"].includes(job.status),
  );
  if (active) throw new Error("Another Send All job is already running.");

  const id = randomUUID();
  const child = spawn(
    process.execPath,
    [path.join(process.cwd(), "scripts", "automate.mjs"), "--stdin"],
    { cwd: process.cwd(), stdio: ["pipe", "pipe", "pipe"] },
  );
  const job: AutomationJob = {
    id,
    child,
    status: "starting",
    total: input.numbers.length,
    current: 0,
    sent: 0,
    failed: 0,
    sentPositions: [],
    errors: [],
    message: "Starting the local browser…",
  };
  jobs.set(id, job);

  consumeLines(child.stdout, (line) => {
    if (!line.startsWith("AUTOMATION_EVENT:")) return;
    try {
      const event = JSON.parse(line.slice("AUTOMATION_EVENT:".length)) as AutomationEvent;
      if (event.type === "waiting_for_login") {
        job.status = "waiting_for_login";
        job.message = "Scan the QR code in the opened WhatsApp window.";
      } else if (event.type === "running") {
        job.status = "running";
        job.message = "WhatsApp is connected. Sending messages…";
      } else if (event.type === "sending") {
        job.status = "running";
        job.current = (event.position ?? 0) + 1;
        job.message = `Sending ${job.current} of ${job.total}…`;
      } else if (event.type === "sent") {
        const position = event.position ?? 0;
        if (!job.sentPositions.includes(position)) job.sentPositions.push(position);
        job.sent = job.sentPositions.length;
      } else if (event.type === "failed") {
        job.failed += 1;
        job.errors.push(`${event.phone ?? "Unknown number"}: ${event.error ?? "Send failed"}`);
        job.errors = job.errors.slice(-10);
      } else if (event.type === "completed") {
        job.status = "completed";
        job.current = job.total;
        job.message = `Finished: ${job.sent} sent, ${job.failed} failed.`;
      }
    } catch {
      // Ignore ordinary Puppeteer output and malformed diagnostic lines.
    }
  });

  consumeLines(child.stderr, (line) => {
    if (!line.trim()) return;
    job.errors.push(line.trim());
    job.errors = job.errors.slice(-10);
  });

  child.on("error", (error) => {
    job.status = "failed";
    job.message = error.message;
  });
  child.on("close", (code, signal) => {
    if (job.status === "stopped" || job.status === "completed") return;
    job.status = "failed";
    job.message = signal
      ? `Automation stopped by ${signal}.`
      : `Automation process exited with code ${code ?? "unknown"}.`;
  });

  child.stdin.end(JSON.stringify(input));
  setTimeout(() => jobs.delete(id), 60 * 60 * 1000).unref();
  return publicJob(job);
}

export function getAutomation(id: string): AutomationJobView | null {
  const job = jobs.get(id);
  return job ? publicJob(job) : null;
}

export function stopAutomation(id: string): AutomationJobView | null {
  const job = jobs.get(id);
  if (!job) return null;
  if (["starting", "waiting_for_login", "running"].includes(job.status)) {
    job.status = "stopped";
    job.message = "Stopped by user.";
    job.child.kill("SIGTERM");
  }
  return publicJob(job);
}
