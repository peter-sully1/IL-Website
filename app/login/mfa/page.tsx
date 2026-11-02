import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../actions";
import { MfaForm } from "./MfaForm";

export default async function MfaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="auth-card">
      <h1>Enter your code</h1>
      <p>Open your authenticator app and enter the code shown for Bait al-Elmi.</p>
      <MfaForm />
      <form action={signOut} style={{ marginTop: "2rem" }}>
        <button className="link-button" type="submit">Use a different account</button>
      </form>
    </div>
  );
}
