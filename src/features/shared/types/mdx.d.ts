declare module "*.mdx" {
  import type { ReactNode } from "react";
  const component: (props: Record<string, unknown>) => ReactNode;
  export default component;
}
