import { hasFile } from "@/features/images/api/imageService";
import { moderateImage } from "@/features/moderation/api/imageModeration";
import { moderateText } from "@/features/moderation/api/textModeration";
import { createAppError } from "@/lib/AppError";
import { logModerationEvent } from "@/features/moderation/api/moderationLogService";
import { ModerationStatus } from "@/features/shared/types/content.type";

export interface ModerationVerdict {
  status: ModerationStatus;
  isNSFW: boolean;
}

type ModerationFlags = {
  flaggedReasons: string[];
  flaggedSource: ("text" | "image")[];
};

const collectModerationFlags = async (
  text?: string,
  imageFile?: File | null,
): Promise<ModerationFlags> => {
  const flaggedReasons: string[] = [];
  const flaggedSource: ("text" | "image")[] = [];

  if (text && text.trim()) {
    const textResult = await moderateText(text);
    if (textResult.flagged) {
      flaggedReasons.push(...textResult.categories);
      flaggedSource.push("text");
    }
  }

  if (hasFile(imageFile) && imageFile instanceof File) {
    const imageResult = await moderateImage(imageFile);
    if (imageResult.flagged) {
      const uniqueCategories = imageResult.categories.filter(
        (c) => !flaggedReasons.includes(c),
      );
      flaggedReasons.push(...uniqueCategories);
      flaggedSource.push("image");
    }
  }

  return { flaggedReasons, flaggedSource };
};

export const getAiModerationVerdict = (
  categories: string[],
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
    return { status: ModerationStatus.Rejected, isNSFW: isNSFW };
  }

  // should be checked by human
  if (categories.some((cat) => PENDING_FLAGS.includes(cat))) {
    return { status: ModerationStatus.Pending, isNSFW: isNSFW };
  }

  // is +18
  if (categories.some((cat) => NSFW_FLAGS.includes(cat))) {
    return { status: ModerationStatus.Approved, isNSFW: isNSFW };
  }

  // clear
  return { status: ModerationStatus.Approved, isNSFW: isNSFW };
};

export const enforceStrictModeration = async (
  userId: string,
  text?: string,
  imageFile?: File | null,
  contextLabel: string = "content",
): Promise<ModerationFlags> => {
  const { flaggedReasons, flaggedSource } = await collectModerationFlags(
    text,
    imageFile,
  );

  if (flaggedReasons.length === 0) {
    return { flaggedReasons, flaggedSource };
  }

  await logModerationEvent({
    userId: userId,
    timestamp: new Date(),
    verdict: "REJECTED",
    categories: flaggedReasons,
    actionTaken: "BLOCKED_CREATION",
  });

  throw createAppError({
    code: "POLICY_VIOLATION",
    message: `[${contextLabel}] Content violates service terms`,
    data: { reasons: flaggedReasons, source: flaggedSource },
  });
};

export const performModeration = async (
  userId: string,
  text?: string,
  imageFile?: File | null,
): Promise<{
  moderationStatus: ModerationStatus;
  isNSFW: boolean;
  flaggedReasons: string[];
  flaggedSource: ("text" | "image")[];
}> => {
  const { flaggedReasons, flaggedSource } = await collectModerationFlags(
    text,
    imageFile,
  );

  let moderationStatus: ModerationStatus = ModerationStatus.Approved;
  let isNSFW = false;

  if (flaggedReasons.length > 0) {
    const moderationResult = getAiModerationVerdict(flaggedReasons);
    isNSFW = moderationResult.isNSFW;
    moderationStatus = moderationResult.status;
  }

  if (moderationStatus !== ModerationStatus.Approved) {
    const verdictUpper = moderationStatus.toUpperCase() as
      | "PENDING"
      | "REJECTED";

    const actionTaken =
      moderationStatus === ModerationStatus.Rejected
        ? "BLOCKED_CREATION"
        : "FLAGGED_FOR_REVIEW";

    await logModerationEvent({
      userId: userId,
      timestamp: new Date(),
      verdict: verdictUpper,
      categories: flaggedReasons,
      actionTaken: actionTaken,
    });
  }

  if (moderationStatus === ModerationStatus.Rejected) {
    throw createAppError({
      code: "POLICY_VIOLATION",
      message: "[postService] Post content violates service terms",
      data: { reasons: flaggedReasons },
    });
  }

  return { moderationStatus, isNSFW, flaggedReasons, flaggedSource };
};
