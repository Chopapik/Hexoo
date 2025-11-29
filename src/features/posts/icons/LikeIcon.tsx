type LikeIconProps = {
  isLikedByMe?: boolean;
  className?: string;
};

const COLOR_ACTIVE = "#DB2777";
const COLOR_INACTIVE = "var(--text-neutral, #737373)";

export const LikeIcon = ({ isLikedByMe = false, className }: LikeIconProps) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M8 15.3076L6.84 14.2286C2.72 10.4112 0 7.88527 0 4.80353C0 2.27764 1.936 0.307617 4.4 0.307617C5.792 0.307617 7.128 0.969742 8 2.00789C8.872 0.969742 10.208 0.307617 11.6 0.307617C14.064 0.307617 16 2.27764 16 4.80353C16 7.88527 13.28 10.4112 9.16 14.2286L8 15.3076Z"
        fill={isLikedByMe ? COLOR_ACTIVE : COLOR_INACTIVE}
      />
    </svg>
  );
};
