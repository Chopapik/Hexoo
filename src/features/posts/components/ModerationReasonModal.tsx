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
    title: Record<"post" | "comment", string>;
    confirmText: Record<"post" | "comment", string>;
    description: Record<"post" | "comment", string>;
    icon: React.ReactNode;
    color: string;
  }
> = {
  quarantine: {
    title: {
      post: "Przenieś do kwarantanny",
      comment: "Przenieś komentarz do kwarantanny",
    },
    confirmText: { post: "Kwarantanna", comment: "Kwarantanna" },
    description: {
      post:
        "Post zostanie ukryty dla innych użytkowników do czasu ponownego przeglądu. Podaj powód tej decyzji — zostanie zapisany w bazie danych.",
      comment:
        "Komentarz pozostanie w trybie oczekującym. Podaj powód tej decyzji — zostanie zapisany w bazie danych.",
    },
    icon: <BsShieldExclamation className="w-5 h-5" />,
    color: "yellow",
  },
  reject: {
    title: { post: "Usuń post", comment: "Usuń komentarz" },
    confirmText: { post: "Usuń post", comment: "Usuń komentarz" },
    description: {
      post:
        "Post zostanie trwale usunięty. Podaj powód usunięcia — zostanie zapisany w bazie danych jako uzasadnienie dla tej decyzji.",
      comment:
        "Komentarz zostanie trwale usunięty. Podaj powód usunięcia — zostanie zapisany w bazie danych jako uzasadnienie dla tej decyzji.",
    },
    icon: <BsTrash className="w-5 h-5" />,
    color: "red",
  },
  "reject-ban": {
    title: {
      post: "Usuń post i zbanuj autora",
      comment: "Usuń komentarz i zbanuj autora",
    },
    confirmText: { post: "Usuń i zbanuj", comment: "Usuń i zbanuj" },
    description: {
      post:
        "Post zostanie trwale usunięty, a konto autora zablokowane. Podaj powód — zostanie zapisany w bazie danych.",
      comment:
        "Komentarz zostanie trwale usunięty, a konto autora zablokowane. Podaj powód — zostanie zapisany w bazie danych.",
    },
    icon: <BsTrash className="w-5 h-5" />,
    color: "red",
  },
};

const PRESET_REASONS = [
  "Spam / Niechciane treści",
  "Mowa nienawiści / Przemoc",
  "Nagość / Treści seksualne",
  "Nękanie / Zastraszanie",
  "Treść niebezpieczna / Nielegalna",
  "Łamanie regulaminu serwisu",
  "Oszustwo / Wyłudzanie informacji",
];

export default function ModerationReasonModal({
  isOpen,
  action,
  isPending,
  onClose,
  onConfirm,
  resource = "post",
}: ModerationReasonModalProps) {
  const {
    handleSubmit,
    errors,
    isSubmitted,
    justification,
    selectPreset,
    updateJustification,
  } = useModerationReasonForm(action);

  const config = ACTION_CONFIG[action];
  const title = config.title[resource];
  const confirmText = config.confirmText[resource];
  const description = config.description[resource];

  const currentLength = justification.length;
  const hasTooLongError =
    errors.justification?.message === "justification_too_long";
  const showValidationError = isSubmitted;
  const justificationError = parseModerationReasonError(
    errors.justification?.message as string,
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
      title="Akcja moderatora"
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
            Powód / Uzasadnienie <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESET_REASONS.map((preset, idx) => (
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
            ))}
          </div>

          <textarea
            value={justification}
            onChange={(e) => updateJustification(e.target.value)}
            placeholder="Wpisz uzasadnienie decyzji lub wybierz z listy..."
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
