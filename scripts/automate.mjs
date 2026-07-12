#!/usr/bin/env node

import puppeteer from "puppeteer";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

let browser;
let shuttingDown = false;

function emit(event) {
  process.stdout.write(`AUTOMATION_EVENT:${JSON.stringify(event)}\n`);
}

function wait(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

async function readStdin() {
  let input = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) input += chunk;
  return JSON.parse(input);
}

async function readConfig() {
  if (process.argv.includes("--stdin")) return readStdin();

  const configFlag = process.argv.indexOf("--config");
  const configPath = configFlag >= 0 ? process.argv[configFlag + 1] : "campaign.json";
  const fullPath = resolve(process.cwd(), configPath);
  if (!existsSync(fullPath)) {
    throw new Error(`Config file not found: ${fullPath}`);
  }
  return JSON.parse(readFileSync(fullPath, "utf8"));
}

async function closeBrowser() {
  if (shuttingDown) return;
  shuttingDown = true;
  if (browser) await browser.close().catch(() => undefined);
}

async function openWhatsApp(profilePath) {
  browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    userDataDir: profilePath,
    args: ["--start-maximized"],
  });

  const pages = await browser.pages();
  const page = pages[0] ?? (await browser.newPage());
  page.setDefaultTimeout(30_000);
  await page.goto("https://web.whatsapp.com", {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  return page;
}

async function openComposer(page, url) {
  const selector =
    'footer [contenteditable="true"][role="textbox"], footer div[contenteditable="true"]';

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    const composer = await page
      .waitForSelector(selector, { visible: true, timeout: attempt === 1 ? 35_000 : 60_000 })
      .catch(() => null);

    if (composer) return composer;
    if (attempt === 1) {
      // WhatsApp can expose the chat list before its first conversation is ready.
      // Return to the inbox, let it finish starting, then retry this recipient once.
      await page.goto("https://web.whatsapp.com", {
        waitUntil: "domcontentloaded",
        timeout: 60_000,
      });
      await page.waitForSelector('#pane-side, [data-testid="chat-list"]', { timeout: 60_000 });
      await wait(2500);
    }
  }

  throw new Error("Message box did not load after two attempts.");
}

process.on("SIGTERM", async () => {
  await closeBrowser();
  process.exit(0);
});
process.on("SIGINT", async () => {
  await closeBrowser();
  process.exit(0);
});

async function main() {
  const config = await readConfig();
  const numbers = Array.isArray(config.numbers) ? config.numbers : [];
  const message = typeof config.message === "string" ? config.message.trim() : "";
  const delay = Number.isFinite(config.delay) ? config.delay : 5;

  if (numbers.length === 0) throw new Error("No phone numbers provided.");
  if (!message) throw new Error("No message provided.");

  const profilePath = resolve(process.cwd(), ".whatsapp-session");
  const page = await openWhatsApp(profilePath);

  emit({ type: "waiting_for_login" });
  await page.waitForSelector('#pane-side, [data-testid="chat-list"]', { timeout: 0 });
  emit({ type: "running" });
  await wait(3000);

  let sent = 0;
  let failed = 0;

  for (let position = 0; position < numbers.length; position += 1) {
    const phone = String(numbers[position]).replace(/\D/g, "");
    emit({ type: "sending", position, phone });

    try {
      const url = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
      const composer = await openComposer(page, url);

      // Give WhatsApp time to finish inserting the pre-filled message.
      await wait(1200);
      const sendButton = await page.$(
        'button[aria-label="Send"], button[data-testid="compose-btn-send"], span[data-icon="send"]',
      );

      if (sendButton) {
        await sendButton.click();
      } else {
        await composer.press("Enter");
      }

      // WhatsApp frequently changes the DOM used for outgoing message bubbles.
      // A successful click/Enter is the reliable submission boundary; allow the
      // client a moment to dispatch it before navigating to the next recipient.
      await wait(2000);

      sent += 1;
      emit({ type: "sent", position, phone });
    } catch (error) {
      failed += 1;
      emit({
        type: "failed",
        position,
        phone,
        error: error instanceof Error ? error.message : "Unknown send error",
      });
    }

    if (position < numbers.length - 1) await wait(delay * 1000);
  }

  emit({ type: "completed", sent, failed });
  await wait(1500);
  await closeBrowser();
}

main().catch(async (error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  await closeBrowser();
  process.exit(1);
});
