import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { dayLabel } from "@/lib/day";
import { signOut } from "@/app/actions";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `@${(await params).handle}` };
}

export default async function Profile({ params }: Props) {
  const { handle } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("id, handle").eq("handle", handle).maybeSingle();
  if (!profile) notFound();
  const [{ data: picks }, { data: { user } }] = await Promise.all([
    supabase.from("picks").select("day, slug, title, creator").eq("user_id", profile.id).order("day", { ascending: false }).limit(365),
    supabase.auth.getUser(),
  ]);
  const mine = user?.id === profile.id;
  return (
    <>
      <h1>@{profile.handle}</h1>
      {!picks?.length && <p className="lede">{mine ? "Your picks will be listed here, one per day." : "No picks yet."}</p>}
      <ul className="titles">
        {(picks ?? []).map((p) => (
          <li key={p.day}>
            <Link href={`/${p.slug}`}>
              <span className="day">{dayLabel(p.day)}</span>
              <span><span className="ttl">{p.title}</span> <span className="meta">{p.creator}</span></span>
            </Link>
          </li>
        ))}
      </ul>
      {mine && <form action={signOut}><button className="link">Sign out</button></form>}
    </>
  );
}
