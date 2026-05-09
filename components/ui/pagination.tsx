import Link from "next/link";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
};

function buildHref(basePath: string, params: Record<string, string | undefined>, page: number) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value && key !== "page") query.set(key, value);
  });

  if (page > 1) query.set("page", String(page));
  const queryString = query.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

export function Pagination({ page, totalPages, basePath, searchParams = {} }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="الصفحات">
      {Array.from({ length: totalPages }).map((_, index) => {
        const nextPage = index + 1;
        return (
          <Link
            className={cn(
              "grid size-10 place-items-center rounded-lg border text-sm font-black transition",
              nextPage === page
                ? "border-orange-500 bg-orange-500 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50",
            )}
            href={buildHref(basePath, searchParams, nextPage)}
            key={nextPage}
          >
            {nextPage}
          </Link>
        );
      })}
    </nav>
  );
}
