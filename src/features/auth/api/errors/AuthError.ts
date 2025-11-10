export class AuthError extends Error {
  public code: number;
  public type: "validation" | "critical" | string;
  public data?: any;

  constructor(
    message: string,
    opts?: { code?: number; type?: string; data?: any }
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = "AuthError";
    this.code = opts?.code ?? 500;
    this.type = (opts?.type as any) ?? "critical";
    this.data = opts?.data;
  }
}
