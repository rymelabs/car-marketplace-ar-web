import { SiteHeader } from "@/components/site-header";

const shimmer = "animate-pulse rounded-xl bg-slate-200/80";

export default function CarDetailLoading() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[linear-gradient(170deg,_#fff7ed_0%,_#f8fafc_45%,_#ecfeff_100%)] pb-16">
        <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className={`h-4 w-36 ${shimmer}`} />

          <div className="mt-4 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className={`aspect-[16/10] ${shimmer}`} />
              <div className="space-y-4 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-2">
                    <div className={`h-3 w-20 ${shimmer}`} />
                    <div className={`h-8 w-56 ${shimmer}`} />
                  </div>
                  <div className={`h-7 w-24 rounded-full ${shimmer}`} />
                </div>

                <div className={`h-4 w-full ${shimmer}`} />
                <div className={`h-4 w-11/12 ${shimmer}`} />

                <div className="grid gap-x-6 gap-y-3 md:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <div className={`h-3 w-20 ${shimmer}`} />
                      <div className={`h-4 w-28 ${shimmer}`} />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className={`h-5 w-32 ${shimmer}`} />
                <div className={`mt-4 aspect-video ${shimmer}`} />
                <div className={`mt-4 h-10 w-40 rounded-full ${shimmer}`} />
              </section>
              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className={`h-5 w-36 ${shimmer}`} />
                <div className={`mt-4 h-10 w-full ${shimmer}`} />
                <div className={`mt-3 h-10 w-full ${shimmer}`} />
                <div className={`mt-3 h-24 w-full ${shimmer}`} />
                <div className={`mt-4 h-10 w-32 rounded-full ${shimmer}`} />
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
