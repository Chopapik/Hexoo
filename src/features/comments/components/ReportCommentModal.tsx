"use client";

import Modal from "@/features/shared/components/layout/Modal";
import ModalFooter from "@/features/shared/components/layout/ModalFooter";
import useReportCommentForm from "../hooks/useReportCommentForm";
import useReportComment from "../hooks/useReportComment";
import { REPORT_DETAILS_MAX_CHARS } from "../types/comment.dto";
import { parseReportCommentError } from "../utils/reportCommentErrorMap";

const REPORT_REASONS = [
  { id: "spam", label: "To jest spam" },
  { id: "hate", label: "Mowa nienawiści / Przemoc" },
  { id: "nudity", label: "Nagość / Treści seksualne" },
  { id: "harassment", label: "Nękanie" },
  { id: "other", label: "Inny powód" },
] as const;

interface ReportCommentModalProps {
  commentId: string;
  onClose: () => void;
}

export default function ReportCommentModal({
  commentId,
  onClose,
}: ReportCommentModalProps) {
  const { handleSubmit, setValue, watch, errors, isSubmitted } =
    useReportCommentForm();
  const { mutate: report, isPending } = useReportComment(onClose);

  const reason = watch("reason");
  const details = watch("details") ?? "";

  const hasTooLongError =
    errors.details?.message === "report_details_too_long";
  const detailsError = parseReportCommentError(
    errors.details?.message as string,
  );
  const rootError = parseReportCommentError(errors.root?.message as string);

  const onValid = (data: Record<string, unknown>) => {
    report({
      commentId,
      reason: data.reason as string,
      details: data.details as string,
    });
  };

  const footer = (
    <ModalFooter
      confirmText="Zgłoś komentarz"
      onCancel={onClose}
      onConfirm={handleSubmit(onValid)}
      isPending={isPending}
      confirmDisabled={isPending || hasTooLongError}
    />
  );

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Zgłoś naruszenie"
      footer={footer}
      className="max-w-md"
    >
      <div className="flex flex-col gap-4 p-2">
        <p className="text-sm text-text-neutral">
          Pomóż nam zrozumieć, co jest nie tak z tym komentarzem. Jeśli
          komentarz narusza zasady, zostanie usunięty.
        </p>
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
                onChange={() =>
                  setValue("reason", item.id, { shouldValidate: isSubmitted })
                }
                className="hidden"
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
        {reason === "other" && (
          <div className="mt-2 animate-in fade-in slide-in-from-top-2 flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-text-neutral/60 font-bold">
              Opisz powód zgłoszenia <span className="text-red-400">*</span>
            </label>
            <textarea
              value={details}
              onChange={(e) =>
                setValue("details", e.target.value, {
                  shouldValidate: isSubmitted,
                })
              }
              placeholder="Opisz problem..."
              rows={3}
              className="w-full bg-black/30 rounded-lg border border-white/10 p-3 text-sm text-text-main placeholder:text-text-neutral/40 resize-none outline-none transition-all focus:ring-1 focus:ring-fuchsia-500/30 focus:border-fuchsia-500/50"
            />
            <div className="flex items-center justify-between">
              {isSubmitted && errors.details && (
                <p className="text-xs text-red-500">{detailsError}</p>
              )}
              <span
                className={`text-xs ml-auto ${hasTooLongError ? "text-red-500 font-bold" : "text-white"}`}
              >
                {details.length} / {REPORT_DETAILS_MAX_CHARS}
              </span>
            </div>
          </div>
        )}
        {isSubmitted && errors.root && (
          <p className="text-xs text-red-500 mt-1">{rootError}</p>
        )}
      </div>
    </Modal>
  );
}
