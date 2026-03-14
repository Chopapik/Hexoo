import { hasFile } from "@/features/images/api/image.service";
import { moderateImage } from "@/features/moderation/api/imageModeration";
import { moderateText } from "@/features/moderation/api/textModeration";
import { createAppError } from "@/lib/AppError";
import { logModerationEvent } from "@/features/moderation/api/services/moderationLog.service";
import type { ModerationLogPayload } from "@/features/moderation/api/services/moderationLog.service";
import { ModerationStatus } from "@/features/shared/types/content.type";

/** Payload to log later with resourceType/resourceId (e.g. after post is created). */
export type ModerationLogPayloadForResource = Omit<
  ModerationLogPayload,
  "resourceType" | "resourceId"
>;

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
    "sexual", 
    "violence"
  ];

  const NSFW_FLAGS = ["sexual", "violence"];

  const isNSFW = categories.some((cat) => NSFW_FLAGS.includes(cat));

  // is illegal
  if (categories.some((cat) => REJECT_FLAGS.includes(cat))) {
    return { status: ModerationStatus.Rejected, isNSFW };
  }

  // should be checked by human
  if (categories.some((cat) => PENDING_FLAGS.includes(cat))) {
    return { status: ModerationStatus.Pending, isNSFW };
  }

  // clear
  return { status: ModerationStatus.Approved, isNSFW };
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
    verdict: ModerationStatus.Rejected,
    categories: flaggedReasons,
    actionTaken: "BLOCKED_CREATION",
    source: "ai",
    actorId: "system",
    reasonSummary: `AI moderation blocked content in ${contextLabel}`,
    reasonDetails: `Categories: ${flaggedReasons.join(", ")}`,
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
  flaggedReasons: string[];
  flaggedSource: ("text" | "image")[];
  isNSFW: boolean;
  isPending: boolean;
  /** When isPending: payload to log with resourceType "post" and resourceId after post is created/updated. */
  moderationLogPayloadForResource?: ModerationLogPayloadForResource;
}> => {
  const { flaggedReasons, flaggedSource } = await collectModerationFlags(
    text,
    imageFile,
  );

  let moderationStatus: ModerationStatus = ModerationStatus.Approved;
  let isNSFW = false;

  if (flaggedReasons.length > 0) {
    const moderationResult = getAiModerationVerdict(flaggedReasons);
    moderationStatus = moderationResult.status;
    isNSFW = moderationResult.isNSFW;
  }

  const moderationLogPayloadForResource: ModerationLogPayloadForResource | undefined =
    moderationStatus !== ModerationStatus.Approved
      ? {
          userId,
          timestamp: new Date(),
          verdict: moderationStatus,
          categories: flaggedReasons,
          actionTaken:
            moderationStatus === ModerationStatus.Rejected
              ? "BLOCKED_CREATION"
              : "FLAGGED_FOR_REVIEW",
          source: "ai",
          actorId: "system",
          reasonSummary: `AI moderation result: ${moderationStatus}`,
          reasonDetails: `Categories: ${flaggedReasons.join(", ")} (Sources: ${flaggedSource.join(", ")})`,
        }
      : undefined;

  if (moderationStatus === ModerationStatus.Rejected) {
    await logModerationEvent(moderationLogPayloadForResource!);
    throw createAppError({
      code: "POLICY_VIOLATION",
      message: "[postService] Post content violates service terms",
      data: { reasons: flaggedReasons },
    });
  }

  const isPending = moderationStatus === ModerationStatus.Pending;
  return {
    moderationStatus,
    flaggedReasons,
    flaggedSource,
    isNSFW,
    isPending,
    moderationLogPayloadForResource: isPending
      ? moderationLogPayloadForResource
      : undefined,
  };
};
