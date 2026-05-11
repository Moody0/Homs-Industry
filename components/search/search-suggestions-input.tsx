"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchSuggestionsInputProps = {
  areaPlaceholder?: string;
  buttonLabel?: string;
  className?: string;
  defaultArea?: string;
  defaultValue?: string;
  inputPlaceholder?: string;
  showAreaField?: boolean;
};

type SearchPreviewResult = {
  area: string;
  category: string;
  name: string;
  phone: string;
  rating: number;
  reviewsCount: number;
  slug: string;
};

export function SearchSuggestionsInput({
  areaPlaceholder = "كل حمص",
  buttonLabel,
  className,
  defaultArea = "",
  defaultValue = "",
  inputPlaceholder = "ابحث عن خدمة أو محل ...",
  showAreaField = false,
}: SearchSuggestionsInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasLoadedPreview, setHasLoadedPreview] = useState(false);
  const [query, setQuery] = useState(defaultValue);
  const [area, setArea] = useState(defaultArea);
  const [results, setResults] = useState<SearchPreviewResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      startTransition(async () => {
        try {
          const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(query)}`, { signal: controller.signal });
          if (response.ok) {
            const data = (await response.json()) as { results: SearchPreviewResult[]; suggestions: string[] };
            setResults(data.results);
            setSuggestions(data.suggestions);
            setHasLoadedPreview(true);
            setIsOpen(true);
          }
        } catch (error) {
          if ((error as DOMException).name !== "AbortError") {
            setResults([]);
            setSuggestions([]);
            setHasLoadedPreview(true);
          }
        }
      });
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query]);

  const hasPreview = isOpen && query.trim().length >= 2 && (hasLoadedPreview || suggestions.length > 0 || results.length > 0);

  return (
    <form
      action="/search"
      className={cn(
        "relative z-[2147483647] grid rounded-lg bg-white text-slate-950 shadow-sm md:grid-cols-[minmax(0,1fr)_56px]",
        showAreaField && "gap-2 p-2 md:grid-cols-[minmax(0,1.35fr)_minmax(150px,0.7fr)_132px]",
        className,
      )}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
      onFocus={() => {
        if (query.trim().length >= 2) setIsOpen(true);
      }}
    >
      <label className={cn("flex h-12 min-w-0 items-center gap-3 rounded-lg bg-transparent px-4", showAreaField && "bg-slate-50 ring-1 ring-slate-100 md:bg-white md:ring-0")}>
        <Search aria-hidden className="size-5 shrink-0 text-orange-500" />
        <span className="sr-only">الخدمة أو المحل</span>
        <input
          autoComplete="off"
          className="h-12 w-full min-w-0 bg-transparent text-sm font-bold outline-none placeholder:text-slate-400"
          name="q"
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            setIsOpen(nextQuery.trim().length >= 2);
            setHasLoadedPreview(false);
            if (nextQuery.trim().length < 2) {
              setResults([]);
              setSuggestions([]);
            }
          }}
          placeholder={inputPlaceholder}
          type="search"
          value={query}
        />
      </label>
      {showAreaField ? (
        <label className="flex h-12 min-w-0 items-center gap-3 rounded-lg bg-slate-50 px-4 ring-1 ring-slate-100 md:bg-white md:ring-0">
          <MapPin aria-hidden className="size-5 shrink-0 text-orange-500" />
          <span className="sr-only">الموقع</span>
          <input
            autoComplete="off"
            className="h-12 w-full min-w-0 bg-transparent text-sm font-bold outline-none placeholder:text-slate-400"
            name="area"
            onChange={(event) => setArea(event.target.value)}
            placeholder={areaPlaceholder}
            type="search"
            value={area}
          />
        </label>
      ) : null}
      <button className={cn("inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 text-sm font-black text-white transition hover:bg-orange-600", !showAreaField && "rounded-r-none")} type="submit">
        {buttonLabel ? <span>{buttonLabel}</span> : null}
        {buttonLabel ? <ArrowLeft aria-hidden className="size-4" /> : <Search aria-hidden className="size-5" />}
      </button>
      {hasPreview ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[2147483647] overflow-hidden rounded-lg border border-slate-200 bg-white text-right shadow-2xl shadow-slate-950/15">
          {suggestions.length > 0 ? (
            <div className="border-b border-slate-100 p-3">
              <p className="mb-2 text-[11px] font-black text-slate-400">اقتراحات سريعة</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700 transition hover:bg-orange-50 hover:text-orange-700"
                    key={suggestion}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      setQuery(suggestion);
                      setIsOpen(false);
                    }}
                    type="button"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {results.length > 0 ? (
            <div className="grid">
              {results.map((result) => (
                <Link
                  className="grid gap-2 border-b border-slate-100 p-3 transition last:border-b-0 hover:bg-orange-50"
                  href={`/businesses/${result.slug}`}
                  key={result.slug}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm font-black text-slate-950">{result.name}</p>
                      <p className="mt-1 line-clamp-1 text-xs font-bold text-slate-500">{result.category} · حمص - {result.area}</p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-black text-orange-600 ring-1 ring-orange-100">
                      <Star aria-hidden className="size-3 fill-orange-500 text-orange-500" />
                      {Number(result.rating).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
                    <span>{result.reviewsCount} تقييم</span>
                    <span className="inline-flex items-center gap-1"><Phone aria-hidden className="size-3" /> {result.phone}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
          {hasLoadedPreview && suggestions.length === 0 && results.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm font-black text-slate-950">لا توجد نتائج مطابقة</p>
              <p className="mt-1 text-xs font-bold text-slate-500">جرّب كلمة أبسط، اسم منطقة، أو نوع الخدمة التي تبحث عنها.</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
