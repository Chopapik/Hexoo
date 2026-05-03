import { Loader } from "lucide-react";
import { cn } from "@/features/shared/utils/utils";

export type AppLoaderSize = "sm" | "md" | "lg";

const sizeClasses: Record<AppLoaderSize, string> = {
  sm: "size-3.5",
  md: "size-5",
  lg: "size-6",
};

type AppLoaderProps = {
  size?: AppLoaderSize;
  className?: string;
};

export function AppLoader({ size = "md", className }: AppLoaderProps) {
  return (
    <Loader
      aria-hidden
      className={cn("animate-spin shrink-0", sizeClasses[size], className)}
    />
  );
}
