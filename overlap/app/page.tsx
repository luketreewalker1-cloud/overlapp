import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { utcToday } from "@/lib/day";
import { SITE_URL, TYPE_WORD, type WorkType } from "@/lib/slug";
import { clearToday } from "@/app/actions";
import { HandleForm, SignInForm } from "@/components/Forms";
import Picker from "@/components/Picker";
import ShareBox from "@/components/ShareBox";
import Countdown from "@/components/Countdown";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <>
        <h1>One film, book or song a day.</h1>
        <p className="lede">Pick the thing you'd put your name to today, share it, and see everyone else who picked the same. The more niche your pick, the smaller the room.</p>
        <SignInForm />
      </>
    );
  }

  const { data: profile } = await supabase.from("profiles").select("handle").eq("id", user.id).maybeSingle();
  if (!profile) {
    return (
      <>
        <h1>Choose your name</h1>
        <p className="lede">It goes at the end of every link you share, so people can find your profile.</p>
        <HandleForm />
      </>
    );
  }

  const today = utcToday();
  const { data: pick } = await supabase.from("picks").select("*").eq("user_id", user.id).eq("day", today).maybeSingle();

  if (!pick) {
    return (
      <>
        <h1>What's your one thing today?</h1>
        <Countdown />
        <Picker mode="pick" />
      </>
    );
  }

  const [{ count: todayCount }, { count: allCount }] = await Promise.all([
    supabase.from("picks").select("id", { count: "exact", head: true }).eq("slug", pick.slug).eq("day", today).neq("user_id", user.id),
    supabase.from("picks").select("id", { count: "exact", head: true }).eq("slug", pick.slug).lt("day", today),
  ]);
  const others = todayCount ?? 0, before = allCount ?? 0;

  return (
    <>
      <p className="meta">Your pick today</p>
      <h1>{pick.title}</h1>
      <p className="lede">{TYPE_WORD[pick.type as WorkType]} by {pick.creator}{pick.year ? `, ${pick.year}` : ""}</p>
      <p className="sentence">
        {others === 0 ? "No one else has shared it yet today." : others === 1 ? "One other person shared it today." : `${others} other people shared it today.`}
        {before > 0 && ` It's been shared ${before === 1 ? "once" : `${before} times`} before.`}
      </p>
      <p><Link className="btn" href={`/${pick.slug}`}>See who shared it</Link></p>
      <ShareBox site={SITE_URL} slug={pick.slug} handle={profile.handle} title={pick.title} creator={pick.creator} />
      <Countdown />
      <form action={clearToday}><button className="link">Change today's pick</button></form>
    </>
  );
}
