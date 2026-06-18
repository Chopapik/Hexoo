import { ModerationStatus } from "@/features/shared/types/content.type";

export type FakeModerationOutcome =
  | "approved"
  | "pending"
  | "rejected"
  | "error"
  | "timeout";

export type FakeModerationRequest = {
  text?: string;
  imageFile?: File | null;
};

export type FakeModerationResult = {
  status: ModerationStatus;
  flagged: boolean;
  categories: string[];
  categoryScores: Record<string, number>;
};

export class FakeModerationProvider {
  private outcome: FakeModerationOutcome;
  public readonly calls: FakeModerationRequest[] = [];

  constructor(outcome: FakeModerationOutcome = "approved") {
    this.outcome = outcome;
  }

  setOutcome(outcome: FakeModerationOutcome): void {
    this.outcome = outcome;
  }

  reset(): void {
    this.calls.length = 0;
    this.outcome = "approved";
  }

  async assess(request: FakeModerationRequest): Promise<FakeModerationResult> {
    this.calls.push(request);

    if (this.outcome === "error") {
      throw new Error("Fake moderation provider error");
    }

    if (this.outcome === "timeout") {
      throw new Error("Fake moderation provider timeout");
    }

    if (this.outcome === "rejected") {
      return {
        status: ModerationStatus.Rejected,
        flagged: true,
        categories: ["violence/graphic"],
        categoryScores: { "violence/graphic": 0.99 },
      };
    }

    if (this.outcome === "pending") {
      return {
        status: ModerationStatus.Pending,
        flagged: true,
        categories: ["harassment"],
        categoryScores: { harassment: 0.9 },
      };
    }

    return {
      status: ModerationStatus.Approved,
      flagged: false,
      categories: [],
      categoryScores: {},
    };
  }
}
