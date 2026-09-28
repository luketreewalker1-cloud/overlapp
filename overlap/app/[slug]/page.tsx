import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { utcToday } from "@/lib/day";
import { TYPE_WORD, type WorkType } from "@/lib/slug";
import People, { type Row } from "@/components/People";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("picks")
    .select("day, title, creator, type, year, profiles!inner(handle)")
    .eq("slug", slug)
    .order("day", { ascending: false })
    .limit(1000);
  return data ?? [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const rows = await load((await params).slug);
  return rows[0] ? { title: `${rows[0].title} by ${rows[0].creator}` } : { title: "No one yet" };
}

export default async function Room({ params }: Props) {
  const rows = await load((await params).slug);
  if (!rows.length) {
    return (
      <>
        <h1>No one has shared this yet.</h1>
        <p className="lede">Pick it today and you'll be the first in the room.</p>
      </>
    );
  }
  const today = utcToday();
  const w = rows[0];
  const handleOf = (r: (typeof rows)[number]) => (Array.isArray(r.profiles) ? r.profiles[0]?.handle : (r.profiles as { handle: string }).handle);
  const todays: Row[] = rows.filter((r) => r.day === today).map((r) => ({ day: r.day, handle: handleOf(r) }));
  const seen = new Set(todays.map((r) => r.handle));
  const earlier: Row[] = [];
  for (const r of rows) {
    const h = handleOf(r);
    if (r.day !== today && !seen.has(h)) { seen.add(h); earlier.push({ day: r.day, handle: h }); }
  }
  return (
    <>
      <p className="meta">{TYPE_WORD[w.type as WorkType]} by {w.creator}{w.year ? `, ${w.year}` : ""}</p>
      <h1>{w.title}</h1>
      <p className="sentence">
        {todays.length === 0 ? "No one has shared it today." : todays.length === 1 ? "One person shared it today." : `${todays.length} people shared it today.`}
      </p>
      {todays.length > 0 && (<><h2>Shared it today</h2><People rows={todays} today /></>)}
      {earlier.length > 0 && (<><h2>Shared it before</h2><People rows={earlier} today={false} /></>)}
    </>
  );
}
