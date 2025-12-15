import { createAppError } from "@/lib/AppError";
import OpenAI from "openai";

const openai = new OpenAI();

export type ImageModerationResult = {
  flagged: boolean;
  categories: string[]; // etc ["violence", "sexual"]
};

async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

export async function moderateImage(
  imageFile: File
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

    const categories = Object.entries(result.categories)
      .filter(([_, isViolated]) => isViolated)
      .map(([category]) => category);

    return {
      flagged: result.flagged,
      categories: categories,
    };
  } catch (error) {
    throw createAppError({
      code: "EXTERNAL_SERVICE",
      message: `[imageModeration] OpenAI Error during moderateImage: ${error}`,
    });
  }
}
