import { useCallback } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/useI18n";

export default function useRecaptcha() {
  const { t } = useI18n();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const getRecaptchaToken = useCallback(
    async (action: string) => {
      if (!executeRecaptcha) {
        toast.error(t("recaptcha.notReady"));
        return null;
      }

      try {
        return await executeRecaptcha(action);
      } catch {
        toast.error(t("recaptcha.verifyError"));
        return null;
      }
    },
    [executeRecaptcha, t]
  );

  return { getRecaptchaToken };
}
