"use client";

import { useState } from "react";

export default function ShareBox({ site, slug, handle, title, creator }: { site: string; slug: string; handle: string; title: string; creator: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${site}/${slug}/${handle}`;
  const shown = url.replace(/^https?:\/\//, "");
  const post = "https://x.com/intent/post?text=" + encodeURIComponent(`Today's pick: ${title} (${creator})`) + "&url=" + encodeURIComponent(url);
  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1600); }
    catch { window.prompt("Copy this link", url); }
  }
  return (
    <div className="share">
      <p className="url">{shown}</p>
      <div className="actions">
        <a className="btn solid" href={post} target="_blank" rel="noopener noreferrer">Post on X</a>
        <button className="btn" onClick={copy}>{copied ? "Copied" : "Copy link"}</button>
      </div>
    </div>
  );
}
