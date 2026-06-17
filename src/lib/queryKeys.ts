export const queryKeys = {
  admin: {
    activityLogs: ["admin", "activityLogs"] as const,
    allUsers: ["admin", "allUsers"] as const,
  },
  comments: {
    all: ["comments"] as const,
    byPost: (postId: string) => ["comments", postId] as const,
  },
  moderator: {
    queue: {
      all: ["moderator", "queue"] as const,
      byTab: (tab: string) => ["moderator", "queue", tab] as const,
    },
  },
  posts: {
    all: ["posts"] as const,
    byUser: (userId: string) => ["posts", "user", userId] as const,
  },
  profile: {
    byUid: (uid: string) => ["profile", uid] as const,
  },
  users: {
    byIds: (uidsKey: string) => ["users", "byIds", uidsKey] as const,
  },
};
