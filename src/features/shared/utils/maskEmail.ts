export default function maskEmail(email: string | null | undefined) {
  if (!email || typeof email !== "string") return null;

  const [local, domain] = email.split("@");
  if (!local || !domain) return email;

  const visible = Math.min(2, local.length);
  const maskedLocal =
    local.slice(0, visible) + "*".repeat(Math.max(local.length - visible, 1));

  return `${maskedLocal}@${domain}`;
}
