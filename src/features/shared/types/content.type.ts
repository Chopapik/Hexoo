export type ModerationStatus = "approved" | "pending" | "rejected";

export interface ContentBase {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string | null;
  text: string;

  likesCount: number;
  isLikedByMe?: boolean;

  createdAt: Date;
  updatedAt?: Date;

  moderationStatus: ModerationStatus;
  flaggedReasons?: string[];
  isNSFW: boolean;
}
