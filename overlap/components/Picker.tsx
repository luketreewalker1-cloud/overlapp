"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { pickToday } from "@/app/actions";
import { slugify, TYPE_WORD, type Work, type WorkType } from "@/lib/slug";

// mode "pick": choose today's work. mode "browse": jump to a work's room.
export default function Picker({ mode }: { mode: "pick" | "browse" }) {
  const router = useRouter();
  const [type, setType] = useState<WorkType>("film");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Work[]>([]);
  const [status, setStatus] = useState("");
  const [confirming, setConfirming] = useState<Work | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); setStatus(""); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setStatus("Searching…");
      try {
        const r = await fetch(`/api/search?type=${type}&q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const list: Work[] = await r.json();
        setResults(list);
        setStatus(list.length ? "" : `No ${TYPE_WORD[type].toLowerCase()}s match “${q}”. Try the title or the creator's name.`);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setStatus("Search isn't responding. Try again in a moment.");
      }
    }, 300);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q, type]);

  function choose(w: Work) {
    if (mode === "browse") router.push("/" + slugify(w.title, w.creator));
    else setConfirming(w);
  }

  function confirm() {
    if (!confirming) return;
    start(async () => {
      const err = await pickToday(confirming);
      if (err) setStatus(err);
      setConfirming(null);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="chips" role="group" aria-label="Type">
        {(["film", "book", "song"] as WorkType[]).map((t) => (
          <button key={t} className="chip" aria-pressed={type === t} onClick={() => setType(t)}>{TYPE_WORD[t]}s</button>
        ))}
      </div>
      <label htmlFor="q" className="meta block">Search {TYPE_WORD[type].toLowerCase()}s by title or creator</label>
      <input id="q" className="field" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" placeholder="Title or creator" />
      {status && <p className="meta" role="status">{status}</p>}
      <ul className="results">
        {results.map((w) => (
          <li key={w.key}>
            <button onClick={() => choose(w)}>
              <span className="ttl">{w.title}</span>
              <span className="meta">{w.creator}{w.year ? `, ${w.year}` : ""}</span>
            </button>
          </li>
        ))}
      </ul>
      {confirming && (
        <div className="scrim" onClick={(e) => e.target === e.currentTarget && setConfirming(null)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-label="Confirm pick">
            <p className="big">{confirming.title}</p>
            <p className="meta">{TYPE_WORD[confirming.type]} by {confirming.creator}{confirming.year ? `, ${confirming.year}` : ""}</p>
            <button className="btn solid wide" onClick={confirm} disabled={pending} autoFocus>{pending ? "Sharing…" : "Pick for today"}</button>
            <button className="link" onClick={() => setConfirming(null)}>Keep looking</button>
          </div>
        </div>
      )}
    </div>
  );
}
