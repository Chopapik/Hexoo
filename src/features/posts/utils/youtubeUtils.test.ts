import { describe, expect, it } from "vitest";
import {
  extractYouTubeVideoIds,
  isValidYouTubeUrl,
  stripYouTubeUrls,
} from "./youtubeUtils";

const videoId = "dQw4w9WgXcQ";

describe("youtubeUtils", () => {
  describe("isValidYouTubeUrl", () => {
    it.each([
      ["standard watch URL", `https://www.youtube.com/watch?v=${videoId}`],
      ["watch URL with additional query params", `https://www.youtube.com/watch?feature=share&v=${videoId}`],
      ["short URL", `https://youtu.be/${videoId}`],
      ["shorts URL", `https://youtube.com/shorts/${videoId}`],
      ["embed URL", `https://www.youtube.com/embed/${videoId}`],
      ["protocol-less watch URL", `youtube.com/watch?v=${videoId}`],
    ])("accepts %s", (_caseName, url) => {
      expect(isValidYouTubeUrl(url)).toBe(true);
    });

    it.each([
      ["non-YouTube URL", "https://example.com/watch?v=dQw4w9WgXcQ"],
      ["random text", "this is not a video URL"],
      [
        "YouTube URL embedded inside another URL",
        `https://example.com/redirect?next=https://www.youtube.com/watch?v=${videoId}`,
      ],
      ["spoofed hostname", `https://youtube.com.evil.example/watch?v=${videoId}`],
      ["prefixed hostname", `https://notyoutube.com/watch?v=${videoId}`],
      ["overlong video ID", `https://www.youtube.com/watch?v=${videoId}X`],
    ])("rejects %s", (_caseName, value) => {
      expect(isValidYouTubeUrl(value)).toBe(false);
    });
  });

  describe("extractYouTubeVideoIds", () => {
    it("extracts unique video IDs from mixed text", () => {
      const result = extractYouTubeVideoIds(`
        First: https://www.youtube.com/watch?v=dQw4w9WgXcQ
        Ignore this: https://example.com/watch?v=aaaaaaaaaaa
        Second: https://youtu.be/abcdefghijk
        Third: https://youtube.com/shorts/9bZkp7q19f0
        Fourth: https://www.youtube.com/embed/3JZ_D3ELwOQ
      `);

      expect(result).toEqual([
        "dQw4w9WgXcQ",
        "abcdefghijk",
        "9bZkp7q19f0",
        "3JZ_D3ELwOQ",
      ]);
    });

    it("ignores duplicate YouTube video IDs", () => {
      const result = extractYouTubeVideoIds(`
        https://www.youtube.com/watch?v=${videoId}
        https://youtu.be/${videoId}
        https://www.youtube.com/embed/${videoId}
      `);

      expect(result).toEqual([videoId]);
    });

    it("returns an empty array when text has no YouTube URLs", () => {
      expect(extractYouTubeVideoIds("plain text and https://example.com")).toEqual(
        [],
      );
    });
  });

  describe("stripYouTubeUrls", () => {
    it("strips YouTube URLs from text", () => {
      const result = stripYouTubeUrls(
        `Watch this https://www.youtube.com/watch?v=${videoId} today`,
      );

      expect(result).toBe("Watch this  today");
    });

    it("collapses excessive blank lines after stripping URLs", () => {
      const result = stripYouTubeUrls(`Line one
https://youtu.be/${videoId}


Line two`);

      expect(result).toBe(`Line one

Line two`);
    });

    it("trims whitespace after stripping URLs", () => {
      const result = stripYouTubeUrls(`
        https://youtube.com/shorts/${videoId}
      `);

      expect(result).toBe("");
    });

    it("keeps non-YouTube text unchanged where appropriate", () => {
      const text = "Read https://example.com/watch?v=dQw4w9WgXcQ instead";

      expect(stripYouTubeUrls(text)).toBe(text);
    });

    it("preserves text around punctuation-adjacent YouTube URLs", () => {
      const result = stripYouTubeUrls(
        `Watch this: https://youtu.be/${videoId}, then reply.`,
      );

      expect(result).toBe("Watch this: , then reply.");
    });
  });
});
