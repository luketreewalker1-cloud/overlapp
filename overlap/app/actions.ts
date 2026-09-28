"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify, SITE_URL, type Work } from "@/lib/slug";

export async function signIn(_: string | null, form: FormData): Promise<string> {
  const email = String(form.get("email") || "").trim();
  if (!email.includes("@")) return "Enter a valid email address.";
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${SITE_URL}/auth/callback` } });
  return error ? error.message : "Check your email for a sign-in link.";
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}

export async function claimHandle(_: string | null, form: FormData): Promise<string | null> {
  const handle = String(form.get("handle") || "").toLowerCase().trim();
  if (!/^[a-z0-9_]{2,24}$/.test(handle)) return "Use 2 to 24 lowercase letters, numbers or underscores.";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "Sign in first.";
  const { error } = await supabase.from("profiles").insert({ id: user.id, handle });
  if (error) return error.code === "23505" ? "That name is taken. Try another." : error.message;
  revalidatePath("/", "layout");
  return null;
}

export async function pickToday(work: Work): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "Sign in first.";
  const title = String(work.title).slice(0, 300), creator = String(work.creator).slice(0, 200);
  const { error } = await supabase.from("picks").upsert(
    { user_id: user.id, type: work.type, work_key: String(work.key).slice(0, 100), slug: slugify(title, creator), title, creator, year: work.year },
    { onConflict: "user_id,day" }
  );
  if (error) return error.message;
  revalidatePath("/", "layout");
  return null;
}

export async function clearToday() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("picks").delete().eq("user_id", user.id).eq("day", new Date().toISOString().slice(0, 10));
  revalidatePath("/", "layout");
}
