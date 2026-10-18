import { catalogCars } from "@/lib/cars.generated";
import { catalogFilms } from "@/lib/films.generated";

export type CarSize = "sports" | "sedan" | "suv" | "truck";

export type Car = {
  id: string;
  brand: string;
  model: string;
  year: number;
  body: string;
  size: CarSize;
};

export type Film = {
  id: string;
  name: string;
  brand: string;
  line: string;
  code: string;
  family: string;
  hue: string;
  swatch: string;
  swatch2?: string;
  /** Multiplier on the installed color-change band. 0 means factory paint. */
  tier: number;
  blurb: string;
};

export type WheelOption = { id: string; name: string; short: string; spokes: number; tone: string; add: number };

export const cars: Car[] = catalogCars;

export const films: Film[] = [
  {
    id: "factory",
    name: "Factory paint",
    brand: "Factory",
    line: "OEM",
    code: "PAINT",
    family: "Paint",
    hue: "Neutral",
    swatch: "#d7d8dc",
    tier: 0,
    blurb: "Unwrapped. The color it left the factory with.",
  },
  ...catalogFilms,
];

export const wheels: WheelOption[] = [
  { id: "studio", name: "Factory wheel", short: "Factory", spokes: 5, tone: "#d7d7d7", add: 0 },
  { id: "dark", name: "Dark mesh", short: "Mesh", spokes: 12, tone: "#b9b9b9", add: 900 },
  { id: "bronze", name: "Bronze mesh", short: "Bronze", spokes: 10, tone: "#c4a574", add: 1400 },
  { id: "forged", name: "Forged silver", short: "Forged", spokes: 10, tone: "#f2f2f2", add: 2200 },
];

export const filmBrands = ["All", "3M", "Avery Dennison", "KPMF", "ORACAL"] as const;

const legacyFilms: Record<string, string> = {
  gold: "gloss_metallic_gold_sw900_215_m",
  "satin-black": "satin_black_s12",
  rosso: "gloss_hotrod_red_g13",
  chrome: "chrome_silver_sf100_843_s",
  flip: "color_flips_purple_blue_k75566",
};

const legacyCars: Record<string, string> = {
  mustang: "ford-mustang-gt-2024",
  model3: "tesla-model-3-2024",
  f150: "ford-f-150-stx-2024",
  carrera: "porsche-911-carrera-2024",
};

export function resolveCarId(id: string): string {
  const key = legacyCars[id] ?? id;
  return cars.some((car) => car.id === key) ? key : "ford-mustang-gt-2024";
}

export function carById(id: string): Car {
  const key = resolveCarId(id);
  return cars.find((car) => car.id === key) ?? cars[0];
}

export function filmById(id: string): Film {
  const key = legacyFilms[id] ?? id;
  return films.find((film) => film.id === key) ?? films[0];
}

export function renderSrc(carId: string, filmId: string): string {
  return `/renders/${carId}-${filmId}.jpg`;
}
