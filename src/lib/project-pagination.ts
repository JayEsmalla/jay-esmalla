export type ProjectFilter = "all" | "mobile" | "web";

export const PROJECTS_PER_PAGE = 6;

export function readProjectFilter(search: URLSearchParams): ProjectFilter {
  const filter = search.get("filter");
  return filter === "mobile" || filter === "web" ? filter : "all";
}

export function projectSearch(search: URLSearchParams, filter: ProjectFilter, page: number) {
  const next = new URLSearchParams(search);
  if (filter === "all") next.delete("filter");
  else next.set("filter", filter);
  if (page === 1) next.delete("page");
  else next.set("page", String(page));
  return next.toString();
}

export function projectPagination(search: URLSearchParams, total: number) {
  const totalPages = Math.max(1, Math.ceil(total / PROJECTS_PER_PAGE));
  const rawPage = search.get("page") ?? "1";
  const requested = /^[1-9]\d*$/.test(rawPage) && Number.isSafeInteger(Number(rawPage)) ? Number(rawPage) : 1;
  const page = Math.min(requested, totalPages);
  return {
    page,
    totalPages,
    start: (page - 1) * PROJECTS_PER_PAGE,
    canonicalSearch: projectSearch(search, readProjectFilter(search), page),
  };
}

export function projectPageNumbers(page: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const visible = [...new Set([1, page - 1, page, page + 1, total])]
    .filter((item) => item >= 1 && item <= total).sort((a, b) => a - b);
  return visible.flatMap((item, index): Array<number | "ellipsis"> =>
    index > 0 && item - visible[index - 1] > 1 ? ["ellipsis", item] : [item],
  );
}
