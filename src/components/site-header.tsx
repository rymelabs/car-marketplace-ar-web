import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group inline-flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-slate-950">
            AR
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight text-slate-900">
            Car Marketplace
            <span className="ml-2 rounded-md bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-slate-100 group-hover:bg-amber-500 group-hover:text-slate-950">
              TRUE SCALE
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-4 text-sm text-slate-700">
          <Link href="/" className="hover:text-slate-950">
            Listings
          </Link>
          <Link href="/admin" className="hover:text-slate-950">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
