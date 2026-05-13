"use client";

type PostYouTubeEmbedProps = {
  videoId: string;
};

export function PostYouTubeEmbed({ videoId }: PostYouTubeEmbedProps) {
  return (
    <div
      className="w-full overflow-hidden rounded-xl border border-primary-neutral-stroke-default/60"
      style={{ aspectRatio: "16 / 9" }}
      onClick={(e) => e.stopPropagation()}
    >
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        className="w-full h-full"
      />
    </div>
  );
}
