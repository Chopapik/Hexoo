import { useI18n } from "@/i18n/useI18n";

type PostNsfwNoticeProps = {
  className?: string;
};

export const PostNsfwNotice = ({ className = "" }: PostNsfwNoticeProps) => {
  const { t } = useI18n();

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 transition-colors group w-full h-full ${className}`.trim()}
    >
      <div className="p-3  rounded-full bg-red-500/10 text-red-500 transition-colors">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
          <line x1="2" x2="22" y1="2" y2="22" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-red-500 font-bold text-sm uppercase tracking-wider mb-1">
          {t("post.nsfw.title")}
        </p>
        <p className="text-text-neutral text-xs">
          {t("post.nsfw.body")}
        </p>
      </div>
    </div>
  );
};
