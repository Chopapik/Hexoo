export type ModerationStatus = "approved" | "pending" | "rejected";

export interface ContentBase<TTimestamp> {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string | null;
  text: string;

  likesCount: number;
  isLikedByMe?: boolean;

  createdAt: TTimestamp;
  updatedAt?: TTimestamp;

  moderationStatus: ModerationStatus;
  flaggedReasons?: string[];
  isNSFW: boolean;
}
