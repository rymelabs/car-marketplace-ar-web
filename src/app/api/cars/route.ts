import { listCars } from "@/lib/data/repository";
import { errorResponse, jsonResponse } from "@/lib/http";
import type { CarsQuery } from "@/types/marketplace";

function toNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const query: CarsQuery = {
      q: searchParams.get("q") ?? undefined,
      make: searchParams.get("make") ?? undefined,
      minPrice: toNumber(searchParams.get("minPrice")),
      maxPrice: toNumber(searchParams.get("maxPrice")),
      sort:
        (searchParams.get("sort") as CarsQuery["sort"] | null) ?? "year-desc",
    };

    const cars = await listCars(query);

    return jsonResponse({
      cars,
      count: cars.length,
      query,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
