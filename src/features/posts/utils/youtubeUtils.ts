const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;
const YOUTUBE_TEXT_CANDIDATE =
  /(^|[^\w./:?=&%-])((?:https?:\/\/)?(?:www\.)?(?:(?:youtube\.com\/watch\?[^\s<>"'`),.!;:]+)|(?:youtube\.com\/(?:shorts|embed)\/[a-zA-Z0-9_-]{11})|(?:youtu\.be\/[a-zA-Z0-9_-]{11})))(?=$|[\s),.!;:])/g;

function toUrl(value: string): URL | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const urlText = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(urlText);
  } catch {
    return null;
  }
}

function getYouTubeVideoId(value: string): string | null {
  const url = toUrl(value);
  if (!url) return null;

  const host = url.hostname.toLowerCase();

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return VIDEO_ID_PATTERN.test(id) ? id : null;
  }

  if (host !== "youtube.com" && host !== "www.youtube.com") {
    return null;
  }

  if (url.pathname === "/watch") {
    const id = url.searchParams.get("v");
    return id && VIDEO_ID_PATTERN.test(id) ? id : null;
  }

  const pathParts = url.pathname.split("/").filter(Boolean);
  if (
    pathParts.length === 2 &&
    (pathParts[0] === "shorts" || pathParts[0] === "embed") &&
    VIDEO_ID_PATTERN.test(pathParts[1])
  ) {
    return pathParts[1];
  }

  return null;
}

export function extractYouTubeVideoIds(text: string): string[] {
  const ids: string[] = [];
  const matches = text.matchAll(YOUTUBE_TEXT_CANDIDATE);
  for (const match of matches) {
    const id = getYouTubeVideoId(match[2]);
    if (id && !ids.includes(id)) {
      ids.push(id);
    }
  }
  return ids;
}

export function stripYouTubeUrls(text: string): string {
  return text
    .replace(YOUTUBE_TEXT_CANDIDATE, (_match, prefix: string, candidate: string) =>
      getYouTubeVideoId(candidate) ? prefix : `${prefix}${candidate}`,
    )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function isValidYouTubeUrl(url: string): boolean {
  return getYouTubeVideoId(url) !== null;
}
