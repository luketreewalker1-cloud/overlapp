import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dayLabel } from "@/lib/day";
import { SITE_NAME, TYPE_WORD, type WorkType } from "@/lib/slug";
import { sharedPick } from "./data";

export const dynamic = "force-dynamic";
const when = (l: string) => (l === "Today" || l === "Yesterday" ? l.toLowerCase() : `on ${l}`);
type Props = { params: Promise<{ slug: string; handle: string }> };

// This is the page behind every link people post.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, handle } = await params;
  const p = await sharedPick(slug, handle);
  if (!p) return { title: "Not found" };
  const title = `@${p.handle} picked ${p.title} by ${p.creator}`;
  const description = `See who else picked it on ${SITE_NAME}.`;
  return { title, description, openGraph: { title, description, siteName: SITE_NAME, type: "website" }, twitter: { card: "summary_large_image", title, description } };
}

export default async function Shared({ params }: Props) {
  const { slug, handle } = await params;
  const p = await sharedPick(slug, handle);
  if (!p) notFound();
  return (
    <>
      <p className="meta"><Link href={`/u/${p.handle}`}>@{p.handle}</Link> picked this {when(dayLabel(p.day))}</p>
      <h1>{p.title}</h1>
      <p className="lede">{TYPE_WORD[p.type as WorkType]} by {p.creator}{p.year ? `, ${p.year}` : ""}</p>
      <p><Link className="btn solid" href={`/${slug}`}>See who else picked it</Link></p>
      <p><Link className="link" href="/">Pick your own today</Link></p>
    </>
  );
}
