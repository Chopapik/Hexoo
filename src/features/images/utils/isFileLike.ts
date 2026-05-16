export function isFileLike(value: unknown): value is File {
  if (!value || typeof value !== "object") {
    return false;
  }

  if (typeof File !== "undefined" && value instanceof File) {
    return true;
  }

  const candidate = value as {
    name?: unknown;
    size?: unknown;
    type?: unknown;
    arrayBuffer?: unknown;
  };

  return (
    typeof candidate.name === "string" &&
    typeof candidate.size === "number" &&
    typeof candidate.type === "string" &&
    typeof candidate.arrayBuffer === "function"
  );
}
