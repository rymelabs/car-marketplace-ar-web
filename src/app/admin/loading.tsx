import { SiteHeader } from "@/components/site-header";

const shimmer = "animate-pulse rounded-xl bg-slate-200/80";

export default function AdminLoading() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed,_#f8fafc_38%,_#eef2ff_100%)]">
        <section className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
          <div className={`h-4 w-40 ${shimmer}`} />
          <div className={`mt-3 h-10 w-64 ${shimmer}`} />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className={`h-28 ${shimmer}`} />
            <div className={`h-28 ${shimmer}`} />
            <div className={`h-28 ${shimmer}`} />
          </div>

          <div className="mt-6 space-y-4">
            <div className={`h-14 ${shimmer}`} />
            <div className={`h-14 ${shimmer}`} />
            <div className={`h-14 ${shimmer}`} />
          </div>
        </section>
      </main>
    </>
  );
}
