import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhatsApp Bulk Sender — Sri Lanka",
  description:
    "Run local WhatsApp Web automation for opted-in Sri Lankan recipients.",
  keywords: [
    "WhatsApp",
    "bulk",
    "automation",
    "Sri Lanka",
    "WhatsApp Web",
    "localhost",
  ],
  openGraph: {
    title: "WhatsApp Bulk Sender — Sri Lanka",
    description:
      "Local WhatsApp Web automation for opted-in recipients.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10b981" },
    { media: "(prefers-color-scheme: dark)", color: "#022c22" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('wa-theme');
                var d = t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (d) document.documentElement.classList.add('dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
