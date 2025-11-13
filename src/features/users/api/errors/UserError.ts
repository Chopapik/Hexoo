export class UserError extends Error {
  code: number;
  type: string;

  constructor(message: string, options: { code?: number; type?: string } = {}) {
    super(message);
    this.name = "UserError";
    this.code = options.code ?? 400;
    this.type = options.type ?? "user";
  }
}
