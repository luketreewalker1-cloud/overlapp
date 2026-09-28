import { NextResponse } from "next/server";
import type { Work, WorkType } from "@/lib/slug";

// Searches the three free catalogues. Films need a TMDB token; books and songs need no key.
const UA = { "User-Agent": "Overlap/0.1 (one pick a day)" };

async function films(q: string): Promise<Work[]> {
  const token = process.env.TMDB_TOKEN;
  if (!token) return [];
  const auth = { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 86400 } };
  const r = await fetch(`https://api.themoviedb.org/3/search/movie?include_adult=false&query=${encodeURIComponent(q)}`, auth);
  if (!r.ok) return [];
  const { results = [] } = await r.json();
  const top = results.slice(0, 6);
  return Promise.all(
    top.map(async (m: { id: number; title: string; release_date?: string }) => {
      let creator = "Unknown director";
      const c = await fetch(`https://api.themoviedb.org/3/movie/${m.id}/credits`, auth);
      if (c.ok) {
        const { crew = [] } = await c.json();
        const directors = crew.filter((p: { job: string }) => p.job === "Director").map((p: { name: string }) => p.name);
        if (directors.length) creator = directors.slice(0, 2).join(" & ");
      }
      return { type: "film", key: `tmdb:${m.id}`, title: m.title, creator, year: m.release_date ? Number(m.release_date.slice(0, 4)) : null };
    })
  );
}

async function books(q: string): Promise<Work[]> {
  const r = await fetch(
    `https://openlibrary.org/search.json?limit=8&fields=key,title,author_name,first_publish_year&q=${encodeURIComponent(q)}`,
    { headers: UA, next: { revalidate: 86400 } }
  );
  if (!r.ok) return [];
  const { docs = [] } = await r.json();
  return docs
    .filter((d: { author_name?: string[] }) => d.author_name?.length)
    .map((d: { key: string; title: string; author_name: string[]; first_publish_year?: number }) => ({
      type: "book", key: `ol:${d.key}`, title: d.title, creator: d.author_name[0], year: d.first_publish_year ?? null,
    }));
}

async function songs(q: string): Promise<Work[]> {
  const r = await fetch(`https://itunes.apple.com/search?entity=song&limit=10&term=${encodeURIComponent(q)}`, { next: { revalidate: 86400 } });
  if (!r.ok) return [];
  const { results = [] } = await r.json();
  const seen = new Set<string>();
  return results
    .map((s: { trackId: number; trackName: string; artistName: string; releaseDate?: string }) => ({
      type: "song", key: `itunes:${s.trackId}`, title: s.trackName, creator: s.artistName,
      year: s.releaseDate ? Number(s.releaseDate.slice(0, 4)) : null,
    }))
    .filter((w: Work) => { const k = (w.title + w.creator).toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
}

const SOURCES: Record<WorkType, (q: string) => Promise<Work[]>> = { film: films, book: books, song: songs };

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().slice(0, 100);
  const type = url.searchParams.get("type") as WorkType;
  if (q.length < 2 || !SOURCES[type]) return NextResponse.json([]);
  try {
    return NextResponse.json(await SOURCES[type](q));
  } catch {
    return NextResponse.json([], { status: 502 });
  }
}
