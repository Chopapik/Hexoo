import type { UserEntity } from "@/features/users/types/user.entity";

function base64UrlDecode(value: string): string {
  const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  return Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64")
    .toString("utf8");
}

export function getJwtIssuedAt(token: string): Date | null {
  const payload = token.split(".")[1];
  if (!payload) return null;

  try {
    const decoded = JSON.parse(base64UrlDecode(payload)) as {
      iat?: unknown;
      auth_time?: unknown;
    };
    const issuedAtSeconds =
      typeof decoded.iat === "number"
        ? decoded.iat
        : typeof decoded.auth_time === "number"
          ? decoded.auth_time
          : null;

    return issuedAtSeconds === null
      ? null
      : new Date(issuedAtSeconds * 1000);
  } catch {
    return null;
  }
}

export function isTokenIssuedBeforeSessionCutoff(
  token: string,
  userData: Pick<UserEntity, "sessionInvalidatedAt">,
): boolean {
  const issuedAt = getJwtIssuedAt(token);

  return Boolean(
    issuedAt &&
      userData.sessionInvalidatedAt &&
      issuedAt.getTime() < userData.sessionInvalidatedAt.getTime(),
  );
}
