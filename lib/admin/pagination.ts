export const adminPageSize = 20;

export function parseAdminPage(value: string | undefined) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function getAdminRange(page: number, pageSize = adminPageSize) {
  const from = (page - 1) * pageSize;
  return {
    from,
    to: from + pageSize - 1,
  };
}

export function getTotalPages(count: number | null | undefined, pageSize = adminPageSize) {
  return Math.max(1, Math.ceil((count ?? 0) / pageSize));
}
