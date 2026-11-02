"use client";

import { useActionState } from "react";
import { verifyMfa, type FormState } from "../actions";

export function MfaForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(verifyMfa, undefined);

  return (
    <form action={action} className="form">
      {state?.error && <p className="notice error" role="alert">{state.error}</p>}
      <div className="field">
        <label htmlFor="code">6-digit code</label>
        <input
          id="code"
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]{6,7}"
          maxLength={7}
          required
          autoFocus
        />
      </div>
      <button className="btn primary" type="submit" disabled={pending}>
        {pending ? "Checking…" : "Continue"}
      </button>
    </form>
  );
}
