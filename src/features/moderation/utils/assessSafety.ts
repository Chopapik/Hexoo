import { hasFile } from "@/features/images/api/image.service";
import { moderateImage } from "@/features/moderation/api/imageModeration";
import { moderateText } from "@/features/moderation/api/textModeration";
import { createAppError } from "@/lib/AppError";
import { logModerationEvent } from "@/features/moderation/api/services/moderationLog.service";
import type { ModerationLogPayload } from "@/features/moderation/api/services/moderationLog.service";
import { ModerationStatus } from "@/features/shared/types/content.type";

/**
 * Payload to log later with resourceType/resourceId, e.g. after post is created.
 */
export type ModerationLogPayloadForResource = Omit<
  ModerationLogPayload,
  "resourceType" | "resourceId"
>;

export interface ModerationVerdict {
  status: ModerationStatus;
  isNSFW: boolean;
}

type ModerationSource = "text" | "image";
type ModerationCategoryScoreMap = Record<string, number>;

type ModerationFlags = {
  flaggedReasons: string[];
  flaggedSource: ModerationSource[];
  flaggedScores: ModerationCategoryScoreMap;
};

type ModerationSignal = {
  flagged: boolean;
  categories: string[];
  categoryScores: ModerationCategoryScoreMap;
};

/**
 * Product-level thresholds.
 *
 * OpenAI gives us category booleans and category scores.
 * We intentionally do NOT treat every boolean flag as final truth.
 *
 * Adjust these numbers based on real false positives / false negatives.
 *
 * Lower number = more aggressive moderation.
 * Higher number = less aggressive moderation.
 *
 * Examples:
 * - "violence" is high to avoid false positives like Polish "masakra".
 * - "violence/graphic" is lower because graphic violence should be caught earlier.
 * - "sexual/minors" is extremely low because any signal should be treated seriously.
 */
export const MODERATION_CATEGORY_THRESHOLDS: Record<string, number> = {
  sexual: 0.55,
  "sexual/minors": 0.01,

  "self-harm": 0.75,
  "self-harm/intent": 0.45,
  "self-harm/instructions": 0.35,

  violence: 0.9,
  "violence/graphic": 0.45,

  hate: 0.75,
  "hate/threatening": 0.45,

  harassment: 0.78,
  "harassment/threatening": 0.55,

  illicit: 0.82,
  "illicit/violent": 0.6,
};

/**
 * Used for unknown/future OpenAI categories.
 * Keep it fairly high to avoid accidental over-moderation.
 */
const DEFAULT_CATEGORY_THRESHOLD = 0.8;

function getCategoryThreshold(category: string): number {
  return MODERATION_CATEGORY_THRESHOLDS[category] ?? DEFAULT_CATEGORY_THRESHOLD;
}

function getCategoryScore(
  category: string,
  scores: ModerationCategoryScoreMap,
): number {
  return scores[category] ?? 0;
}

function isCategorySignificant(
  category: string,
  scores: ModerationCategoryScoreMap,
): boolean {
  const score = getCategoryScore(category, scores);
  const threshold = getCategoryThreshold(category);

  return score >= threshold;
}

/**
 * Builds final category list using scores.
 *
 * Important:
 * - We start from both raw category booleans and score keys.
 * - A raw OpenAI category boolean is NOT enough by itself.
 * - The category must pass our product threshold.
 */
function getSignificantCategories(signal: ModerationSignal): string[] {
  const candidates = new Set<string>([
    ...signal.categories,
    ...Object.keys(signal.categoryScores),
  ]);

  return [...candidates]
    .filter((category) =>
      isCategorySignificant(category, signal.categoryScores),
    )
    .sort((a, b) => {
      const scoreA = getCategoryScore(a, signal.categoryScores);
      const scoreB = getCategoryScore(b, signal.categoryScores);

      return scoreB - scoreA;
    });
}

function addModerationSignal(
  source: ModerationSource,
  signal: ModerationSignal,
  flags: ModerationFlags,
): void {
  const significantCategories = getSignificantCategories(signal);

  if (significantCategories.length === 0) return;

  if (!flags.flaggedSource.includes(source)) {
    flags.flaggedSource.push(source);
  }

  for (const category of significantCategories) {
    const score = getCategoryScore(category, signal.categoryScores);

    if (!flags.flaggedReasons.includes(category)) {
      flags.flaggedReasons.push(category);
    }

    flags.flaggedScores[category] = Math.max(
      flags.flaggedScores[category] ?? 0,
      score,
    );
  }
}

function formatScoreDetails(scores: ModerationCategoryScoreMap): string {
  const entries = Object.entries(scores);

  if (entries.length === 0) return "none";

  return entries
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .map(([category, score]) => `${category}: ${score.toFixed(3)}`)
    .join(", ");
}

const collectModerationFlags = async (
  text?: string,
  imageFile?: File | null,
): Promise<ModerationFlags> => {
  const flags: ModerationFlags = {
    flaggedReasons: [],
    flaggedSource: [],
    flaggedScores: {},
  };

  if (text && text.trim()) {
    const textResult = await moderateText(text);
    addModerationSignal("text", textResult, flags);
  }

  if (hasFile(imageFile)) {
    const imageResult = await moderateImage(imageFile);
    addModerationSignal("image", imageResult, flags);
  }

  return flags;
};

export const getAiModerationVerdict = (
  categories: string[],
): ModerationVerdict => {
  /**
   * These categories should block immediately.
   */
  const REJECT_FLAGS = [
    "sexual/minors",
    "self-harm/intent",
    "self-harm/instructions",
    "violence/graphic",
    "hate/threatening",
    "illicit/violent",
  ];

  /**
   * These categories should go to human review / pending.
   *
   * Plain "violence" is NOT NSFW.
   * It can be pending only if it passed the high score threshold above.
   */
  const PENDING_FLAGS = [
    "self-harm",
    "violence",
    "hate",
    "harassment",
    "harassment/threatening",
    "illicit",
  ];

  /**
   * NSFW means sexual content for product/UI purposes.
   * Violence is intentionally not NSFW.
   */
  const NSFW_FLAGS = ["sexual", "sexual/minors"];

  const isNSFW = categories.some((category) => NSFW_FLAGS.includes(category));

  if (categories.some((category) => REJECT_FLAGS.includes(category))) {
    return {
      status: ModerationStatus.Rejected,
      isNSFW,
    };
  }

  if (categories.some((category) => PENDING_FLAGS.includes(category))) {
    return {
      status: ModerationStatus.Pending,
      isNSFW,
    };
  }

  if (isNSFW) {
    return {
      status: ModerationStatus.Approved,
      isNSFW,
    };
  }

  return {
    status: ModerationStatus.Approved,
    isNSFW: false,
  };
};

export const enforceStrictModeration = async (
  userId: string,
  text?: string,
  imageFile?: File | null,
  contextLabel: string = "content",
): Promise<{ flaggedReasons: string[]; flaggedSource: ModerationSource[] }> => {
  const { flaggedReasons, flaggedSource, flaggedScores } =
    await collectModerationFlags(text, imageFile);

  if (flaggedReasons.length === 0) {
    return {
      flaggedReasons,
      flaggedSource,
    };
  }

  const verdict = getAiModerationVerdict(flaggedReasons);

  /**
   * Strict moderation should block only categories that are actually rejected.
   * If something is only pending/NSFW, it should not be blocked here.
   */
  if (verdict.status !== ModerationStatus.Rejected) {
    return {
      flaggedReasons,
      flaggedSource,
    };
  }

  await logModerationEvent({
    userId,
    timestamp: new Date(),
    verdict: ModerationStatus.Rejected,
    categories: flaggedReasons,
    actionTaken: "BLOCKED_CREATION",
    source: "ai",
    actorId: "system",
    reasonSummary: `AI moderation blocked content in ${contextLabel}`,
    reasonDetails: `Categories: ${flaggedReasons.join(
      ", ",
    )}. Scores: ${formatScoreDetails(flaggedScores)}`,
  });

  throw createAppError({
    code: "POLICY_VIOLATION",
    message: `[${contextLabel}] Content violates service terms`,
    data: {
      reasons: flaggedReasons,
      source: flaggedSource,
      scores: flaggedScores,
    },
  });
};

export const performModeration = async (
  userId: string,
  text?: string,
  imageFile?: File | null,
): Promise<{
  moderationStatus: ModerationStatus;
  flaggedReasons: string[];
  flaggedSource: ModerationSource[];
  isNSFW: boolean;
  isPending: boolean;

  /**
   * When isPending: payload to log with resourceType "post" and resourceId
   * after post is created/updated.
   */
  moderationLogPayloadForResource?: ModerationLogPayloadForResource;
}> => {
  const { flaggedReasons, flaggedSource, flaggedScores } =
    await collectModerationFlags(text, imageFile);

  let moderationStatus: ModerationStatus = ModerationStatus.Approved;
  let isNSFW = false;

  if (flaggedReasons.length > 0) {
    const moderationResult = getAiModerationVerdict(flaggedReasons);

    moderationStatus = moderationResult.status;
    isNSFW = moderationResult.isNSFW;
  }

  const moderationLogPayloadForResource:
    | ModerationLogPayloadForResource
    | undefined =
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
          reasonDetails: `Categories: ${flaggedReasons.join(
            ", ",
          )}. Sources: ${flaggedSource.join(
            ", ",
          )}. Scores: ${formatScoreDetails(flaggedScores)}`,
        }
      : undefined;

  if (moderationStatus === ModerationStatus.Rejected) {
    await logModerationEvent(moderationLogPayloadForResource!);

    throw createAppError({
      code: "POLICY_VIOLATION",
      message: "[postService] Post content violates service terms",
      data: {
        reasons: flaggedReasons,
        source: flaggedSource,
        scores: flaggedScores,
      },
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
