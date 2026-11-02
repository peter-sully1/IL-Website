"use client";

import { useActionState, useState } from "react";
import { confirmEnrollment, startEnrollment, type ConfirmState, type EnrollStart } from "./actions";

export function Enroll() {
  const [setup, setSetup] = useState<EnrollStart | null>(null);
  const [starting, setStarting] = useState(false);
  const [state, action, pending] = useActionState<ConfirmState, FormData>(confirmEnrollment, undefined);

  if (state?.ok) {
    return (
      <p className="notice success" role="status">
        Your authenticator app is set up. You’ll be asked for a code each time you sign in.
      </p>
    );
  }

  if (!setup || !setup.ok) {
    return (
      <>
        {setup && !setup.ok && <p className="notice error" role="alert">{setup.error}</p>}
        <button
          className="btn primary"
          type="button"
          disabled={starting}
          onClick={async () => {
            setStarting(true);
            setSetup(await startEnrollment());
            setStarting(false);
          }}
        >
          {starting ? "Preparing…" : "Set up an authenticator app"}
        </button>
      </>
    );
  }

  return (
    <div className="form">
      <ol>
        <li>Open an authenticator app such as Google Authenticator or Microsoft Authenticator.</li>
        <li>Add an account and scan this QR code.</li>
        <li>Enter the 6-digit code the app shows.</li>
      </ol>
      <div className="qr">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={setup.qr} alt="QR code for your authenticator app" width={200} height={200} />
      </div>
      <p className="hint">
        Can’t scan it? Enter this key in the app instead: <span className="secret">{setup.secret}</span>
      </p>
      <form action={action} className="form">
        {state?.error && <p className="notice error" role="alert">{state.error}</p>}
        <input type="hidden" name="factorId" value={setup.factorId} />
        <div className="field">
          <label htmlFor="code">6-digit code</label>
          <input id="code" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={7} required />
        </div>
        <div className="actions">
          <button className="btn primary" type="submit" disabled={pending}>
            {pending ? "Checking…" : "Turn on"}
          </button>
        </div>
      </form>
    </div>
  );
}
