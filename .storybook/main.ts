import type { StorybookConfig } from '@storybook/nextjs-vite';
import path from "node:path";
import type { Plugin } from "vite";

const nextImagePrefix = "virtual:next-image:";

const getNextSvgPath = (id: string) => {
  const prefixIndex = id.indexOf(nextImagePrefix);

  if (prefixIndex === -1) return null;

  const encodedPath = id.slice(prefixIndex + nextImagePrefix.length);
  const decodedPath = Buffer.from(encodedPath, "base64").toString("utf8");
  const svgIndex = decodedPath.indexOf(".svg");

  if (svgIndex === -1) return null;

  return decodedPath.slice(0, svgIndex + ".svg".length);
};

const createSvgImageModule = (src: string) =>
  `export default ${JSON.stringify({
    src,
    width: 40,
    height: 40,
    blurDataURL: src,
    blurWidth: 40,
    blurHeight: 40,
  })};`;

const svgUrlAssetPlugin = (): Plugin => ({
  name: "hexoo-svg-url-assets",
  enforce: "pre",
  resolveId(source, importer) {
    if (!source.endsWith(".svg?url")) return null;

    const assetPath = source.replace(/\?url$/, "");

    if (assetPath.startsWith("@/")) {
      return `\0hexoo-svg-url:${path.resolve(
        process.cwd(),
        "src",
        assetPath.slice(2),
      )}`;
    }

    if (assetPath.startsWith(".") && importer) {
      const importerPath = importer.replace(/\?.*$/, "");

      return `\0hexoo-svg-url:${path.resolve(
        path.dirname(importerPath),
        assetPath,
      )}`;
    }

    return null;
  },
  load(id) {
    const nextSvgPath = getNextSvgPath(id);

    if (nextSvgPath) {
      return createSvgImageModule(`/@fs/${nextSvgPath}`);
    }

    if (!id.startsWith("\0hexoo-svg-url:")) return null;

    return createSvgImageModule(`/@fs/${id.replace("\0hexoo-svg-url:", "")}`);
  },
});

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp"
  ],
  "framework": "@storybook/nextjs-vite",
  "staticDirs": [
    "../public"
  ],
  async viteFinal(config) {
    config.plugins = [svgUrlAssetPlugin(), ...(config.plugins ?? [])];

    return config;
  }
};
export default config;
