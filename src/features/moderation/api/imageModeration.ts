import "server-only";

import { createAppError } from "@/lib/AppError";
import OpenAI from "openai";

const openai = new OpenAI();

export type ImageModerationCategoryScores = Record<string, number>;

export type ImageModerationResult = {
  flagged: boolean;

  /**
   * Raw OpenAI categories where result.categories[category] === true.
   * Do not use this alone for product decisions.
   * Final interpretation happens in assessSafety.ts with categoryScores.
   */
  categories: string[];

  /**
   * OpenAI confidence scores, 0-1.
   * Higher number means higher confidence for a category.
   */
  categoryScores: ImageModerationCategoryScores;
};

async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = file.type || "image/jpeg";

  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

function extractViolatedCategories(categories: unknown): string[] {
  if (!categories || typeof categories !== "object") return [];

  return Object.entries(categories as Record<string, unknown>)
    .filter(([, isViolated]) => Boolean(isViolated))
    .map(([category]) => category);
}

function extractCategoryScores(scores: unknown): ImageModerationCategoryScores {
  if (!scores || typeof scores !== "object") return {};

  return Object.fromEntries(
    Object.entries(scores as Record<string, unknown>).map(
      ([category, score]) => [category, typeof score === "number" ? score : 0],
    ),
  );
}

export async function moderateImage(
  imageFile: File,
): Promise<ImageModerationResult> {
  try {
    const base64Image = await fileToBase64(imageFile);

    const response = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: [
        {
          type: "image_url",
          image_url: {
            url: base64Image,
          },
        },
      ],
    });

    const result = response.results[0];

    if (!result) {
      return {
        flagged: false,
        categories: [],
        categoryScores: {},
      };
    }

    return {
      flagged: result.flagged,
      categories: extractViolatedCategories(result.categories),
      categoryScores: extractCategoryScores(result.category_scores),
    };
  } catch (error) {
    throw createAppError({
      code: "EXTERNAL_SERVICE",
      message: `[imageModeration] OpenAI Error during moderateImage: ${String(
        error,
      )}`,
    });
  }
}
