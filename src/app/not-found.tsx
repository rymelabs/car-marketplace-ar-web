import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          404
        </p>
        <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900">
          Listing not found
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          The car listing you requested does not exist or is not currently published.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
        >
          Back to marketplace
        </Link>
      </div>
    </main>
  );
}
