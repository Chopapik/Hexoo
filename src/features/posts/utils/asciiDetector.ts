/**
 * Checks if the text is probably ASCII art.
 * The algorithm uses the density of "drawing" characters
 * and the structure of the lines.
 */
export function isAsciiArt(text: string): boolean {
  if (!text || text.length < 10) return false;

  const lines = text.split("\n");

  // ASCII art usually has more than one line
  if (lines.length < 3) return false;

  // Characters common in ASCII art (we skip dots and commas because they appear in normal text)
  const artChars = /[\\\/|_\-+=#*^@~`]/g;

  const matches = text.match(artChars);
  const artCharCount = matches ? matches.length : 0;

  // Ratio of "art" characters to the text length
  const density = artCharCount / text.length;

  // Rule 1: High density of special characters (> 15%)
  if (density > 0.15) return true;

  // Rule 2: We check "steps" and formatting
  // Count lines that start with spaces (indent) or art characters
  let formattedLines = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length === 0) continue;

    // If the line starts with spaces (keeps the shape)
    if (line.startsWith("  ")) {
      formattedLines++;
      continue;
    }

    // If the line contains sequences like "___", "---", "||"
    if (/_{3,}|-{3,}|\|{2,}|={3,}/.test(line)) {
      formattedLines++;
    }
  }

  // If more than 40% of non‑empty lines look formatted
  const nonEmptyLines = lines.filter((l) => l.trim().length > 0).length;
  if (nonEmptyLines > 0 && formattedLines / nonEmptyLines > 0.4) {
    return true;
  }

  return false;
}
