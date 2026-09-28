import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SITE_NAME, SITE_URL } from "@/lib/slug";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Overlap", template: "%s · Overlap" },
  description: "Pick one film, book or song a day. See everyone who picked the same.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let handle: string | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("handle").eq("id", user.id).maybeSingle();
    handle = data?.handle ?? null;
  }
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,700&family=Young+Serif&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="app">
          <header className="top">
            <Link href="/" className="wordmark">{SITE_NAME}</Link>
            <nav aria-label="Main">
              <Link href="/">Today</Link>
              <Link href="/search">Search</Link>
              {handle && <Link href={`/u/${handle}`}>You</Link>}
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
