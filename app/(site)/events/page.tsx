import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = { title: "Events" };

export default function EventsPage() {
  return (
    <>
      <PageIntro title="Events" arabic="فعاليات" />
      <div className="empty">
        <div className="wrap">
          <p>Upcoming gatherings and events will be listed here.</p>
          <Link className="btn" href="/about#classes">Browse classes in the meantime</Link>
        </div>
      </div>
    </>
  );
}
