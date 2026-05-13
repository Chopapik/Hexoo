const YOUTUBE_PATTERN =
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?[^#\s]*[?&]v=|youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;

const YOUTUBE_REGEX_GLOBAL = new RegExp(YOUTUBE_PATTERN.source, "g");

export function extractYouTubeVideoIds(text: string): string[] {
  const ids: string[] = [];
  const matches = text.matchAll(YOUTUBE_REGEX_GLOBAL);
  for (const match of matches) {
    if (!ids.includes(match[1])) {
      ids.push(match[1]);
    }
  }
  return ids;
}

export function stripYouTubeUrls(text: string): string {
  return text
    .replace(YOUTUBE_REGEX_GLOBAL, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function isValidYouTubeUrl(url: string): boolean {
  return YOUTUBE_PATTERN.test(url.trim());
}
