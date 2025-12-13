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

  const PENDING_FLAGS = ["hate", "harassment"];

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
