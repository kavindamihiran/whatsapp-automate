# WhatsApp Bulk Sender — Local Automation

A local WhatsApp Web automation tool built with Next.js, TypeScript, Puppeteer, and Tailwind CSS. Designed for Sri Lankan phone numbers and opted-in recipients.

**Local use only** — the Send All button launches one controlled WhatsApp Web window, sends sequentially, and stores that login on your computer.

---

## Features

- **📱 Sri Lankan number normalization** — auto-converts `0771234567`, `+94 77 123 4567`, etc. to `+94771234567`
- **📄 Paste or upload** numbers from `.txt` / `.csv` files
- **✏️ Simple message editor** for one message to all recipients
- **✅ Live validation** — see which numbers are valid before sending
- **🚀 Send to all** — sends sequentially through one WhatsApp Web window
- **📊 Live progress** — shows sent and failed recipients and supports stopping a job
- **💾 Save campaigns** — templates stored in your browser (localStorage)
- **🌙 Dark mode** — follows system preference, toggleable
- **📱 Fully responsive** — works on desktop and mobile

## How It Works

1. Paste or upload your phone numbers
2. Write your message
3. Review validated numbers
4. Confirm that recipients have given permission
5. Click **Send all**
6. Scan the QR code in the browser window on the first run
7. Keep the localhost page open until the summary appears

The WhatsApp login is saved under `.whatsapp-session/`, which is excluded from Git. Later runs reuse that login until WhatsApp signs it out.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The automation API rejects requests that are not made through localhost.

## Phone Number Formats

| Format | Example | Converted to |
|--------|---------|-------------|
| Local (short) | `0771234567` | `+94771234567` |
| Without 0 | `771234567` | `+94771234567` |
| International (plus) | `+94771234567` | `+94771234567` |
| International (no plus) | `94771234567` | `+94771234567` |
| With spaces/dashes | `077-123 4567` | `+94771234567` |

Only Sri Lankan mobile numbers (9 digits, prefix `7x`) are accepted.

## Project Structure

```
├── app/
│   ├── globals.css          # Tailwind + custom styles
│   ├── layout.tsx           # Root layout with dark mode script
│   ├── api/automation/      # Local start, status, and stop endpoints
│   └── page.tsx             # Main interface
├── components/
│   ├── BulkActions.tsx      # Send All controls and live progress
│   ├── MessageEditor.tsx    # Message textarea
│   ├── NumberList.tsx       # Validated numbers list with individual Send buttons
│   ├── Templates.tsx        # Save/load campaign templates
│   ├── TextAreaWithUpload.tsx # Reusable textarea with file upload
│   └── ThemeToggle.tsx      # Dark mode toggle
├── lib/
│   ├── automationJobs.ts    # Local Puppeteer process manager
│   ├── constants.ts         # Default message
│   ├── phone.ts             # SL number validation + WhatsApp link builder
│   └── useLocalStorage.ts   # Persistent state hook
├── scripts/
│   └── automate.mjs         # One-window WhatsApp Web automation
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── eslint.config.mjs
```

## Tech Stack

- **Next.js 15** (App Router and local API routes)
- **Puppeteer** (local browser automation)
- **TypeScript**
- **Tailwind CSS 3**
- **lucide-react** (icons)
- Runs on **localhost only**

## Important Notes

- The first run opens WhatsApp Web for QR login
- Maximum 50 recipients per Send All job
- A five-second delay is applied between recipients
- Recipients who haven't saved your number will see messages in their requests inbox
- Use responsibly and only with recipient consent

## License

Free for personal and educational use. Follow WhatsApp's Terms of Service.

---

**Disclaimer:** Use for legitimate communication only. Always obtain consent before messaging.
