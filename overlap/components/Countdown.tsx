"use client";

import { useEffect, useState } from "react";

// Time until the global day turns over at midnight UTC.
function left() {
  const now = new Date();
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  const m = Math.max(0, Math.floor((next - now.getTime()) / 60000));
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export default function Countdown() {
  const [t, setT] = useState<string | null>(null);
  useEffect(() => { setT(left()); const i = setInterval(() => setT(left()), 30000); return () => clearInterval(i); }, []);
  return <p className="meta countdown">{t ? `New day for everyone in ${t}` : "\u00a0"}</p>;
}
