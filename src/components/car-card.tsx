import Link from "next/link";
import type { CarListingWithModel } from "@/types/marketplace";
import { formatCurrencyUSD, formatMiles } from "@/lib/data/repository";

interface CarCardProps {
  car: CarListingWithModel;
}

export function CarCard({ car }: CarCardProps) {
  const hero = car.mediaRefs[0];

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_-20px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-25px_rgba(15,23,42,0.45)]">
      <div className="aspect-[16/10] bg-slate-100">
        {hero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hero.url}
            alt={hero.alt}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No image available
          </div>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {car.year} {car.make}
            </p>
            <h3 className="font-heading text-xl font-semibold leading-tight text-slate-900">
              {car.model} {car.trim}
            </h3>
          </div>
          {car.arEligible ? (
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              AR Ready
            </span>
          ) : (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
              AR Pending
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-slate-700">
          <p>
            <span className="text-slate-500">Price:</span> {formatCurrencyUSD(car.priceUSD)}
          </p>
          <p>
            <span className="text-slate-500">Mileage:</span> {formatMiles(car.mileageMiles)}
          </p>
          <p>
            <span className="text-slate-500">Drive:</span> {car.specs.drivetrain}
          </p>
          <p>
            <span className="text-slate-500">Fuel:</span> {car.specs.fuelType}
          </p>
        </div>

        <Link
          href={`/cars/${car.id}`}
          className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold !text-white visited:!text-white hover:bg-amber-500 hover:!text-white focus-visible:!text-white active:!text-white"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
