import { createClient } from "@/lib/supabase/server";

// The person's most recent pick of this work.
export async function sharedPick(slug: string, handle: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("id, handle").eq("handle", handle).maybeSingle();
  if (!profile) return null;
  const { data: pick } = await supabase
    .from("picks").select("day, title, creator, type, year")
    .eq("user_id", profile.id).eq("slug", slug)
    .order("day", { ascending: false }).limit(1).maybeSingle();
  return pick ? { ...pick, handle: profile.handle as string } : null;
}
