import { ZodError } from "zod";

export function formatZodErrorFlat(error: ZodError): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_root";
    const message = issue.message;

    if (!result[path]) {
      result[path] = [];
    }
    result[path].push(message);
  }

  if (result._root && result._root.length === 0) {
    delete result._root;
  }

  return result;
}
