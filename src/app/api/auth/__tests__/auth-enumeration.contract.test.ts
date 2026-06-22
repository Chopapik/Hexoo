import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("AUTH-ENUMERATION-001 public email behavior", () => {
  it("does not expose a public email availability route", () => {
    expect(
      existsSync(join(root, "src/app/api/auth/check-email/route.ts")),
    ).toBe(false);

    const registerForm = readFileSync(
      join(root, "src/features/auth/components/RegisterForm.tsx"),
      "utf8",
    );
    expect(registerForm).not.toMatch(/useCheckEmail|check-email/);
  });

  it("keeps username availability separate and intentionally public", () => {
    const source = readFileSync(
      join(root, "src/app/api/auth/check-username/route.ts"),
      "utf8",
    );

    expect(source).toContain("checkUsernameAvailability");
    expect(source).not.toMatch(/email|checkEmailAvailability/i);
  });

  it("uses the approved neutral registration wording", () => {
    const source = readFileSync(
      join(root, "src/i18n/translations.ts"),
      "utf8",
    );

    expect(source).toContain(
      "Jeśli rejestracja dla podanego adresu jest możliwa, otrzymasz wiadomość z linkiem potwierdzającym.",
    );
  });
});
