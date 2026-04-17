import { SiteHeader } from "@/components/site-header";

const shimmer = "animate-pulse rounded-xl bg-slate-200/80";

function ListingCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_-20px_rgba(15,23,42,0.35)]">
      <div className={`aspect-[16/10] ${shimmer}`} />
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className={`h-3 w-24 ${shimmer}`} />
            <div className={`h-6 w-44 ${shimmer}`} />
          </div>
          <div className={`h-6 w-16 rounded-full ${shimmer}`} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className={`h-4 ${shimmer}`} />
          <div className={`h-4 ${shimmer}`} />
          <div className={`h-4 ${shimmer}`} />
          <div className={`h-4 ${shimmer}`} />
        </div>
        <div className={`h-9 w-28 rounded-full ${shimmer}`} />
      </div>
    </article>
  );
}

export default function ListingsLoading() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[linear-gradient(140deg,_#fff7ed_0%,_#f8fafc_44%,_#ecfeff_100%)] pb-14">
        <section className="mx-auto w-full max-w-6xl px-4 pb-6 pt-10 sm:px-6 lg:px-8">
          <div className={`h-3 w-40 ${shimmer}`} />
          <div className={`mt-3 h-11 w-full max-w-2xl ${shimmer}`} />
          <div className={`mt-4 h-5 w-full max-w-3xl ${shimmer}`} />
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className={`h-10 w-28 rounded-full ${shimmer}`} />
        </section>

        <section className="mx-auto mt-6 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <ListingCardSkeleton key={index} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
