import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Car as CarIcon, Check, ChevronDown, Columns2, Ellipsis, Maximize2, MessageSquare, Moon, Search, Sun, X } from "lucide-react";
import {
  carById,
  cars,
  filmBrands,
  filmById,
  films,
  resolveCarId,
  type Car,
  type Film,
} from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { estimate, money, type Coverage, type Paint } from "@/lib/pricing";
import { carCanWrap, loadCarPlate, paintCar, plateBase } from "@/lib/wrap";

type Build = {
  id: string;
  at: number;
  carId: string;
  filmId: string;
  coverage: Coverage;
  paint: Paint;
  wheels: string;
  name: string;
  city: string;
  timeline: string;
  low: number;
  high: number;
};

const STORAGE_KEY = "elevated.builds";

const timelines = ["Ready this month", "This season", "Just looking"] as const;

function swatchStyle(film: Film): { background: string } {
  if (film.id === "factory") return { background: film.swatch };
  if (film.swatch2) {
    return {
      background: `radial-gradient(circle at 32% 30%, rgba(255,255,255,.72), ${film.swatch} 34%, ${film.swatch2} 70%, #111 128%)`,
    };
  }
  const soft = /satin|matte|brush|frozen|rugged/i.test(film.family);
  const highlight = soft ? "rgba(255,255,255,.3)" : "rgba(255,255,255,.85)";
  return { background: `radial-gradient(circle at 32% 28%, ${highlight}, ${film.swatch} 46%, #141414 124%)` };
}

const brandLabel: Record<string, string> = {
  All: "All",
  "3M": "3M",
  "Avery Dennison": "Avery",
  KPMF: "KPMF",
  ORACAL: "ORACAL",
};

function readBuilds(): Build[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Build[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function Configurator() {
  const [carId, setCarId] = useState("ford-mustang-gt-2024");
  const [filmId, setFilmId] = useState("gold");
  const [brand, setBrand] = useState<(typeof filmBrands)[number]>("All");
  const [query, setQuery] = useState("");
  const [coverage, setCoverage] = useState<Coverage>("full");
  const [paint, setPaint] = useState<Paint>("clean");
  const [family, setFamily] = useState("All");
  const [hue, setHue] = useState("All");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [compareId, setCompareId] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [pickerBrand, setPickerBrand] = useState("Ford");
  const [pickerModel, setPickerModel] = useState("Mustang GT");
  const [brandQuery, setBrandQuery] = useState("");
  const [modelQuery, setModelQuery] = useState("");
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [buildsOpen, setBuildsOpen] = useState(false);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const car = params.get("car");
    const film = params.get("film");
    const cov = params.get("coverage");
    const paintParam = params.get("paint");
    if (car) setCarId(resolveCarId(car));
    if (film && films.some((item) => item.id === film)) setFilmId(film);
    if (cov === "full" || cov === "accent") setCoverage(cov);
    if (paintParam === "clean" || paintParam === "chips" || paintParam === "prep") setPaint(paintParam);
    setBuilds(readBuilds());
    const saved = localStorage.getItem("elevated.theme") || localStorage.getItem("sheen.theme");
    if (saved === "dark" || saved === "light") setTheme(saved);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams();
    params.set("car", carId);
    params.set("film", filmId);
    params.set("coverage", coverage);
    params.set("paint", paint);
    const next = `?${params.toString()}`;
    if (window.location.search !== next) {
      window.history.replaceState(null, "", next);
    }
  }, [ready, carId, filmId, coverage, paint]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT")) {
        return;
      }
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const index = films.findIndex((film) => film.id === filmId);
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const next = films[(index + delta + films.length) % films.length];
      if (next) setFilmId(next.id);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filmId]);

  const car = carById(carId);
  const film = filmById(filmId);
  const compare = compareId ? filmById(compareId) : null;
  const price = estimate(car, film, coverage, paint);

  const visibleFilms = useMemo(() => {
    const q = query.trim().toLowerCase();
    return films.filter((item) => {
      if (brand !== "All" && item.brand !== brand) return false;
      if (family !== "All" && item.family !== family) return false;
      if (hue !== "All" && item.hue !== hue) return false;
      if (!q) return true;
      return `${item.name} ${item.brand} ${item.code} ${item.family} ${item.line}`.toLowerCase().includes(q);
    });
  }, [brand, family, hue, query]);

  const families = ["All", ...new Set(films.map((item) => item.family))];
  const hues = ["All", ...new Set(films.map((item) => item.hue))];

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("elevated.theme", next);
  }

  function openPicker() {
    setPickerBrand(car.brand);
    setPickerModel(car.model);
    setBrandQuery("");
    setModelQuery("");
    setPickerOpen(true);
  }

  function toggleCompare() {
    setCompareId((current) => (current ? null : filmId === "factory" ? "satin-black" : "factory"));
  }

  function saveBuild(entry: Omit<Build, "id" | "at">) {
    const next: Build = { ...entry, id: crypto.randomUUID(), at: Date.now() };
    const list = [next, ...readBuilds()].slice(0, 12);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    setBuilds(list);
    setBuildsOpen(true);
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-surface text-fg">
      <h1 className="sr-only">
        {car.year} {car.brand} {car.model} vinyl wrap visualizer
      </h1>
      <header className="grid h-14 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b border-line px-3 sm:gap-3 sm:px-4">
        <button
          type="button"
          onClick={openPicker}
          className="inline-flex h-10 min-w-0 max-w-full items-center justify-self-start gap-2 rounded-full border border-line bg-surface px-3 text-sm"
        >
          <CarIcon className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate font-medium">{car.model}</span>
          <span className="shrink-0 text-muted">{car.year}</span>
          <ChevronDown className="size-4 shrink-0 text-muted" aria-hidden="true" />
        </button>
        <a href="/" className="shrink-0 justify-self-center" aria-label="Elevated Auto Wraps">
          <img src="/brand/elevated-logo-ink.png" alt="Elevated Auto Wraps" className="logo-ink h-9 w-auto sm:h-10" />
          <img src="/brand/elevated-logo.png" alt="" aria-hidden="true" className="logo-on-dark h-9 w-auto sm:h-10" />
        </a>
        <div className="flex shrink-0 items-center justify-self-end">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 items-center gap-2 rounded-full px-2 text-sm text-muted"
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            <span className="hidden md:inline">{theme === "dark" ? "Light theme" : "Dark theme"}</span>
          </button>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-pressed={expanded}
            className="hidden h-10 items-center gap-2 rounded-full px-2 text-sm text-muted lg:inline-flex"
          >
            <Maximize2 className="size-4" />
            {expanded ? "Show panel" : "Expand preview"}
          </button>
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="inline-flex size-10 items-center justify-center rounded-full text-muted"
            aria-label="More options"
          >
            <Ellipsis className="size-5" />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section className="relative aspect-video shrink-0 overflow-hidden bg-well lg:aspect-auto lg:min-h-0 lg:flex-1">
          <div className={cn("absolute inset-0 flex", compare && "gap-1")}>
            <div className="relative min-w-0 flex-1">
              <StageFrame car={car} film={film} />
            </div>
            {compare ? (
              <div className="relative min-w-0 flex-1">
                <StageFrame car={car} film={compare} />
              </div>
            ) : null}
          </div>
        </section>

        {expanded ? null : (
          <aside className="flex min-h-0 flex-1 flex-col border-line bg-surface lg:w-[22.5rem] lg:flex-none lg:border-l" aria-label="Customize your car">
            <div className="shrink-0 px-4 pt-4">
              <h2 className="text-lg font-semibold">Customize your car</h2>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
                <div className="shrink-0 space-y-3 px-4 pt-3">
                  <label className="flex h-11 items-center gap-2 rounded-xl border border-line px-3">
                    <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search color or film code"
                      aria-label="Search finishes by color name, film code, or brand"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
                    />
                  </label>
                  <div className="flex gap-1 overflow-x-auto" aria-label="Manufacturers">
                    {filmBrands.map((item) => (
                      <button
                        key={item}
                        type="button"
                        aria-pressed={brand === item}
                        onClick={() => setBrand(item)}
                        className={cn(
                          "h-11 shrink-0 rounded-lg px-3 text-sm",
                          brand === item ? "bg-brass text-brass-ink" : "text-muted",
                        )}
                      >
                        {brandLabel[item] ?? item}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <FilterSelect label="Finish type" value={family} onChange={setFamily} options={families} />
                    <FilterSelect label="Color family" value={hue} onChange={setHue} options={hues} />
                  </div>
                  <p className="text-xs text-muted" aria-live="polite">
                    {visibleFilms.length} finishes
                  </p>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">
                  {visibleFilms.length === 0 ? (
                    <p className="py-6 text-sm text-muted">No film matches that search.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {visibleFilms.map((item) => {
                        const selected = item.id === filmId;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            aria-pressed={selected}
                            aria-label={`${item.name}, ${item.brand}, ${item.family}, ${item.code}`}
                            onClick={() => setFilmId(item.id)}
                            className="flex flex-col items-center"
                          >
                            <span
                              className={cn(
                                "size-16 rounded-full border-2",
                                selected ? "border-fg ring-2 ring-fg ring-offset-2 ring-offset-surface" : "border-white shadow-sm",
                              )}
                              style={swatchStyle(item)}
                            />
                            <span className="mt-1 line-clamp-2 text-center text-xs font-medium">{item.name}</span>
                            <span className="text-center text-[10px] text-muted">{item.code}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
            </div>

            <div className="shrink-0 border-t border-line px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="size-10 shrink-0 rounded-full border border-line" style={swatchStyle(film)} aria-hidden="true" />
                <div className="min-w-0" aria-live="polite">
                  <p className="truncate text-sm font-semibold">{film.name}</p>
                  <p className="truncate text-xs text-muted">
                    {film.brand} · {film.family}
                  </p>
                  <p className="truncate text-xs text-muted">{film.code}</p>
                </div>
              </div>
              <button
                type="button"
                disabled={!price}
                onClick={() => setQuoteOpen(true)}
                className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brass text-sm font-medium text-brass-ink disabled:opacity-40"
              >
                <MessageSquare className="size-4" />
                {price ? "Price this wrap" : "Factory paint"}
              </button>
            </div>
          </aside>
        )}
      </div>

      <CarPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        car={car}
        brandName={pickerBrand}
        modelName={pickerModel}
        brandQuery={brandQuery}
        modelQuery={modelQuery}
        onBrandQuery={setBrandQuery}
        onModelQuery={setModelQuery}
        onBrand={(value) => {
          setPickerBrand(value);
          const first = cars.find((item) => item.brand === value);
          if (first) setPickerModel(first.model);
        }}
        onModel={setPickerModel}
        onYear={(year) => {
          const next = cars.find((item) => item.brand === pickerBrand && item.model === pickerModel && item.year === year);
          if (!next) return;
          setCarId(next.id);
          setPickerOpen(false);
        }}
      />

      <OptionDialog open={moreOpen} onOpenChange={setMoreOpen} title="More" description="Coverage, paint, and saved builds.">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs tracking-widest text-muted uppercase">Coverage</p>
            <Segmented
              value={coverage}
              onChange={setCoverage}
              options={[
                { id: "full", label: "Full wrap" },
                { id: "accent", label: "Accent" },
              ]}
            />
          </div>
          <div>
            <p className="mb-2 text-xs tracking-widest text-muted uppercase">Paint under the film</p>
            <Segmented
              value={paint}
              onChange={setPaint}
              options={[
                { id: "clean", label: "Clean" },
                { id: "chips", label: "Chips" },
                { id: "prep", label: "Needs prep" },
              ]}
            />
          </div>
          <button
            type="button"
            aria-pressed={Boolean(compareId)}
            onClick={toggleCompare}
            className={cn(
              "flex h-11 w-full items-center justify-center gap-2 rounded-card border text-sm",
              compareId ? "border-brass bg-brass text-brass-ink" : "border-line",
            )}
          >
            <Columns2 className="size-4" />
            {compareId ? "Comparing" : "Compare with factory"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMoreOpen(false);
              setBuildsOpen(true);
            }}
            className="h-11 w-full rounded-card border border-line text-sm"
          >
            Saved builds{builds.length > 0 ? ` (${builds.length})` : ""}
          </button>
          <p className="text-sm text-muted">
            {price ? `${money(price.low)}–${money(price.high)} installed` : "Factory paint is not a wrap."}
          </p>
        </div>
      </OptionDialog>

      <QuoteDialog
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        car={car}
        film={film}
        coverage={coverage}
        paint={paint}
        price={price}
        onSave={saveBuild}
      />
      <BuildsDialog
        open={buildsOpen}
        onOpenChange={setBuildsOpen}
        builds={builds}
        onOpen={(build) => {
          setCarId(build.carId);
          setFilmId(build.filmId);
          setCoverage(build.coverage);
          setPaint(build.paint);
          setBuildsOpen(false);
        }}
      />
    </div>
  );
}


function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block min-w-0 text-xs text-muted">
      {label}
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-2 text-sm text-fg"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function CarPicker({
  open,
  onOpenChange,
  car,
  brandName,
  modelName,
  brandQuery,
  modelQuery,
  onBrandQuery,
  onModelQuery,
  onBrand,
  onModel,
  onYear,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  car: Car;
  brandName: string;
  modelName: string;
  brandQuery: string;
  modelQuery: string;
  onBrandQuery: (value: string) => void;
  onModelQuery: (value: string) => void;
  onBrand: (value: string) => void;
  onModel: (value: string) => void;
  onYear: (year: number) => void;
}) {
  const brands = [...new Set(cars.map((item) => item.brand))].filter((item) =>
    item.toLowerCase().includes(brandQuery.trim().toLowerCase()),
  );
  const models = [...new Set(cars.filter((item) => item.brand === brandName).map((item) => item.model))].filter((item) =>
    item.toLowerCase().includes(modelQuery.trim().toLowerCase()),
  );
  const years = cars.filter((item) => item.brand === brandName && item.model === modelName);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-30 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-40 max-h-[calc(100dvh-2rem)] w-[min(56rem,calc(100%-1.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-surface p-5 text-fg shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-xl font-semibold">Pick your car</Dialog.Title>
              <Dialog.Description className="text-sm text-muted">Choose a brand, model and year.</Dialog.Description>
            </div>
            <Dialog.Close className="inline-flex size-11 items-center justify-center rounded-full" aria-label="Close">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <p className="mb-2 text-sm font-medium">1 Brand</p>
              <label className="mb-2 flex h-11 items-center gap-2 rounded-xl border border-line px-3">
                <Search className="size-4 text-muted" aria-hidden="true" />
                <input
                  value={brandQuery}
                  onChange={(event) => onBrandQuery(event.target.value)}
                  placeholder="Find brand"
                  aria-label="Find brand"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </label>
              <ul className="max-h-64 space-y-1 overflow-y-auto">
                {brands.map((item) => {
                  const selected = item === brandName;
                  return (
                    <li key={item}>
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onBrand(item)}
                        className={cn(
                          "flex h-11 w-full items-center justify-between rounded-xl border px-3 text-left text-sm",
                          selected ? "border-fg bg-surface-2" : "border-transparent",
                        )}
                      >
                        {item}
                        {selected ? <Check className="size-4" /> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">2 Model</p>
              <label className="mb-2 flex h-11 items-center gap-2 rounded-xl border border-line px-3">
                <Search className="size-4 text-muted" aria-hidden="true" />
                <input
                  value={modelQuery}
                  onChange={(event) => onModelQuery(event.target.value)}
                  placeholder="Find model"
                  aria-label="Find model"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </label>
              <ul className="max-h-64 space-y-1 overflow-y-auto">
                {models.map((item) => {
                  const selected = item === modelName;
                  return (
                    <li key={item}>
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onModel(item)}
                        className={cn(
                          "flex h-11 w-full items-center justify-between rounded-xl border px-3 text-left text-sm",
                          selected ? "border-fg bg-surface-2" : "border-transparent",
                        )}
                      >
                        {item}
                        {selected ? <Check className="size-4" /> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">3 Year</p>
              <ul className="max-h-64 space-y-2 overflow-y-auto">
                {years.map((item) => {
                  const selected = item.id === car.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onYear(item.year)}
                        className={cn(
                          "flex h-12 w-full items-center justify-between rounded-xl border px-3 text-sm",
                          selected ? "border-fg bg-surface-2" : "border-line",
                        )}
                      >
                        {item.year}
                        {selected ? <Check className="size-4" /> : <span aria-hidden="true">→</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-xs text-muted">Tap a year to use this car.</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted">Your wrap stays selected when you change cars.</p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function StageFrame({ car, film }: { car: Car; film: Film }) {
  if (carCanWrap(car.id)) return <LiveStage car={car} film={film} />;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
      <p className="font-display text-5xl tracking-wide text-fg/80">{car.model}</p>
      <p className="text-sm text-muted">
        {car.year} {car.brand}
      </p>
      <p className="text-xs text-muted">
        {film.name} · {film.code} · studio plate not shot yet
      </p>
    </div>
  );
}

function LiveStage({ car, film }: { car: Car; film: Film }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let dead = false;
    loadCarPlate(car.id)
      .then((plate) => {
        if (dead || !canvasRef.current) return;
        paintCar(canvasRef.current, plate, film);
        setReady(true);
      })
      .catch(() => setReady(false));
    return () => {
      dead = true;
    };
  }, [car.id, film]);

  return (
    <>
      <img
        src={plateBase(car.id) ?? ""}
        alt=""
        className={cn("absolute inset-0 h-full w-full object-contain", ready && "invisible")}
      />
      <canvas
        ref={canvasRef}
        aria-label={`${car.year} ${car.brand} ${car.model} in ${film.name}`}
        className="stage-photo absolute inset-0 h-full w-full object-contain"
      />
    </>
  );
}

function OptionDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-30 bg-bg/80" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-40 max-h-[calc(100dvh-2rem)] w-[min(28rem,calc(100%-1.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-card border border-line bg-surface p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="font-display text-3xl tracking-wide">{title}</Dialog.Title>
              <Dialog.Description className="text-sm text-muted">{description}</Dialog.Description>
            </div>
            <Dialog.Close className="inline-flex size-11 items-center justify-center rounded-card border border-line" aria-label="Close">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <div className="mt-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { id: T; label: string }[];
}) {
  return (
    <div className={cn("grid gap-2", options.length > 2 ? "grid-cols-3" : "grid-cols-2")}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            "h-11 rounded-card border text-sm",
            value === option.id ? "border-brass bg-brass text-brass-ink" : "border-line bg-surface text-fg",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function QuoteDialog({
  open,
  onOpenChange,
  car,
  film,
  coverage,
  paint,
  price,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  car: Car;
  film: Film;
  coverage: Coverage;
  paint: Paint;
  price: { low: number; high: number } | null;
  onSave: (entry: Omit<Build, "id" | "at">) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [timeline, setTimeline] = useState<(typeof timelines)[number]>("This season");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setDone(false);
      setError("");
    }
  }, [open]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!price) return;
    if (name.trim().length < 2) {
      setError("Add a name so the shop knows who the build is for.");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setError("That email does not look usable.");
      return;
    }
    onSave({
      carId: car.id,
      filmId: film.id,
      coverage,
      paint,
      wheels: "studio",
      name: name.trim(),
      city: city.trim(),
      timeline,
      low: price.low,
      high: price.high,
    });
    setDone(true);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-30 bg-bg/80" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-40 max-h-[calc(100dvh-2rem)] w-[min(32rem,calc(100%-1.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-card border border-line bg-surface p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="font-display text-3xl tracking-wide">Price this wrap</Dialog.Title>
              <Dialog.Description className="text-sm text-muted">
                {car.year} {car.brand} {car.model} · {film.name} · {film.code}
              </Dialog.Description>
            </div>
            <Dialog.Close className="inline-flex size-11 items-center justify-center rounded-card border border-line" aria-label="Close">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          {price ? (
            <p className="mt-3 font-display text-3xl tracking-wide">
              {money(price.low)}–{money(price.high)}
            </p>
          ) : null}
          <p className="text-sm text-muted">
            {coverage === "full" ? "Full vehicle" : "Accent panels"} · paint {paint}
          </p>
          {done ? (
            <p className="mt-5 text-sm leading-relaxed">
              Saved on this device. A shop would get the car, the film code, the coverage, and the timeline — nothing is sent from this preview.
            </p>
          ) : (
            <form onSubmit={submit} className="mt-4 space-y-3">
              <Field label="Name" value={name} onChange={setName} autoComplete="name" />
              <Field label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" />
              <Field label="City" value={city} onChange={setCity} autoComplete="address-level2" />
              <label className="block text-sm">
                <span className="mb-1 block text-muted">Timeline</span>
                <select
                  value={timeline}
                  onChange={(event) => setTimeline(event.target.value as (typeof timelines)[number])}
                  className="h-11 w-full rounded-card border border-line bg-bg px-3"
                >
                  {timelines.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              {error ? <p className="text-sm text-danger">{error}</p> : null}
              <button type="submit" className="h-12 w-full rounded-card bg-brass font-medium text-brass-ink">
                Save this build
              </button>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted">{label}</span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-card border border-line bg-bg px-3"
      />
    </label>
  );
}

function BuildsDialog({
  open,
  onOpenChange,
  builds,
  onOpen,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  builds: Build[];
  onOpen: (build: Build) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-30 bg-bg/80" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-40 max-h-[calc(100dvh-2rem)] w-[min(32rem,calc(100%-1.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-card border border-line bg-surface p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="font-display text-3xl tracking-wide">Your builds</Dialog.Title>
              <Dialog.Description className="text-sm text-muted">Kept on this device only.</Dialog.Description>
            </div>
            <Dialog.Close className="inline-flex size-11 items-center justify-center rounded-card border border-line" aria-label="Close">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          {builds.length === 0 ? (
            <p className="mt-5 text-sm text-muted">Nothing saved yet. Price a wrap and it lands here.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {builds.map((build) => {
                const car = carById(build.carId);
                const film = filmById(build.filmId);
                return (
                  <li key={build.id}>
                    <button
                      type="button"
                      onClick={() => onOpen(build)}
                      className="w-full rounded-card border border-line px-3 py-3 text-left"
                    >
                      <span className="block font-medium">
                        {car.model} · {film.name}
                      </span>
                      <span className="block text-sm text-muted">
                        {build.name}
                        {build.city ? ` · ${build.city}` : ""} · {money(build.low)}–{money(build.high)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
