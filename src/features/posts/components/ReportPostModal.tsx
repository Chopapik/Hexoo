"use client";

import { useState } from "react";
import Modal from "@/features/shared/components/layout/Modal";
import Button from "@/features/shared/components/ui/Button";
import TextInput from "@/features/shared/components/ui/TextInput";
import useReportPost from "../hooks/useReportPost";

const REPORT_REASONS = [
  { id: "spam", label: "To jest spam" },
  { id: "hate", label: "Mowa nienawiści / Przemoc" },
  { id: "nudity", label: "Nagość / Treści seksualne" },
  { id: "harassment", label: "Nękanie" },
  { id: "other", label: "Inny powód" },
];

interface ReportPostModalProps {
  postId: string;
  onClose: () => void;
}

export default function ReportPostModal({
  postId,
  onClose,
}: ReportPostModalProps) {
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");

  const { mutate: report, isPending } = useReportPost(onClose);

  const handleSubmit = () => {
    report({ postId, reason, details });
  };

  const footer = (
    <div className="flex gap-3 justify-end w-full">
      <Button
        text="Anuluj"
        variant="icon-fuchsia-ghost"
        size="sm"
        onClick={onClose}
        disabled={isPending}
      />
      <Button
        text={isPending ? "Wysyłanie..." : "Zgłoś post"}
        variant="gradient-fuchsia" // Użyjmy czerwonego stylu jeśli masz, jeśli nie to fuksja
        size="sm"
        onClick={handleSubmit}
        disabled={isPending}
      />
    </div>
  );

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Zgłoś naruszenie"
      footer={footer}
      className="max-w-md" // Węższy modal
    >
      <div className="flex flex-col gap-4 p-2">
        <p className="text-sm text-text-neutral">
          Pomóż nam zrozumieć, co jest nie tak z tym postem. Jeśli post narusza
          zasady, zostanie usunięty.
        </p>

        {/* Lista powodów (Radio-like) */}
        <div className="flex flex-col gap-2">
          {REPORT_REASONS.map((item) => (
            <label
              key={item.id}
              className={`
                flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                ${
                  reason === item.id
                    ? "bg-fuchsia-500/10 border-fuchsia-500 text-white"
                    : "bg-white/5 border-transparent hover:bg-white/10 text-text-neutral"
                }
              `}
            >
              <input
                type="radio"
                name="reportReason"
                value={item.id}
                checked={reason === item.id}
                onChange={(e) => setReason(e.target.value)}
                className="hidden" // Ukrywamy natywne radio, stylujemy kontener
              />
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  reason === item.id
                    ? "border-fuchsia-500"
                    : "border-text-neutral"
                }`}
              >
                {reason === item.id && (
                  <div className="w-2 h-2 bg-fuchsia-500 rounded-full" />
                )}
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </label>
          ))}
        </div>

        {/* Opcjonalny opis */}
        {reason === "other" && (
          <div className="mt-2 animate-in fade-in slide-in-from-top-2">
            <TextInput
              label="Dodatkowe informacje (opcjonalne)"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Opisz problem..."
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
