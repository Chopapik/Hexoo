import { readdirSync, statSync } from "node:fs";
import path from "node:path";

type StorybookIrEntry = {
  file: string;
  componentName: string;
};

function listStoryFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      return listStoryFiles(fullPath);
    }

    return /\.(stories)\.(ts|tsx)$/.test(entry) ? [fullPath] : [];
  });
}

function componentNameFromStory(file: string): string {
  return path.basename(file).replace(/\.stories\.(ts|tsx)$/, "");
}

const root = process.cwd();
const srcDir = path.join(root, "src");
const stories: StorybookIrEntry[] = listStoryFiles(srcDir)
  .map((file) => ({
    file: path.relative(root, file),
    componentName: componentNameFromStory(file),
  }))
  .sort((a, b) => a.file.localeCompare(b.file));

process.stdout.write(
  `${JSON.stringify(
    {
      schemaVersion: 1,
      generatedAt: new Date(0).toISOString(),
      stories,
    },
    null,
    2,
  )}\n`,
);
