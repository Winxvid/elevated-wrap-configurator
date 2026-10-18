import type { Film } from "@/lib/catalog";

type Plate = {
  width: number;
  height: number;
  base: Uint8ClampedArray;
  shade: Float32Array;
  alpha: Float32Array;
};

const plates = new Map<string, Promise<Plate>>();

const sources: Record<string, { base: string; mask: string }> = {
  "ford-mustang-gt-2024": { base: "/renders/mustang-base.webp", mask: "/renders/mustang-mask.png" },
  "tesla-model-3-2024": { base: "/renders/model3-factory.jpg", mask: "/renders/model3-mask.png?v=5" },
  "porsche-911-carrera-2024": { base: "/renders/carrera-factory.jpg", mask: "/renders/carrera-mask.png?v=5" },
  "ford-f-150-stx-2024": { base: "/renders/f150-factory.jpg", mask: "/renders/f150-mask.png?v=5" },
  "bmw-m4-coupe-2024": { base: "/renders/bmw-m4-coupe-2024-factory.jpg", mask: "/renders/bmw-m4-coupe-2024-mask.png?v=5" },
  "bmw-x5-2023": { base: "/renders/bmw-x5-2023-factory.jpg", mask: "/renders/bmw-x5-2023-mask.png?v=5" },
  "bmw-3-series-2023": { base: "/renders/bmw-3-series-2023-factory.jpg", mask: "/renders/bmw-3-series-2023-mask.png?v=1" },
  "chevrolet-corvette-zr1-2025": { base: "/renders/chevrolet-corvette-zr1-2025-factory.jpg", mask: "/renders/chevrolet-corvette-zr1-2025-mask.png?v=5" },
  "dodge-challenger-srt-2023": { base: "/renders/dodge-challenger-srt-2023-factory.jpg", mask: "/renders/dodge-challenger-srt-2023-mask.png?v=5" },
  "honda-civic-type-r-2023": { base: "/renders/honda-civic-type-r-2023-factory.jpg", mask: "/renders/honda-civic-type-r-2023-mask.png?v=5" },
  "jeep-wrangler-willys-2024": { base: "/renders/jeep-wrangler-willys-2024-factory.jpg", mask: "/renders/jeep-wrangler-willys-2024-mask.png?v=5" },
  "lamborghini-huracan-evo-2024": { base: "/renders/lamborghini-huracan-evo-2024-factory.jpg", mask: "/renders/lamborghini-huracan-evo-2024-mask.png?v=5" },
  "land-rover-range-rover-2024": { base: "/renders/land-rover-range-rover-2024-factory.jpg", mask: "/renders/land-rover-range-rover-2024-mask.png?v=5" },
  "tesla-model-y-juniper-2025": { base: "/renders/tesla-model-y-juniper-2025-factory.jpg", mask: "/renders/tesla-model-y-juniper-2025-mask.png?v=5" },
  "porsche-cayenne-turbo-gt-2024": { base: "/renders/porsche-cayenne-turbo-gt-2024-factory.jpg", mask: "/renders/porsche-cayenne-turbo-gt-2024-mask.png?v=7" },
  "porsche-718-cayman-gt4-rs-2022": { base: "/renders/porsche-718-cayman-gt4-rs-2022-factory.jpg", mask: "/renders/porsche-718-cayman-gt4-rs-2022-mask.png?v=7" },
  "porsche-718-spyder-rs-2023": { base: "/renders/porsche-718-spyder-rs-2023-factory.jpg", mask: "/renders/porsche-718-spyder-rs-2023-mask.png?v=7" },
  "porsche-911-carrera-turbo-s-2023": { base: "/renders/porsche-911-carrera-turbo-s-2023-factory.jpg", mask: "/renders/porsche-911-carrera-turbo-s-2023-mask.png?v=7" },
  "porsche-911-dakar-2023": { base: "/renders/porsche-911-dakar-2023-factory.jpg", mask: "/renders/porsche-911-dakar-2023-mask.png?v=7" },
  "porsche-911-gt3-2024": { base: "/renders/porsche-911-gt3-2024-factory.jpg", mask: "/renders/porsche-911-gt3-2024-mask.png?v=7" },
  "porsche-911-gt3-rs-2024": { base: "/renders/porsche-911-gt3-rs-2024-factory.jpg", mask: "/renders/porsche-911-gt3-rs-2024-mask.png?v=7" },
  "porsche-911-gt3-touring-2024": { base: "/renders/porsche-911-gt3-touring-2024-factory.jpg", mask: "/renders/porsche-911-gt3-touring-2024-mask.png?v=7" },
  "porsche-911-s-t-2024": { base: "/renders/porsche-911-s-t-2024-factory.jpg", mask: "/renders/porsche-911-s-t-2024-mask.png?v=7" },
  "porsche-911-sport-classic-2024": { base: "/renders/porsche-911-sport-classic-2024-factory.jpg", mask: "/renders/porsche-911-sport-classic-2024-mask.png?v=7" },
  "porsche-911-techart-gtstreet-r-2022": { base: "/renders/porsche-911-techart-gtstreet-r-2022-factory.jpg", mask: "/renders/porsche-911-techart-gtstreet-r-2022-mask.png?v=7" },
  "porsche-911-techart-gtstreet-r-touring-2022": { base: "/renders/porsche-911-techart-gtstreet-r-touring-2022-factory.jpg", mask: "/renders/porsche-911-techart-gtstreet-r-touring-2022-mask.png?v=7" },
  "porsche-boxster-2023": { base: "/renders/porsche-boxster-2023-factory.jpg", mask: "/renders/porsche-boxster-2023-mask.png?v=7" },
  "porsche-cayenne-coupe-turbo-2019": { base: "/renders/porsche-cayenne-coupe-turbo-2019-factory.jpg", mask: "/renders/porsche-cayenne-coupe-turbo-2019-mask.png?v=7" },
  "porsche-cayenne-e-hybrid-coupe-2024": { base: "/renders/porsche-cayenne-e-hybrid-coupe-2024-factory.jpg", mask: "/renders/porsche-cayenne-e-hybrid-coupe-2024-mask.png?v=7" },
  "porsche-macan-electric-2024": { base: "/renders/porsche-macan-electric-2024-factory.jpg", mask: "/renders/porsche-macan-electric-2024-mask.png?v=7" },
  "porsche-macan-turbo-2023": { base: "/renders/porsche-macan-turbo-2023-factory.jpg", mask: "/renders/porsche-macan-turbo-2023-mask.png?v=7" },
  "porsche-macan-turbo-electric-2024": { base: "/renders/porsche-macan-turbo-electric-2024-factory.jpg", mask: "/renders/porsche-macan-turbo-electric-2024-mask.png?v=7" },
  "porsche-panamera-2024": { base: "/renders/porsche-panamera-2024-factory.jpg", mask: "/renders/porsche-panamera-2024-mask.png?v=7" },
  "porsche-panamera-gts-2024": { base: "/renders/porsche-panamera-gts-2024-factory.jpg", mask: "/renders/porsche-panamera-gts-2024-mask.png?v=7" },
  "porsche-panamera-turbo-2024": { base: "/renders/porsche-panamera-turbo-2024-factory.jpg", mask: "/renders/porsche-panamera-turbo-2024-mask.png?v=7" },
  "porsche-taycan-2020": { base: "/renders/porsche-taycan-2020-factory.jpg", mask: "/renders/porsche-taycan-2020-mask.png?v=7" },
  "porsche-taycan-2024": { base: "/renders/porsche-taycan-2024-factory.jpg", mask: "/renders/porsche-taycan-2024-mask.png?v=9" },
  "porsche-taycan-turbo-cross-turismo-2021": { base: "/renders/porsche-taycan-turbo-cross-turismo-2021-factory.jpg", mask: "/renders/porsche-taycan-turbo-cross-turismo-2021-mask.png?v=7" },
  "porsche-taycan-turbo-s-2024": { base: "/renders/porsche-taycan-turbo-s-2024-factory.jpg", mask: "/renders/porsche-taycan-turbo-s-2024-mask.png?v=7" },
  "porsche-taycan-turbo-s-cross-turismo-2021": { base: "/renders/porsche-taycan-turbo-s-cross-turismo-2021-factory.jpg", mask: "/renders/porsche-taycan-turbo-s-cross-turismo-2021-mask.png?v=7" },
  "toyota-supra-gr-2020": { base: "/renders/toyota-supra-gr-2020-factory.jpg", mask: "/renders/toyota-supra-gr-2020-mask.png?v=5" },
  "toyota-camry-xse-hybrid-2023": { base: "/renders/toyota-camry-xse-hybrid-2023-factory.jpg", mask: "/renders/toyota-camry-xse-hybrid-2023-mask.png?v=5" },
  "audi-a3-limousine-2021": { base: "/renders/audi-a3-limousine-2021-factory.jpg", mask: "/renders/audi-a3-limousine-2021-mask.png?v=1" },
  "audi-a3-sportback-2021": { base: "/renders/audi-a3-sportback-2021-factory.jpg", mask: "/renders/audi-a3-sportback-2021-mask.png?v=1" },
  "audi-a6-allroad-quattro-2021": { base: "/renders/audi-a6-allroad-quattro-2021-factory.jpg", mask: "/renders/audi-a6-allroad-quattro-2021-mask.png?v=1" },
  "audi-a6-limousine-2021": { base: "/renders/audi-a6-limousine-2021-factory.jpg", mask: "/renders/audi-a6-limousine-2021-mask.png?v=1" },
  "audi-e-tron-sportback-2020": { base: "/renders/audi-e-tron-sportback-2020-factory.jpg", mask: "/renders/audi-e-tron-sportback-2020-mask.png?v=1" },
  "audi-q2-2021": { base: "/renders/audi-q2-2021-factory.jpg", mask: "/renders/audi-q2-2021-mask.png?v=1" },
  "audi-q3-2020": { base: "/renders/audi-q3-2020-factory.jpg", mask: "/renders/audi-q3-2020-mask.png?v=1" },
  "audi-q3-sportback-2020": { base: "/renders/audi-q3-sportback-2020-factory.jpg", mask: "/renders/audi-q3-sportback-2020-mask.png?v=1" },
  "audi-q4-e-tron-2021": { base: "/renders/audi-q4-e-tron-2021-factory.jpg", mask: "/renders/audi-q4-e-tron-2021-mask.png?v=1" },
  "audi-q4-sportback-e-tron-2021": { base: "/renders/audi-q4-sportback-e-tron-2021-factory.jpg", mask: "/renders/audi-q4-sportback-e-tron-2021-mask.png?v=1" },
  "audi-r8-2017": { base: "/renders/audi-r8-2017-factory.jpg", mask: "/renders/audi-r8-2017-mask.png?v=1" },
  "audi-rs-q8-2020": { base: "/renders/audi-rs-q8-2020-factory.jpg", mask: "/renders/audi-rs-q8-2020-mask.png?v=1" },
  "audi-rs3-limousine-2021": { base: "/renders/audi-rs3-limousine-2021-factory.jpg", mask: "/renders/audi-rs3-limousine-2021-mask.png?v=1" },
  "audi-rs3-sportback-2021": { base: "/renders/audi-rs3-sportback-2021-factory.jpg", mask: "/renders/audi-rs3-sportback-2021-mask.png?v=1" },
  "audi-rs5-coupe-2020": { base: "/renders/audi-rs5-coupe-2020-factory.jpg", mask: "/renders/audi-rs5-coupe-2020-mask.png?v=1" },
  "audi-a8-l-2022": { base: "/renders/audi-a8-l-2022-factory.jpg", mask: "/renders/audi-a8-l-2022-mask.png?v=1" },
  "audi-e-tron-sporback-2024": { base: "/renders/audi-e-tron-sporback-2024-factory.jpg", mask: "/renders/audi-e-tron-sporback-2024-mask.png?v=1" },
  "audi-q7-2024": { base: "/renders/audi-q7-2024-factory.jpg", mask: "/renders/audi-q7-2024-mask.png?v=1" },
  "audi-q8-2024": { base: "/renders/audi-q8-2024-factory.jpg", mask: "/renders/audi-q8-2024-mask.png?v=1" },
  "audi-q8-sportback-e-tron-2024": { base: "/renders/audi-q8-sportback-e-tron-2024-factory.jpg", mask: "/renders/audi-q8-sportback-e-tron-2024-mask.png?v=1" },
  "audi-q8-e-tron-2024": { base: "/renders/audi-q8-e-tron-2024-factory.jpg", mask: "/renders/audi-q8-e-tron-2024-mask.png?v=1" },
  "audi-r8-2022": { base: "/renders/audi-r8-2022-factory.jpg", mask: "/renders/audi-r8-2022-mask.png?v=1" },
  "audi-rs-e-tron-gt-2022": { base: "/renders/audi-rs-e-tron-gt-2022-factory.jpg", mask: "/renders/audi-rs-e-tron-gt-2022-mask.png?v=1" },
  "audi-rs5-sportback-2023": { base: "/renders/audi-rs5-sportback-2023-factory.jpg", mask: "/renders/audi-rs5-sportback-2023-mask.png?v=1" },
  "audi-rs6-avant-performance-2023": { base: "/renders/audi-rs6-avant-performance-2023-factory.jpg", mask: "/renders/audi-rs6-avant-performance-2023-mask.png?v=1" },
  "audi-sq5-sportback-2021": { base: "/renders/audi-sq5-sportback-2021-factory.jpg", mask: "/renders/audi-sq5-sportback-2021-mask.png?v=1" },
  "audi-sq7-2024": { base: "/renders/audi-sq7-2024-factory.jpg", mask: "/renders/audi-sq7-2024-mask.png?v=1" },
  "audi-sq8-2024": { base: "/renders/audi-sq8-2024-factory.jpg", mask: "/renders/audi-sq8-2024-mask.png?v=1" },
  "audi-sq8-sportback-e-tron-2024": { base: "/renders/audi-sq8-sportback-e-tron-2024-factory.jpg", mask: "/renders/audi-sq8-sportback-e-tron-2024-mask.png?v=1" },
  "audi-sq8-e-tron-2024": { base: "/renders/audi-sq8-e-tron-2024-factory.jpg", mask: "/renders/audi-sq8-e-tron-2024-mask.png?v=1" },
};

export function plateBase(carId: string) {
  return sources[carId]?.base ?? null;
}

export function carCanWrap(carId: string) {
  return carId in sources;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${src}`));
    image.src = src;
  });
}

export function loadCarPlate(carId: string) {
  const existing = plates.get(carId);
  if (existing) return existing;
  const source = sources[carId];
  if (!source) return Promise.reject(new Error(`No plate for ${carId}`));
  const pending = buildPlate(source.base, source.mask);
  plates.set(carId, pending);
  return pending;
}

async function buildPlate(baseSrc: string, maskSrc: string): Promise<Plate> {
  const [baseImage, maskImage] = await Promise.all([loadImage(baseSrc), loadImage(maskSrc)]);
  const width = baseImage.naturalWidth;
  const height = baseImage.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is not available");
  ctx.drawImage(baseImage, 0, 0);
  const base = ctx.getImageData(0, 0, width, height).data;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(maskImage, 0, 0, width, height);
  const mask = ctx.getImageData(0, 0, width, height).data;
  const count = width * height;
  const shade = new Float32Array(count);
  const alpha = new Float32Array(count);
  let sum = 0;
  let n = 0;
  for (let i = 0, p = 0; i < count; i++, p += 4) {
    const a = mask[p] / 255;
    alpha[i] = a;
    const lum = 0.2126 * base[p] + 0.7152 * base[p + 1] + 0.0722 * base[p + 2];
    shade[i] = lum;
    if (a > 0.78) {
      sum += lum;
      n += 1;
    }
  }
  const avg = n ? sum / n : 158;
  for (let i = 0; i < count; i++) shade[i] = Math.min(2.4, shade[i] / avg);
  return { width, height, base, shade, alpha };
}

function hex(color: string) {
  const value = color.replace("#", "");
  return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)];
}

function modeOf(film: Film) {
  if (film.tier <= 0) return "none";
  const kind = film.family.toLowerCase();
  if (kind.includes("chrome") || kind.includes("mirror")) return "chrome";
  if (/satin|matte|brush|frozen|rugged/.test(kind)) return "satin";
  if (film.swatch2 || /flip|special|colorflow|starlight|diamond/.test(kind)) return "flip";
  return "gloss";
}

export function paintCar(canvas: HTMLCanvasElement, plate: Plate, film: Film) {
  const { width, height, base, shade, alpha } = plate;
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  const image = ctx.createImageData(width, height);
  const out = image.data;
  const mode = modeOf(film);
  const [r, g, b] = hex(film.swatch);
  const [r2, g2, b2] = hex(film.swatch2 ?? film.swatch);
  const flat = mode === "satin" ? 0.45 : mode === "flip" ? 0.12 : 0;
  const spec = mode === "chrome" ? 0.22 : mode === "satin" ? 1.35 : mode === "flip" ? 0.7 : 0.48;

  for (let i = 0, p = 0; i < shade.length; i++, p += 4) {
    const a = alpha[i];
    if (a < 0.004 || mode === "none") {
      out[p] = base[p];
      out[p + 1] = base[p + 1];
      out[p + 2] = base[p + 2];
      out[p + 3] = 255;
      continue;
    }
    const sh = shade[i] * (1 - flat) + flat;
    let cr = r;
    let cg = g;
    let cb = b;
    if (mode === "flip") {
      const t = Math.min(1, Math.max(0, (sh - 0.72) / 0.7));
      cr = r + (r2 - r) * t;
      cg = g + (g2 - g) * t;
      cb = b + (b2 - b) * t;
    }
    let pr = cr * sh;
    let pg = cg * sh;
    let pb = cb * sh;
    const hi = Math.min(1, Math.max(0, (sh - 1.02) / spec));
    pr = pr * (1 - hi) + 255 * hi;
    pg = pg * (1 - hi) + 255 * hi;
    pb = pb * (1 - hi) + 255 * hi;
    out[p] = pr * a + base[p] * (1 - a);
    out[p + 1] = pg * a + base[p + 1] * (1 - a);
    out[p + 2] = pb * a + base[p + 2] * (1 - a);
    out[p + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
}
