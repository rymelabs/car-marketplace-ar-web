import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex w-full max-w-6xl items-center px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group inline-flex items-center gap-2">
          <span className="font-heading text-2xl font-bold tracking-tight text-slate-900">
            SpawnDrive
          </span>
          <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-slate-100">
            AR
          </span>
        </Link>
      </div>
    </header>
  );
}
