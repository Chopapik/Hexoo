import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Batch 9 Supabase generated type drift contract", () => {
  it("keeps a DB validation step that diffs generated types against tracked types", () => {
    const driftScript = readFileSync(
      join(process.cwd(), "scripts/check-supabase-types-drift.sh"),
      "utf8",
    );
    const dbScript = readFileSync(
      join(process.cwd(), "scripts/test-db.sh"),
      "utf8",
    );

    expect(driftScript).toContain("supabase gen types typescript --local");
    expect(driftScript).toContain("src/lib/supabase.database.types.ts");
    expect(driftScript).toContain("diff -u");
    expect(dbScript).toContain("bash scripts/check-supabase-types-drift.sh");
  });
});
