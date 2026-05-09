"use client";

import { useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";

type SearchSuggestionsInputProps = {
  defaultValue?: string;
};

export function SearchSuggestionsInput({ defaultValue = "" }: SearchSuggestionsInputProps) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      startTransition(async () => {
        const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (response.ok) {
          const data = (await response.json()) as { suggestions: string[] };
          setSuggestions(data.suggestions);
        }
      });
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query]);

  return (
    <form action="/search" className="relative grid overflow-hidden rounded-lg bg-white text-slate-950 md:grid-cols-[1fr_56px]">
      <input className="h-12 bg-transparent px-4 text-sm outline-none" list="search-suggestions" name="q" onChange={(event) => {
        const nextQuery = event.target.value;
        setQuery(nextQuery);
        if (nextQuery.trim().length < 2) setSuggestions([]);
      }} placeholder="ابحث عن خدمة أو محل ..." value={query} />
      <button className="grid h-12 place-items-center bg-orange-500 text-white" type="submit"><Search aria-hidden className="size-5" /></button>
      <datalist id="search-suggestions">
        {suggestions.map((suggestion) => <option key={suggestion} value={suggestion} />)}
      </datalist>
    </form>
  );
}
