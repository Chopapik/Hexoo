import type { ComponentProps } from "react";
import {
  Bell,
  Compass,
  House,
  Plus,
  Settings,
  Shield,
  User,
  type LucideIcon,
} from "lucide-react";

type IconProps = ComponentProps<"svg"> & {
  strokeWidth?: number;
  fill?: string;
};

function HexLucideIcon({
  className,
  strokeWidth = 1.5,
  fill = "none",
  icon: Icon,
  ...rest
}: IconProps & { icon: LucideIcon }) {
  const isActive = fill !== "none";

  return (
    <span className={`relative inline-flex items-center justify-center ${className ?? ""}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute inset-0 h-full w-full"
        {...rest}
      >
        <path
          d="M12 2.75 19.85 7.35v9.3L12 21.25 4.15 16.65v-9.3L12 2.75Z"
          fill={
            isActive
              ? "rgb(from var(--color-foreground-secondary-default) r g b / 0.22)"
              : "none"
          }
          stroke="none"
        />
        <path d="M12 2.75 19.85 7.35v9.3L12 21.25 4.15 16.65v-9.3L12 2.75Z" opacity="0.42" />
      </svg>
      <Icon
        className="absolute inset-[28.5%] h-[43%] w-[43%]"
        strokeWidth={strokeWidth}
        fill={fill}
      />
    </span>
  );
}

export function HexHomeIcon(props: IconProps) {
  return <HexLucideIcon icon={House} {...props} />;
}

export function HexExploreIcon(props: IconProps) {
  return <HexLucideIcon icon={Compass} {...props} />;
}

export function HexCreateIcon(props: IconProps) {
  return <HexLucideIcon icon={Plus} {...props} />;
}

export function HexActivityIcon(props: IconProps) {
  return <HexLucideIcon icon={Bell} {...props} />;
}

export function HexProfileIcon(props: IconProps) {
  return <HexLucideIcon icon={User} {...props} />;
}

export function HexSettingsIcon(props: IconProps) {
  return <HexLucideIcon icon={Settings} {...props} />;
}

export function HexAdminIcon(props: IconProps) {
  return <HexLucideIcon icon={Shield} {...props} />;
}
