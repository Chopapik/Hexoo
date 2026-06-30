import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

type PackageJson = {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const repoRoot = process.cwd();
const packageJsonPath = path.join(repoRoot, "package.json");
const packageJson = JSON.parse(
  readFileSync(packageJsonPath, "utf8"),
) as PackageJson;

const dependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

const runtimeDependencies = packageJson.dependencies ?? {};
const localEntrypointPattern =
  /(?:^|\s)(?:npx\s+)?(?:node|tsx|ts-node|vite-node)?\s*(?<file>(?:\.\/)?(?:scripts|src)\/[^\s;&|]+?\.(?:mjs|cjs|js|jsx|ts|tsx))/g;

const scriptRunnerPackages: Record<string, string> = {
  eslint: "eslint",
  next: "next",
  storybook: "storybook",
  supabase: "supabase",
  tsx: "tsx",
  vitest: "vitest",
};

const frameworkProvidedImports = new Set(["server-only"]);
const nodeBuiltinImports = new Set([
  "buffer",
  "crypto",
  "fs",
  "node:fs",
  "node:path",
  "node:url",
  "path",
  "url",
]);

function scriptEntrypoints(command: string): string[] {
  return [...command.matchAll(localEntrypointPattern)].map((match) =>
    String(match.groups?.file ?? "").replace(/^\.\//, ""),
  );
}

function firstRunner(command: string): string | null {
  const tokens = command.trim().split(/\s+/);
  if (tokens.length === 0) return null;
  if (tokens[0] === "npx") return tokens[1] ?? null;
  return tokens[0] ?? null;
}

function listSourceFiles(dir: string): string[] {
  const entries = statSync(dir).isDirectory()
    ? readFileSyncDirectory(dir)
    : [];

  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) return listSourceFiles(fullPath);
    if (!/\.(ts|tsx)$/.test(entry)) return [];
    if (/\.(test|spec|stories)\.(ts|tsx)$/.test(entry)) return [];
    if (fullPath.includes(`${path.sep}__tests__${path.sep}`)) return [];
    if (fullPath.includes(`${path.sep}src${path.sep}test${path.sep}`)) {
      return [];
    }
    return [fullPath];
  });
}

function readFileSyncDirectory(dir: string): string[] {
  return readdirSync(dir);
}

function packageNameFromSpecifier(specifier: string): string {
  if (specifier.startsWith("@")) {
    const [scope, name] = specifier.split("/");
    return `${scope}/${name}`;
  }
  return specifier.split("/")[0] ?? specifier;
}

function runtimePackageImports(source: string): string[] {
  const imports = new Set<string>();
  const importPattern =
    /import\s+(?!type\b)(?:[^'"]+?\s+from\s+)?["'](?<specifier>[^."'@][^"']*|@[^"']+)["']/g;

  for (const match of source.matchAll(importPattern)) {
    const specifier = match.groups?.specifier;
    if (!specifier) continue;
    if (specifier.startsWith(".") || specifier.startsWith("@/")) continue;

    const packageName = packageNameFromSpecifier(specifier);
    if (nodeBuiltinImports.has(packageName)) continue;
    if (frameworkProvidedImports.has(packageName)) continue;
    imports.add(packageName);
  }

  return [...imports].sort();
}

describe("TOOLING-CLEAN-INSTALL-001 clean install static contract", () => {
  it("TOOLING-CLEAN-INSTALL-001 package scripts reference existing local entrypoints", () => {
    const missing = Object.entries(packageJson.scripts ?? {}).flatMap(
      ([scriptName, command]) =>
        scriptEntrypoints(command)
          .filter((entrypoint) => !existsSync(path.join(repoRoot, entrypoint)))
          .map((entrypoint) => `${scriptName}: ${entrypoint}`),
    );

    expect(missing).toEqual([]);
  });

  it("TOOLING-CLEAN-INSTALL-001 package scripts declare their runners", () => {
    const missing = Object.entries(packageJson.scripts ?? {}).flatMap(
      ([scriptName, command]) => {
        const runner = firstRunner(command);
        if (!runner) return [];

        const dependencyName = scriptRunnerPackages[runner];
        if (!dependencyName || dependencies[dependencyName]) return [];

        return [`${scriptName}: ${dependencyName}`];
      },
    );

    expect(missing).toEqual([]);
  });

  it("TOOLING-CLEAN-INSTALL-001 runtime package imports are direct dependencies", () => {
    const sourceFiles = listSourceFiles(path.join(repoRoot, "src"));
    const missing = new Set<string>();

    for (const file of sourceFiles) {
      const importedPackages = runtimePackageImports(readFileSync(file, "utf8"));
      for (const packageName of importedPackages) {
        if (!runtimeDependencies[packageName]) {
          missing.add(`${path.relative(repoRoot, file)}: ${packageName}`);
        }
      }
    }

    expect([...missing].sort()).toEqual([]);
  });

  it("TOOLING-CLEAN-INSTALL-001 documents env values required by local tests", () => {
    const envSamplePath = path.join(repoRoot, ".env.sample");
    expect(existsSync(envSamplePath)).toBe(true);

    const envSample = readFileSync(envSamplePath, "utf8");
    const requiredKeys = [
      "NEXT_PUBLIC_API_URL",
      "NEXT_PUBLIC_SITE_URL",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "SUPABASE_STORAGE_BUCKET",
      "NEXT_PUBLIC_RECAPTCHA_SITE_KEY",
      "RECAPTCHA_SECRET_KEY",
      "OPENAI_API_KEY",
    ];

    const missing = requiredKeys.filter(
      (key) => !new RegExp(`^${key}=`, "m").test(envSample),
    );

    expect(missing).toEqual([]);
  });
});
