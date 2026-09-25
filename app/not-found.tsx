import Link from "next/link";
export default function NotFound() {
  return (
    <div className="state">
      <h1>Page not found</h1>
      <p>This page may have moved or is no longer available.</p>
      <Link className="button" href="/">
        Back to overview
      </Link>
    </div>
  );
}
