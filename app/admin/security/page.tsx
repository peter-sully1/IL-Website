import { requireAdmin } from "@/lib/auth";
import { removeFactor } from "./actions";
import { Enroll } from "./Enroll";

export default async function SecurityPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.auth.mfa.listFactors();
  const verified = data?.totp.filter((f) => f.status === "verified") ?? [];

  return (
    <div style={{ maxWidth: "36rem" }}>
      <h1>Sign-in security</h1>
      <p>
        With an authenticator app, signing in needs your password and a code from your phone.
        Someone who learns your password still can’t get in.
      </p>

      {verified.length > 0 ? (
        <>
          <p className="notice success">An authenticator app is turned on for this account.</p>
          {verified.map((f) => (
            <form key={f.id} action={removeFactor} className="actions">
              <input type="hidden" name="factorId" value={f.id} />
              <span>{f.friendly_name ?? "Authenticator app"}</span>
              <span className="spacer" />
              <button className="btn danger" type="submit">Turn off</button>
            </form>
          ))}
        </>
      ) : (
        <Enroll />
      )}
    </div>
  );
}
