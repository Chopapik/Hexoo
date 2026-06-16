import type { ComponentProps } from "react";
import {
  Bell,
  Compass,
  Plus,
  Shield,
  type LucideIcon,
} from "lucide-react";

type IconProps = ComponentProps<"svg"> & {
  strokeWidth?: number;
  fill?: string;
};

function FigmaNavIcon({
  className,
  strokeWidth = 2,
  path,
  viewBox,
  ...rest
}: IconProps & {
  path: string;
  viewBox: string;
}) {
  return (
    <svg
      className={className}
      viewBox={viewBox}
      fill="none"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...rest}
    >
      <path
        d={path}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavLucideIcon({
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

export function HomeIcon(props: IconProps) {
  return (
    <FigmaNavIcon
      viewBox="-2 -1.5 24 24"
      path="M13 20.0005V12.0005C13 11.7353 12.8946 11.4809 12.7071 11.2934C12.5196 11.1058 12.2652 11.0005 12 11.0005H8C7.73478 11.0005 7.48043 11.1058 7.29289 11.2934C7.10536 11.4809 7 11.7353 7 12.0005V20.0005M1 9.00048C0.99993 8.70955 1.06333 8.4221 1.18579 8.1582C1.30824 7.89429 1.4868 7.66028 1.709 7.47248L8.709 1.47248C9.06999 1.16739 9.52736 1 10 1C10.4726 1 10.93 1.16739 11.291 1.47248L18.291 7.47248C18.5132 7.66028 18.6918 7.89429 18.8142 8.1582C18.9367 8.4221 19.0001 8.70955 19 9.00048V18.0005C19 18.5309 18.7893 19.0396 18.4142 19.4147C18.0391 19.7898 17.5304 20.0005 17 20.0005H3C2.46957 20.0005 1.96086 19.7898 1.58579 19.4147C1.21071 19.0396 1 18.5309 1 18.0005V9.00048Z"
      {...props}
    />
  );
}

export function ExploreIcon(props: IconProps) {
  return <NavLucideIcon icon={Compass} {...props} />;
}

export function CreateIcon(props: IconProps) {
  return <NavLucideIcon icon={Plus} {...props} />;
}

export function ActivityIcon(props: IconProps) {
  return <NavLucideIcon icon={Bell} {...props} />;
}

export function ProfileIcon(props: IconProps) {
  return (
    <FigmaNavIcon
      viewBox="-3 -2 24 24"
      path="M9 11C11.7614 11 14 8.76142 14 6C14 3.23858 11.7614 1 9 1C6.23858 1 4 3.23858 4 6C4 8.76142 6.23858 11 9 11ZM9 11C11.1217 11 13.1566 11.8429 14.6569 13.3431C16.1571 14.8434 17 16.8783 17 19M9 11C6.87827 11 4.84344 11.8429 3.34315 13.3431C1.84285 14.8434 1 16.8783 1 19"
      {...props}
    />
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <FigmaNavIcon
      viewBox="-1 -1 24 24"
      path="M10 9.27L6 2.34M10 12.73L6 19.66M11 21V19M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3M11 19C6.58172 19 3 15.4183 3 11M11 1V3M11 3C6.58172 3 3 6.58172 3 11M13 11H21M13 11C13 12.1046 12.1046 13 11 13C9.89543 13 9 12.1046 9 11C9 9.89543 9.89543 9 11 9C12.1046 9 13 9.89543 13 11ZM16 19.66L15 17.93M16 2.34L15 4.07M1 11H3M19.66 16L17.93 15M19.66 6L17.93 7M2.34 16L4.07 15M2.34 6L4.07 7"
      {...props}
    />
  );
}

export function MessagesIcon(props: IconProps) {
  return (
    <FigmaNavIcon
      viewBox="-1 -1 24 24"
      path="M2.08569 16.5087C2.17147 16.119 2.13873 15.7126 1.99169 15.3417C0.968461 13.2186 0.727947 10.8024 1.31259 8.51933C1.89722 6.23624 3.26944 4.23299 5.18713 2.86303C7.10483 1.49308 9.44475 0.84445 11.7941 1.03159C14.1434 1.21873 16.3511 2.22962 18.0278 3.88589C19.7044 5.54216 20.7422 7.73739 20.958 10.0842C21.1738 12.4311 20.5538 14.7788 19.2074 16.7131C17.861 18.6473 15.8746 20.0439 13.5988 20.6564C11.3231 21.2689 8.90408 21.0579 6.76869 20.0607C6.41822 19.9276 6.03741 19.8958 5.66969 19.9687L2.25669 20.9667C2.09205 21.0104 1.91898 21.0113 1.75389 20.9693C1.5888 20.9274 1.43716 20.844 1.31336 20.727C1.18955 20.61 1.09769 20.4633 1.04647 20.3008C0.995249 20.1384 0.986376 19.9655 1.02069 19.7987L2.08569 16.5087Z"
      {...props}
    />
  );
}

export function AdminIcon(props: IconProps) {
  return <NavLucideIcon icon={Shield} {...props} />;
}
