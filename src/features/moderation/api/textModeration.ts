import "server-only";

import { createAppError } from "@/lib/AppError";
import OpenAI from "openai";

const openai = new OpenAI();

export type ModerationCategoryScores = Record<string, number>;

export type ModerationResult = {
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
  categoryScores: ModerationCategoryScores;
};

function extractViolatedCategories(categories: unknown): string[] {
  if (!categories || typeof categories !== "object") return [];

  return Object.entries(categories as Record<string, unknown>)
    .filter(([, isViolated]) => Boolean(isViolated))
    .map(([category]) => category);
}

function extractCategoryScores(scores: unknown): ModerationCategoryScores {
  if (!scores || typeof scores !== "object") return {};

  return Object.fromEntries(
    Object.entries(scores as Record<string, unknown>).map(
      ([category, score]) => [category, typeof score === "number" ? score : 0],
    ),
  );
}

export async function moderateText(text: string): Promise<ModerationResult> {
  if (!text || !text.trim()) {
    return {
      flagged: false,
      categories: [],
      categoryScores: {},
    };
  }

  try {
    const response = await openai.moderations.create({
      input: text,
      model: "omni-moderation-latest",
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
      message: `[textModeration] OpenAI Error during moderateText: ${String(
        error,
      )}`,
    });
  }
}
