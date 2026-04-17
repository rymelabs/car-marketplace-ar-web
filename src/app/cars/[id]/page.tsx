import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArModelViewer } from "@/components/ar-model-viewer";
import { InquiryForm } from "@/components/inquiry-form";
import { SiteHeader } from "@/components/site-header";
import { formatCurrencyUSD, formatMiles, getCarById } from "@/lib/data/repository";

interface CarDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CarDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const car = await getCarById(id);

  if (!car) {
    return {
      title: "Car Not Found | SpawnDrive",
    };
  }

  return {
    title: `${car.year} ${car.make} ${car.model} ${car.trim} | SpawnDrive`,
    description: car.description,
  };
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const { id } = await params;
  const car = await getCarById(id);

  if (!car) {
    notFound();
  }

  const hero = car.mediaRefs[0];

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[linear-gradient(170deg,_#fff7ed_0%,_#f8fafc_45%,_#ecfeff_100%)] pb-16">
        <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
            ← Back to listings
          </Link>

          <div className="mt-4 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="aspect-[16/10] bg-slate-100">
                {hero ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={hero.url} alt={hero.alt} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    No image available
                  </div>
                )}
              </div>

              <div className="space-y-4 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {car.year} {car.make}
                    </p>
                    <h1 className="font-heading text-3xl font-semibold text-slate-900">
                      {car.model} {car.trim}
                    </h1>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">
                    {formatCurrencyUSD(car.priceUSD)}
                  </span>
                </div>

                <p className="text-sm leading-6 text-slate-700">{car.description}</p>

                <dl className="grid gap-x-6 gap-y-3 text-sm md:grid-cols-2">
                  <div>
                    <dt className="text-slate-500">Mileage</dt>
                    <dd className="font-medium text-slate-900">{formatMiles(car.mileageMiles)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Condition</dt>
                    <dd className="font-medium text-slate-900">{car.condition}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Drivetrain</dt>
                    <dd className="font-medium text-slate-900">{car.specs.drivetrain}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Transmission</dt>
                    <dd className="font-medium text-slate-900">{car.specs.transmission}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Fuel Type</dt>
                    <dd className="font-medium text-slate-900">{car.specs.fuelType}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Horsepower</dt>
                    <dd className="font-medium text-slate-900">{car.specs.horsepower} hp</dd>
                  </div>
                </dl>
              </div>
            </section>

            <div className="space-y-6">
              <ArModelViewer model={car.modelAsset} />
              <InquiryForm carId={car.id} carTitle={`${car.year} ${car.make} ${car.model}`} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
