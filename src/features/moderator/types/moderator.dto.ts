import { z } from "zod";

export const MODERATION_JUSTIFICATION_MIN = 5;
export const MODERATION_JUSTIFICATION_MAX = 500;

export const MODERATION_ACTIONS = ["approve", "reject", "quarantine"] as const;

const ModerationReasonBaseSchema = z.object({
  action: z.enum(MODERATION_ACTIONS, {
    message: "moderation_action_invalid",
  }),
  justification: z.string().default(""),
  banAuthor: z.boolean().optional().default(false),
  categories: z.array(z.string()).optional().default([]),
});

function withJustificationValidation<T extends z.ZodObject<any>>(schema: T) {
  return schema.superRefine((data, ctx) => {
    if (data.action === "approve") return;

    const justification = data.justification.trim();

    if (justification.length < MODERATION_JUSTIFICATION_MIN) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["justification"],
        message: "justification_too_short",
      });
    }

    if (justification.length > MODERATION_JUSTIFICATION_MAX) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["justification"],
        message: "justification_too_long",
      });
    }
  });
}

export const ModerationReasonSchema = withJustificationValidation(
  ModerationReasonBaseSchema,
);

export const ReviewPostSchema = withJustificationValidation(
  ModerationReasonBaseSchema.extend({
    postId: z.string().uuid({ message: "post_id_required" }),
  }),
);

export const ReviewCommentSchema = withJustificationValidation(
  ModerationReasonBaseSchema.extend({
    commentId: z.string().uuid({ message: "comment_id_required" }),
  }),
);

export type ModerationReasonFormData = z.infer<typeof ModerationReasonSchema>;
export type ReviewPostRequestDto = z.infer<typeof ReviewPostSchema>;
export type ReviewCommentRequestDto = z.infer<typeof ReviewCommentSchema>;
