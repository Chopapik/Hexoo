"use client";

import Modal from "@/features/shared/components/layout/Modal";
import ModalFooter from "@/features/shared/components/layout/ModalFooter";
import { BsShieldExclamation, BsTrash } from "react-icons/bs";
import useModerationReasonForm from "@/features/moderator/hooks/useModerationReasonForm";
import {
  MODERATION_JUSTIFICATION_MAX,
  ModerationReasonFormData,
} from "@/features/moderator/types/moderator.dto";
import { parseModerationReasonError } from "@/features/moderator/utils/moderationReasonErrorMap";
import { useI18n, type TranslationKey } from "@/i18n/useI18n";

type ModerationAction = "quarantine" | "reject" | "reject-ban";

interface ModerationReasonModalProps {
  isOpen: boolean;
  action: ModerationAction;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (justification: string) => void;
  /** Default copy is for posts; use `"comment"` for the comment queue. */
  resource?: "post" | "comment";
}

const ACTION_CONFIG: Record<
  ModerationAction,
  {
    titleKey: Record<"post" | "comment", TranslationKey>;
    confirmTextKey: Record<"post" | "comment", TranslationKey>;
    descriptionKey: Record<"post" | "comment", TranslationKey>;
    icon: React.ReactNode;
    color: string;
  }
> = {
  quarantine: {
    titleKey: {
      post: "moderation.quarantinePost",
      comment: "moderation.quarantineComment",
    },
    confirmTextKey: {
      post: "moderation.quarantine",
      comment: "moderation.quarantine",
    },
    descriptionKey: {
      post: "moderation.quarantinePostDescription",
      comment: "moderation.quarantineCommentDescription",
    },
    icon: <BsShieldExclamation className="w-5 h-5" />,
    color: "yellow",
  },
  reject: {
    titleKey: { post: "moderation.deletePost", comment: "moderation.deleteComment" },
    confirmTextKey: { post: "moderation.deletePost", comment: "moderation.deleteComment" },
    descriptionKey: {
      post: "moderation.deletePostDescription",
      comment: "moderation.deleteCommentDescription",
    },
    icon: <BsTrash className="w-5 h-5" />,
    color: "red",
  },
  "reject-ban": {
    titleKey: {
      post: "moderation.deleteBanPost",
      comment: "moderation.deleteBanComment",
    },
    confirmTextKey: {
      post: "moderation.deleteAndBan",
      comment: "moderation.deleteAndBan",
    },
    descriptionKey: {
      post: "moderation.deleteBanPostDescription",
      comment: "moderation.deleteBanCommentDescription",
    },
    icon: <BsTrash className="w-5 h-5" />,
    color: "red",
  },
};

const PRESET_REASONS: TranslationKey[] = [
  "moderation.reason.spam",
  "moderation.reason.hate",
  "moderation.reason.nudity",
  "moderation.reason.harassment",
  "moderation.reason.danger",
  "moderation.reason.terms",
  "moderation.reason.fraud",
];

export default function ModerationReasonModal({
  isOpen,
  action,
  isPending,
  onClose,
  onConfirm,
  resource = "post",
}: ModerationReasonModalProps) {
  const { lang, t } = useI18n();
  const {
    handleSubmit,
    errors,
    isSubmitted,
    justification,
    selectPreset,
    updateJustification,
  } = useModerationReasonForm(action);

  const config = ACTION_CONFIG[action];
  const title = t(config.titleKey[resource]);
  const confirmText = t(config.confirmTextKey[resource]);
  const description = t(config.descriptionKey[resource]);

  const currentLength = justification.length;
  const hasTooLongError =
    errors.justification?.message === "justification_too_long";
  const showValidationError = isSubmitted;
  const justificationError = parseModerationReasonError(
    errors.justification?.message as string,
    lang,
  );

  const handleClose = () => {
    onClose();
  };

  const onValid = (data: Record<string, unknown>) => {
    const { justification } = data as ModerationReasonFormData;
    onConfirm(justification.trim());
  };

  const colorMap = {
    yellow: {
      badge:
        "bg-validation-warning-background/15 text-validation-warning-text border border-validation-warning-border/30",
      focusRing: "focus:border-validation-warning-border",
      counter: "text-validation-warning-text",
    },
    red: {
      badge:
        "bg-validation-error-background/15 text-validation-error-text border border-validation-error-border/30",
      focusRing: "focus:border-validation-error-border",
      counter: "text-validation-error-text",
    },
  } as const;

  const colors = colorMap[config.color as keyof typeof colorMap];

  const footer = (
    <ModalFooter
      confirmText={confirmText}
      onCancel={handleClose}
      onConfirm={handleSubmit(onValid)}
      isPending={isPending}
      confirmVariant={action === "quarantine" ? "default" : "danger"}
      confirmDisabled={isPending || hasTooLongError}
    />
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t("moderation.actionTitle")}
      footer={footer}
      className="max-w-md"
    >
      <div className="flex flex-col gap-4 p-4">
        <div
          className={`inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-lg text-sm font-medium ${colors.badge}`}
        >
          {config.icon}
          {title}
        </div>

        <p className="text-sm text-foreground-secondary-default leading-relaxed">
          {description}
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-widest text-foreground-secondary-default/60 font-bold">
            {t("moderation.reasonLabel")} <span className="text-validation-error-text">*</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESET_REASONS.map((presetKey, idx) => {
              const preset = t(presetKey);
              return (
              <button
                key={idx}
                type="button"
                onClick={() => selectPreset(preset)}
                className={`text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
                  justification === preset
                    ? "bg-accent-fuchsia-background-default/20 border-accent-fuchsia-border-default/50 text-foreground-primary-default"
                    : "bg-button-transparent-background-default border-button-outline-border-disabled text-foreground-secondary-default hover:bg-button-transparent-background-hover"
                }`}
              >
                {preset}
              </button>
              );
            })}
          </div>

          <textarea
            value={justification}
            onChange={(e) => updateJustification(e.target.value)}
            placeholder={t("moderation.reasonPlaceholder")}
            rows={4}
            className={`
              w-full bg-input-background-default rounded-lg border border-input-border-default p-3
              text-sm text-foreground-primary-default placeholder:text-foreground-secondary-default/40
              resize-none outline-none transition-all
              ${colors.focusRing}
            `}
            autoFocus
          />
          <div className="flex items-center justify-between">
            {showValidationError && errors.justification && (
              <p className="text-xs text-validation-error-text">{justificationError}</p>
            )}
            <span
              className={`text-xs ml-auto ${hasTooLongError ? "text-validation-error-text font-bold" : colors.counter}`}
            >
              {currentLength} / {MODERATION_JUSTIFICATION_MAX}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
