import { hasFile } from "@/features/images/api/imageService";
import { moderateImage } from "@/features/moderation/api/imageModeration";
import { moderateText } from "@/features/moderation/api/textModeration";
import { createAppError } from "@/lib/ApiError";
import { logModerationEvent } from "@/features/moderator/api/moderationLogService";

export type ModerationStatus = "approved" | "pending" | "rejected";

export interface ModerationVerdict {
  status: ModerationStatus;
  isNSFW: boolean;
}

export const getAiModerationVerdict = (
  categories: string[]
): ModerationVerdict => {
  const REJECT_FLAGS = [
    "sexual/minors",
    "self-harm",
    "self-harm/intent",
    "self-harm/instructions",
    "violence/graphic",
    "hate/threatening",
  ];

  const PENDING_FLAGS = [
    "hate",
    "harassment",
    "harassment/threatening",
    "illicit",
    "illicit/violent",
  ];

  const NSFW_FLAGS = ["sexual", "violence"];

  const isNSFW = categories.some((cat) => NSFW_FLAGS.includes(cat));

  // is illegal
  if (categories.some((cat) => REJECT_FLAGS.includes(cat))) {
    return { status: "rejected", isNSFW: isNSFW };
  }

  // should be checked by human
  if (categories.some((cat) => PENDING_FLAGS.includes(cat))) {
    return { status: "pending", isNSFW: isNSFW };
  }

  // is +18
  if (categories.some((cat) => NSFW_FLAGS.includes(cat))) {
    return { status: "approved", isNSFW: isNSFW };
  }

  // clear
  return { status: "approved", isNSFW: isNSFW };
};

export const performModeration = async (
  userId: string,
  text?: string,
  imageFile?: File | null
): Promise<{
  moderationStatus: ModerationStatus;
  isNSFW: boolean;
  flaggedReasons: string[];
  flaggedSource: string[];
}> => {
  let flaggedReasons: string[] = [];
  let flaggedSource: string[] = [];

  // 1. Text AI Moderation
  if (text && text.trim()) {
    const textResult = await moderateText(text);
    if (textResult.flagged) {
      flaggedReasons.push(...textResult.categories);
      flaggedSource.push("text");
    }
  }

  // 2. Image AI Moderation
  if (hasFile(imageFile) && imageFile instanceof File) {
    const imageResult = await moderateImage(imageFile);
    if (imageResult.flagged) {
      const uniqueCategories = imageResult.categories.filter(
        (c) => !flaggedReasons.includes(c)
      );
      flaggedReasons.push(...uniqueCategories);
      flaggedSource.push("image");
    }
  }

  // 3. Verdict
  let moderationStatus: ModerationStatus = "approved";
  let isNSFW = false;

  if (flaggedReasons.length > 0) {
    const moderationResult = getAiModerationVerdict(flaggedReasons);
    isNSFW = moderationResult.isNSFW;
    moderationStatus = moderationResult.status;
  }

  // 4. Logging
  if (moderationStatus !== "approved") {
    const verdictUpper = moderationStatus.toUpperCase() as
      | "PENDING"
      | "REJECTED";

    const actionTaken =
      moderationStatus === "rejected"
        ? "BLOCKED_CREATION"
        : "FLAGGED_FOR_REVIEW";

    await logModerationEvent({
      userId: userId,
      timestamp: new Date().toISOString(),
      verdict: verdictUpper,
      categories: flaggedReasons,
      actionTaken: actionTaken,
    });
  }

  if (moderationStatus === "rejected") {
    throw createAppError({
      code: "POLICY_VIOLATION",
      message: "[postService] Post content violates service terms",
      data: { reasons: flaggedReasons },
    });
  }

  return { moderationStatus, isNSFW, flaggedReasons, flaggedSource };
};
