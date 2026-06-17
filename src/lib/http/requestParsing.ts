type PaginationOptions = {
  defaultLimit?: number;
  maxLimit?: number;
};

export function readPaginationParams(
  searchParams: URLSearchParams,
  { defaultLimit = 20, maxLimit }: PaginationOptions = {},
) {
  const rawLimit = searchParams.get("limit");
  const parsedLimit = rawLimit ? Number(rawLimit) : defaultLimit;
  const finiteLimit = Number.isFinite(parsedLimit)
    ? Math.trunc(parsedLimit)
    : defaultLimit;
  const boundedLimit =
    maxLimit && finiteLimit > maxLimit ? defaultLimit : finiteLimit;

  return {
    limit: boundedLimit > 0 ? boundedLimit : defaultLimit,
    startAfter: searchParams.get("startAfter") || undefined,
  };
}
