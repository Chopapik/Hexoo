import { createAppError } from "@/lib/AppError";
import { isUsernameTaken } from "../../utils/checkUsernameUnique";

export class CheckUsernameAvailabilityUseCase {
  async execute(username: string) {
    if (!username || typeof username !== "string") {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message:
          "[authService.checkUsernameAvailability] Display name is required.",
        details: { field: "name" },
      });
    }

    const normalized = username.trim();

    if (normalized.length === 0) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message:
          "[authService.checkUsernameAvailability] Display name cannot be empty.",
        details: { field: "name" },
      });
    }

    const taken = await isUsernameTaken(normalized);

    return {
      available: !taken,
      username: normalized,
    };
  }
}
