"use client";

import Modal from "@/features/shared/components/layout/Modal";
import ModalFooter from "@/features/shared/components/layout/ModalFooter";
import useReportPostForm from "../hooks/useReportPostForm";
import useReportPost from "../hooks/useReportPost";
import { REPORT_DETAILS_MAX_CHARS } from "../types/post.dto";
import { parseReportPostError } from "../utils/reportPostErrorMap";
import { useI18n } from "@/i18n/useI18n";

const REPORT_REASONS = [
  { id: "spam", labelKey: "report.reason.spam" },
  { id: "hate", labelKey: "report.reason.hate" },
  { id: "nudity", labelKey: "report.reason.nudity" },
  { id: "harassment", labelKey: "report.reason.harassment" },
  { id: "other", labelKey: "report.reason.other" },
] as const;

interface ReportPostModalProps {
  postId: string;
  onClose: () => void;
}

export default function ReportPostModal({
  postId,
  onClose,
}: ReportPostModalProps) {
  const { lang, t } = useI18n();
  const { handleSubmit, setValue, watch, errors, isSubmitted } =
    useReportPostForm();
  const { mutate: report, isPending } = useReportPost(onClose);

  const reason = watch("reason");
  const details = watch("details") ?? "";

  const hasTooLongError =
    errors.details?.message === "report_details_too_long";
  const detailsError = parseReportPostError(
    errors.details?.message as string,
    lang,
  );
  const rootError = parseReportPostError(errors.root?.message as string, lang);

  const onValid = (data: Record<string, unknown>) => {
    report({
      postId,
      reason: data.reason as string,
      details: data.details as string,
    });
  };

  const footer = (
    <ModalFooter
      confirmText={t("report.postConfirm")}
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
      title={t("report.title")}
      footer={footer}
      className="max-w-md"
    >
      <div className="flex flex-col gap-4 p-2">
        <p className="text-sm text-foreground-secondary-default">
          {t("report.postDescription")}
        </p>
        <div className="flex flex-col gap-2">
          {REPORT_REASONS.map((item) => (
            <label
              key={item.id}
              className={`
                flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                ${
                  reason === item.id
                    ? "bg-accent-fuchsia-background-default/10 border-accent-fuchsia-border-default text-foreground-primary-default"
                    : "bg-button-transparent-background-default border-transparent hover:bg-button-transparent-background-hover text-foreground-secondary-default"
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
                    ? "border-accent-fuchsia-border-default"
                    : "border-foreground-secondary-default"
                }`}
              >
                {reason === item.id && (
                  <div className="w-2 h-2 bg-accent-fuchsia-background-default rounded-full" />
                )}
              </div>
              <span className="text-sm font-medium">{t(item.labelKey)}</span>
            </label>
          ))}
        </div>
        {reason === "other" && (
          <div className="mt-2 animate-in fade-in slide-in-from-top-2 flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-foreground-secondary-default/60 font-bold">
              {t("report.detailsLabel")} <span className="text-validation-error-text">*</span>
            </label>
            <textarea
              value={details}
              onChange={(e) =>
                setValue("details", e.target.value, {
                  shouldValidate: isSubmitted,
                })
              }
              placeholder={t("report.detailsPlaceholder")}
              rows={3}
              className="w-full bg-input-background-default rounded-lg border border-input-border-default p-3 text-sm text-input-text-value placeholder:text-input-text-placeholder resize-none outline-none transition-all focus:border-input-border-hover"
            />
            <div className="flex items-center justify-between">
              {isSubmitted && errors.details && (
                <p className="text-xs text-validation-error-text">{detailsError}</p>
              )}
              <span
                className={`text-xs ml-auto ${hasTooLongError ? "text-validation-error-text font-bold" : "text-foreground-primary-default"}`}
              >
                {details.length} / {REPORT_DETAILS_MAX_CHARS}
              </span>
            </div>
          </div>
        )}
        {isSubmitted && errors.root && (
          <p className="text-xs text-validation-error-text mt-1">{rootError}</p>
        )}
      </div>
    </Modal>
  );
}
