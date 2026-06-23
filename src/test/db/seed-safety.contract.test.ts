import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const seed = readFileSync(
  join(process.cwd(), "supabase/seeds/dev_admin.sql"),
  "utf8",
).toLowerCase();

describe("Batch 9 dev admin seed safety contract", () => {
  it("requires an explicit local guard setting before creating the known dev admin", () => {
    expect(seed).toContain("current_setting('hexoo.allow_dev_admin_seed', true)");
    expect(seed).toContain("dev_admin_seed_local_guard");
    expect(seed.indexOf("dev_admin_seed_local_guard")).toBeLessThan(
      seed.indexOf("insert into auth.users"),
    );
    expect(seed).toContain("admin@admin.pl");
    expect(seed).toContain("admin1234");
  });
});
