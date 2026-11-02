import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap empty">
      <h1>Page not found</h1>
      <p>The page you were looking for has moved or no longer exists.</p>
      <Link className="btn" href="/">Go to the home page</Link>
    </div>
  );
}
