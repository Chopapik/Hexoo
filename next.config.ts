import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : null;
const supabaseProtocol = supabaseUrl
  ? (new URL(supabaseUrl).protocol.replace(":", "") as "http" | "https")
  : "https";
const supabasePort = supabaseUrl ? new URL(supabaseUrl).port : "";

const nextConfig: NextConfig = {
  images: {
    unoptimized: process.env.NODE_ENV !== "production",
    // TODO: images optimization,
    domains: supabaseHost ? [supabaseHost, "localhost"] : ["localhost"],
    remotePatterns: supabaseHost
      ? [
          {
            protocol: supabaseProtocol,
            hostname: supabaseHost,
            port: supabasePort || undefined,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  trailingSlash: false,
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({});
export default withMDX(nextConfig);
