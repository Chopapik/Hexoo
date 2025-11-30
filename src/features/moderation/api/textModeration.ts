import OpenAI from "openai";

const openai = new OpenAI();

export type ModerationResult = {
  flagged: boolean;
  categories: string[]; // e.g. ["violence", "hate"]
};

export async function moderateText(text: string): Promise<ModerationResult> {
  if (!text || !text.trim()) return { flagged: false, categories: [] };

  try {
    const response = await openai.moderations.create({
      input: text,
      model: "omni-moderation-latest",
    });

    const result = response.results[0];

    const categories = Object.entries(result.categories)
      .filter(([_, isViolated]) => isViolated)
      .map(([category]) => category);

    return {
      flagged: result.flagged,
      categories: categories,
    };
  } catch (error) {
    console.error("OpenAI Error:", error);
    return { flagged: false, categories: [] };
  }
}
