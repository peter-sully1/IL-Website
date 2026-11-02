"use client";

import { useActionState } from "react";
import { signIn, type FormState } from "./actions";

export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    signIn,
    initialError ? { error: initialError } : undefined,
  );

  return (
    <form action={action} className="form">
      {state?.error && (
        <p className="notice error" role="alert">{state.error}</p>
      )}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <button className="btn primary" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
