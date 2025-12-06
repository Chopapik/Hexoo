import { useCallback } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import toast from "react-hot-toast";

export default function useRecaptcha() {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const getRecaptchaToken = useCallback(
    async (action: string) => {
      if (!executeRecaptcha) {
        toast.error(
          "System zabezpieczeń nie jest gotowy. Spróbuj odświeżyć stronę."
        );
        return null;
      }

      try {
        return await executeRecaptcha(action);
      } catch {
        toast.error("Błąd weryfikacji. Spróbuj ponownie.");
        return null;
      }
    },
    [executeRecaptcha]
  );

  return { getRecaptchaToken };
}
