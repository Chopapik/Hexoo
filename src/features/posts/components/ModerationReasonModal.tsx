"use client";

import { useState } from "react";
import Modal from "@/features/shared/components/layout/Modal";
import ModalFooter from "@/features/shared/components/layout/ModalFooter";
import { BsShieldExclamation, BsTrash } from "react-icons/bs";

type ModerationAction = "quarantine" | "reject" | "reject-ban";

interface ModerationReasonModalProps {
  isOpen: boolean;
  action: ModerationAction;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (justification: string) => void;
}

const ACTION_CONFIG: Record<
  ModerationAction,
  { title: string; confirmText: string; description: string; icon: React.ReactNode; color: string }
> = {
  quarantine: {
    title: "Przenieś do kwarantanny",
    confirmText: "Kwarantanna",
    description: "Post zostanie ukryty dla innych użytkowników do czasu ponownego przeglądu. Podaj powód tej decyzji — zostanie zapisany w bazie danych.",
    icon: <BsShieldExclamation className="w-5 h-5" />,
    color: "yellow",
  },
  reject: {
    title: "Usuń post",
    confirmText: "Usuń post",
    description: "Post zostanie trwale usunięty. Podaj powód usunięcia — zostanie zapisany w bazie danych jako uzasadnienie dla tej decyzji.",
    icon: <BsTrash className="w-5 h-5" />,
    color: "red",
  },
  "reject-ban": {
    title: "Usuń post i zbanuj autora",
    confirmText: "Usuń i zbanuj",
    description: "Post zostanie trwale usunięty, a konto autora zablokowane. Podaj powód — zostanie zapisany w bazie danych.",
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
}: ModerationReasonModalProps) {
  const [justification, setJustification] = useState("");
  const config = ACTION_CONFIG[action];
  
  const currentLength = justification.length;
  const isTooShort = justification.trim().length < 5;
  const isTooLong = currentLength > 500;
  const isReady = !isTooShort && !isTooLong;

  const handleClose = () => {
    setJustification("");
    onClose();
  };

  const handleConfirm = () => {
    if (!isReady) return;
    const val = justification.trim();
    setJustification("");
    onConfirm(val);
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
      confirmText={config.confirmText}
      onCancel={handleClose}
      onConfirm={handleConfirm}
      isPending={isPending}
      confirmVariant={action === "quarantine" ? "default" : "danger"}
      confirmDisabled={!isReady}
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
        {/* Action badge */}
        <div
          className={`inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-lg text-sm font-medium ${colors.badge}`}
        >
          {config.icon}
          {config.title}
        </div>

        {/* Description */}
        <p className="text-sm text-text-neutral leading-relaxed">
          {config.description}
        </p>

        {/* Reason textarea */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-widest text-text-neutral/60 font-bold">
            Powód / Uzasadnienie <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESET_REASONS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setJustification(preset)}
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
            onChange={(e) => setJustification(e.target.value)}
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
          <div className="flex items-center justify-end">
            <span className={`text-xs ${isTooLong ? "text-red-500 font-bold" : "text-white"}`}>
              {currentLength} / 500
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
