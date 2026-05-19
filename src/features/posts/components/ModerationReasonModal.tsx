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
      badge: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
      focusRing: "focus:ring-yellow-500/30 focus:border-yellow-500/50",
      counter: "text-yellow-400",
    },
    red: {
      badge: "bg-red-500/15 text-red-400 border border-red-500/30",
      focusRing: "focus:ring-red-500/30 focus:border-red-500/50",
      counter: "text-red-400",
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

        <p className="text-sm text-text-neutral leading-relaxed">
          {description}
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-widest text-text-neutral/60 font-bold">
            {t("moderation.reasonLabel")} <span className="text-red-400">*</span>
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
                    ? "bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-100"
                    : "bg-white/5 border-white/10 text-text-neutral hover:bg-white/10"
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
              w-full bg-black/30 rounded-lg border border-white/10 p-3
              text-sm text-text-main placeholder:text-text-neutral/40
              resize-none outline-none transition-all
              focus:ring-1 ${colors.focusRing}
            `}
            autoFocus
          />
          <div className="flex items-center justify-between">
            {showValidationError && errors.justification && (
              <p className="text-xs text-red-500">{justificationError}</p>
            )}
            <span
              className={`text-xs ml-auto ${hasTooLongError ? "text-red-500 font-bold" : "text-white"}`}
            >
              {currentLength} / {MODERATION_JUSTIFICATION_MAX}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
