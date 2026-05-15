import { createAppError } from "@/lib/AppError";

import type { AuthRepository } from "../../repositories/authRepository.interface";

export class CheckEmailAvailabilityUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(email: string) {
    if (!email || typeof email !== "string") {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[auth.checkEmailAvailability] Email is required.",
      });
    }

    const normalized = email.trim().toLowerCase();

    if (normalized.length === 0) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[auth.checkEmailAvailability] Email cannot be empty.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalized)) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[auth.checkEmailAvailability] Invalid email format.",
      });
    }

    const user = await this.authRepository.getUserByEmail(normalized);

    return {
      available: !user,
      email: normalized,
    };
  }
}
