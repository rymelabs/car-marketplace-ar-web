import type { Metadata } from "next";
import Link from "next/link";
import { CarCard } from "@/components/car-card";
import { SiteHeader } from "@/components/site-header";
import { listCars, listMakesFromCars } from "@/lib/data/repository";
import type { CarsQuery } from "@/types/marketplace";

export const metadata: Metadata = {
  title: "Car Marketplace AR",
  description:
    "Find your next car and preview it in your real space with true-scale augmented reality.",
};

function toStringValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function toNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const query: CarsQuery = {
    q: toStringValue(params.q),
    make: toStringValue(params.make),
    minPrice: toNumber(toStringValue(params.minPrice)),
    maxPrice: toNumber(toStringValue(params.maxPrice)),
    sort:
      (toStringValue(params.sort) as CarsQuery["sort"] | undefined) ?? "year-desc",
  };

  const cars = await listCars(query);
  const allCars = await listCars({}, { includeDraft: true });
  const makes = listMakesFromCars(allCars);

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[linear-gradient(140deg,_#fff7ed_0%,_#f8fafc_44%,_#ecfeff_100%)] pb-14">
        <section className="mx-auto w-full max-w-6xl px-4 pb-6 pt-10 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Web-First Car Marketplace
          </p>
          <h1 className="mt-2 max-w-3xl font-heading text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
            Shop Cars With True-Scale AR Before You Commit
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-700">
            Compare curated listings, inspect specs, and place the car in your real-world space from the detail page.
            This product uses lead-generation inquiries instead of direct in-app checkout.
          </p>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-5">
            <label className="grid gap-1 text-sm text-slate-700 md:col-span-2">
              Search
              <input
                name="q"
                defaultValue={query.q}
                placeholder="Make, model, trim, keyword"
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>

            <label className="grid gap-1 text-sm text-slate-700">
              Make
              <select
                name="make"
                defaultValue={query.make ?? ""}
                className="rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">All makes</option>
                {makes.map((make) => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-sm text-slate-700">
              Min price
              <input
                name="minPrice"
                type="number"
                defaultValue={query.minPrice}
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>

            <label className="grid gap-1 text-sm text-slate-700">
              Max price
              <input
                name="maxPrice"
                type="number"
                defaultValue={query.maxPrice}
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>

            <label className="grid gap-1 text-sm text-slate-700 md:col-span-2">
              Sort by
              <select
                name="sort"
                defaultValue={query.sort ?? "year-desc"}
                className="rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="year-desc">Newest year first</option>
                <option value="price-asc">Price low to high</option>
                <option value="price-desc">Price high to low</option>
                <option value="mileage-asc">Lowest mileage first</option>
              </select>
            </label>

            <div className="flex items-end gap-2 md:col-span-3">
              <button
                type="submit"
                className="inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-500 hover:text-slate-950"
              >
                Apply filters
              </button>
              <Link
                href="/"
                className="inline-flex rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-900 hover:text-slate-900"
              >
                Reset
              </Link>
            </div>
          </form>
        </section>

        <section className="mx-auto mt-6 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          {cars.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              No cars matched your filters.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
