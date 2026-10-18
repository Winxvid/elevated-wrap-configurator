import type { Car, Film } from "@/lib/catalog";

export type Coverage = "full" | "accent";
export type Paint = "clean" | "chips" | "prep";

const bands: Record<Car["size"], [number, number]> = {
  sports: [3200, 5000],
  sedan: [3000, 4500],
  suv: [3800, 5500],
  truck: [4200, 6500],
};

const paintMul: Record<Paint, number> = {
  clean: 1,
  chips: 1.08,
  prep: 1.15,
};

function round50(n: number): number {
  return Math.round(n / 50) * 50;
}

export function estimate(
  car: Car,
  film: Film,
  coverage: Coverage,
  paint: Paint,
): { low: number; high: number } | null {
  if (film.tier <= 0) return null;
  const [lo, hi] = bands[car.size];
  const cov = coverage === "accent" ? 0.42 : 1;
  const mul = film.tier * cov * paintMul[paint];
  return {
    low: round50(lo * mul),
    high: round50(hi * mul),
  };
}

export function money(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
