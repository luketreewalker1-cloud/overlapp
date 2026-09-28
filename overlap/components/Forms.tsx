"use client";

import { useActionState } from "react";
import { claimHandle, signIn } from "@/app/actions";

export function SignInForm() {
  const [msg, action, pending] = useActionState(signIn, null);
  return (
    <form action={action} className="stack">
      <label htmlFor="email" className="meta block">Email</label>
      <input id="email" name="email" type="email" className="field" required autoComplete="email" />
      <button className="btn solid wide" disabled={pending}>{pending ? "Sending…" : "Email me a sign-in link"}</button>
      {msg && <p className="meta" role="status">{msg}</p>}
    </form>
  );
}

export function HandleForm() {
  const [msg, action, pending] = useActionState(claimHandle, null);
  return (
    <form action={action} className="stack">
      <label htmlFor="handle" className="meta block">Your name, as it will appear at the end of your links</label>
      <input id="handle" name="handle" className="field" required pattern="[a-z0-9_]{2,24}" maxLength={24} autoCapitalize="none" spellCheck={false} />
      <button className="btn solid wide" disabled={pending}>{pending ? "Saving…" : "Claim this name"}</button>
      {msg && <p className="meta" role="status">{msg}</p>}
    </form>
  );
}
