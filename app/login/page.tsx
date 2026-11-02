import Link from "next/link";
import { LoginForm } from "./LoginForm";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const initialError =
    error === "not-authorised" ? "This account can’t manage the website." : undefined;

  return (
    <div className="auth-card">
      <h1>Sign in to manage articles</h1>
      <LoginForm initialError={initialError} />
      <p style={{ marginTop: "2rem" }}>
        <Link href="/">Back to the website</Link>
      </p>
    </div>
  );
}
